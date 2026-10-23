import { useCallback, useId, useState } from 'react';
import { apiClient, type ApiClient } from '../../api/client';
import { ApiError, API_ERROR_CODES } from '../../api/errors';
import { TENANT_STATUS_NAMES, type Tenant } from '../../api/governance';
import { useCursorPages } from '../../api/useCursorPages';
import { ApiErrorMessage } from '../../components/ApiErrorMessage';
import { Button } from '../../components/Button';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { DataTable, type DataTableColumn } from '../../components/DataTable';
import { Pagination } from '../../components/Pagination';
import { StatusMessage } from '../../components/StatusMessage';
import { Timestamp } from '../../components/Timestamp';
import { useAction } from './useAction';
import { useAdminLabels } from './useAdminLabels';

/** Tenants per page. */
export const TENANTS_PAGE_SIZE = 25;

const ACTIVE = TENANT_STATUS_NAMES.indexOf('Active');
const SUSPENDED = TENANT_STATUS_NAMES.indexOf('Suspended');

type TenantsClient = Pick<ApiClient, 'get' | 'getWithETag' | 'mutate'>;

export interface TenantsPageProps {
  /** The API client; tests pass their own. Must be stable across renders. */
  readonly client?: TenantsClient;
}

/** The ETag of a tenant as listed; a tenant whose status changed since the list was loaded is a conflict. */
async function etagOfListedTenant(client: TenantsClient, tenant: Tenant): Promise<string> {
  const current = await client.getWithETag('/api/v1/admin/tenants/{id}', { path: { id: tenant.id } });
  if (current.data.status !== tenant.status || current.data.name !== tenant.name) {
    throw new ApiError(409, {
      code: API_ERROR_CODES.concurrencyConflict,
      message: 'The tenant changed since the list was loaded.',
      correlationId: '',
      retriable: false,
    });
  }
  return current.etag ?? '';
}

/**
 * Tenants of the platform (platform operators only): a paginated list, creating a tenant, and suspending or
 * reactivating one after confirmation. A suspended tenant's members lose access immediately.
 */
export function TenantsPage({ client = apiClient }: TenantsPageProps) {
  const { t, tenantStatus } = useAdminLabels();
  const nameId = useId();
  const residencyId = useId();
  const [name, setName] = useState('');
  const [residency, setResidency] = useState('');
  const [pending, setPending] = useState<Tenant | null>(null);
  const action = useAction();
  const load = useCallback(
    (cursor: string | undefined, signal: AbortSignal) =>
      client.get('/api/v1/admin/tenants', { query: { Limit: TENANTS_PAGE_SIZE, Cursor: cursor }, signal }),
    [client],
  );
  const pages = useCursorPages(load);
  const reload = () => {
    action.clear();
    pages.reload();
  };

  const columns: DataTableColumn<Tenant>[] = [
    { key: 'name', header: t('tenants.name'), render: (row) => row.name },
    { key: 'residency', header: t('tenants.residency'), render: (row) => row.residencyPolicy },
    { key: 'status', header: t('tenants.status'), render: (row) => tenantStatus(row.status) },
    { key: 'createdAt', header: t('tenants.createdAt'), render: (row) => <Timestamp value={row.createdAt} /> },
    {
      key: 'actions',
      header: t('tenants.actions'),
      render: (row) => (
        <Button
          variant="secondary"
          disabled={action.busy}
          aria-label={t(row.status === ACTIVE ? 'tenants.suspendLabel' : 'tenants.reactivateLabel', { name: row.name })}
          onClick={() => {
            setPending(row);
          }}
        >
          {t(row.status === ACTIVE ? 'tenants.suspend' : 'tenants.reactivate')}
        </Button>
      ),
    },
  ];

  const changeStatus = (tenant: Tenant) => {
    const suspend = tenant.status === ACTIVE;
    void action
      .run(
        async () => {
          const ifMatch = await etagOfListedTenant(client, tenant);
          return client.mutate('patch', '/api/v1/admin/tenants/{id}', {
            path: { id: tenant.id },
            ifMatch,
            body: { status: suspend ? SUSPENDED : ACTIVE },
          });
        },
        t(suspend ? 'tenants.suspended' : 'tenants.reactivated', { name: tenant.name }),
        pages.reload,
      )
      .finally(() => {
        setPending(null);
      });
  };

  return (
    <section aria-labelledby="tenants-title">
      <h1 id="tenants-title">{t('tenants.title')}</h1>
      <p>{t('tenants.intro')}</p>
      {action.notice && <StatusMessage tone="success">{action.notice}</StatusMessage>}
      {action.error !== null && <ApiErrorMessage error={action.error} onReload={reload} />}
      {pages.status === 'loading' && <StatusMessage tone="info">{t('tenants.loading')}</StatusMessage>}
      {pages.status === 'error' && (
        <ApiErrorMessage error={pages.error} forbiddenMessage={t('tenants.forbidden')} onReload={reload} />
      )}
      {pages.data && (
        <>
          <DataTable<Tenant>
            caption={t('tenants.caption')}
            columns={columns}
            rows={pages.data.items}
            rowKey={(row) => row.id}
          />
          <Pagination
            label={t('tenants.pagination')}
            page={pages.page}
            hasPrevious={pages.hasPrevious}
            hasNext={pages.hasNext}
            onPrevious={pages.previous}
            onNext={pages.next}
          />
          <form
            className="cw-form"
            onSubmit={(event) => {
              event.preventDefault();
              void action.run(
                () =>
                  client.mutate('post', '/api/v1/admin/tenants', {
                    body: { name: name.trim(), residencyPolicy: residency.trim() === '' ? null : residency.trim() },
                  }),
                t('tenants.created', { name: name.trim() }),
                () => {
                  setName('');
                  setResidency('');
                  pages.reload();
                },
              );
            }}
          >
            <fieldset>
              <legend>{t('tenants.createLegend')}</legend>
              <label htmlFor={nameId}>{t('tenants.name')}</label>
              <input
                id={nameId}
                value={name}
                required
                maxLength={200}
                onChange={(event) => {
                  setName(event.target.value);
                }}
              />
              <label htmlFor={residencyId}>{t('tenants.residencyOptional')}</label>
              <input
                id={residencyId}
                value={residency}
                maxLength={64}
                onChange={(event) => {
                  setResidency(event.target.value);
                }}
              />
              <Button type="submit" disabled={action.busy || name.trim() === ''}>
                {t('tenants.create')}
              </Button>
            </fieldset>
          </form>
        </>
      )}
      {pending && (
        <ConfirmDialog
          title={t(pending.status === ACTIVE ? 'tenants.suspendDialog.title' : 'tenants.reactivateDialog.title', {
            name: pending.name,
          })}
          confirmLabel={t(pending.status === ACTIVE ? 'tenants.suspend' : 'tenants.reactivate')}
          cancelLabel={t('dialog.cancel')}
          busy={action.busy}
          onCancel={() => {
            setPending(null);
          }}
          onConfirm={() => {
            changeStatus(pending);
          }}
        >
          <p>{t(pending.status === ACTIVE ? 'tenants.suspendDialog.body' : 'tenants.reactivateDialog.body')}</p>
        </ConfirmDialog>
      )}
    </section>
  );
}
