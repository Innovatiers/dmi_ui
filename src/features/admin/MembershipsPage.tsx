import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { apiClient, type ApiClient } from '../../api/client';
import { GRANT_SCOPE_NAMES, MEMBERSHIP_STATUS_NAMES, type Grant, type MembershipDetails } from '../../api/governance';
import { useApiQuery } from '../../api/useApiQuery';
import { useCursorPages } from '../../api/useCursorPages';
import { ASSIGNABLE_ROLES, roleValue } from '../../auth/permissions';
import { ApiErrorMessage } from '../../components/ApiErrorMessage';
import { Button } from '../../components/Button';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { DataTable, type DataTableColumn } from '../../components/DataTable';
import { Pagination } from '../../components/Pagination';
import { StatusMessage } from '../../components/StatusMessage';
import { Timestamp } from '../../components/Timestamp';
import { useAction } from './useAction';
import { useAdminLabels } from './useAdminLabels';

/** Members per page. */
export const MEMBERSHIPS_PAGE_SIZE = 25;

const TENANT_SCOPE = GRANT_SCOPE_NAMES.indexOf('Tenant');
const ACTIVE_STATUS = MEMBERSHIP_STATUS_NAMES.indexOf('Active');

type MembershipsClient = Pick<ApiClient, 'get' | 'getWithETag' | 'mutate'>;

export interface MembershipsPageProps {
  /** The API client; tests pass their own. Must be stable across renders. */
  readonly client?: MembershipsClient;
}

interface EditorProps {
  readonly id: string;
  readonly client: MembershipsClient;
  readonly onChanged: () => void;
  readonly onClose: () => void;
}

function MembershipEditor({ id, client, onChanged, onClose }: EditorProps) {
  const { t, role, grantScope, membershipStatus } = useAdminLabels();
  const roleFieldId = useId();
  const scopeFieldId = useId();
  const objectFieldId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [version, setVersion] = useState(0);
  const [chosenRole, setChosenRole] = useState<number | null>(null);
  const [scope, setScope] = useState(TENANT_SCOPE);
  const [objectId, setObjectId] = useState('');
  const [confirmDisable, setConfirmDisable] = useState(false);
  const action = useAction();

  const load = useCallback(
    (signal: AbortSignal) => client.getWithETag('/api/v1/admin/memberships/{id}', { path: { id }, signal }),
    [client, id],
  );
  const detail = useApiQuery(load, version);

  const loaded = detail.data !== undefined;
  useEffect(() => {
    if (loaded) {
      headingRef.current?.focus();
    }
  }, [loaded]);

  const refresh = () => {
    setChosenRole(null);
    setVersion((value) => value + 1);
    onChanged();
  };
  const reloadAfterConflict = () => {
    action.clear();
    refresh();
  };

  if (detail.status === 'loading') {
    return <StatusMessage tone="info">{t('memberships.editor.loading')}</StatusMessage>;
  }
  if (!detail.data) {
    return (
      <ApiErrorMessage
        error={detail.error}
        forbiddenMessage={t('memberships.forbidden')}
        onReload={reloadAfterConflict}
      />
    );
  }

  const membership: MembershipDetails = detail.data.data;
  const etag = detail.data.etag ?? '';
  const selectedRole = chosenRole ?? membership.role;
  const active = membership.status === ACTIVE_STATUS;
  const needsObject = scope !== TENANT_SCOPE;

  const grantColumns: DataTableColumn<Grant>[] = [
    { key: 'scope', header: t('memberships.grants.scope'), render: (grant) => grantScope(grant.scope) },
    {
      key: 'object',
      header: t('memberships.grants.object'),
      render: (grant) => grant.scopeObjectId ?? t('memberships.grants.wholeTenant'),
    },
    {
      key: 'createdAt',
      header: t('memberships.grants.createdAt'),
      render: (grant) => <Timestamp value={grant.createdAt} />,
    },
    {
      key: 'actions',
      header: t('memberships.grants.actions'),
      render: (grant) => (
        <Button
          variant="secondary"
          disabled={action.busy}
          aria-label={t('memberships.grants.removeLabel', {
            scope: grantScope(grant.scope),
            object: grant.scopeObjectId ?? t('memberships.grants.wholeTenant'),
          })}
          onClick={() => {
            void action.run(
              () =>
                client.mutate('delete', '/api/v1/admin/memberships/{id}/grants/{grantId}', {
                  path: { id, grantId: grant.id },
                }),
              t('memberships.grants.removed'),
              refresh,
            );
          }}
        >
          {t('memberships.grants.remove')}
        </Button>
      ),
    },
  ];

  return (
    <section aria-labelledby="membership-editor-title" className="cw-panel">
      <h2 id="membership-editor-title" ref={headingRef} tabIndex={-1}>
        {t('memberships.editor.title', { subject: membership.subjectId })}
      </h2>
      <p>
        {t('memberships.editor.summary', {
          role: role(membership.role),
          status: membershipStatus(membership.status),
        })}
      </p>
      {action.notice && <StatusMessage tone="success">{action.notice}</StatusMessage>}
      {action.error !== null && <ApiErrorMessage error={action.error} onReload={reloadAfterConflict} />}

      <form
        className="cw-form"
        onSubmit={(event) => {
          event.preventDefault();
          void action.run(
            () =>
              client.mutate('put', '/api/v1/admin/memberships/{id}/role', {
                path: { id },
                ifMatch: etag,
                body: { role: selectedRole },
              }),
            t('memberships.editor.roleChanged'),
            refresh,
          );
        }}
      >
        <label htmlFor={roleFieldId}>{t('memberships.editor.role')}</label>
        <select
          id={roleFieldId}
          value={selectedRole}
          onChange={(event) => {
            setChosenRole(Number(event.target.value));
          }}
        >
          {ASSIGNABLE_ROLES.map((name) => (
            <option key={name} value={roleValue(name)}>
              {t(`roles.${name}`)}
            </option>
          ))}
        </select>
        <Button type="submit" disabled={action.busy || selectedRole === membership.role}>
          {t('memberships.editor.saveRole')}
        </Button>
      </form>

      <DataTable<Grant>
        caption={t('memberships.grants.caption')}
        columns={grantColumns}
        rows={membership.grants}
        rowKey={(grant) => grant.id}
      />
      <p>{t('memberships.grants.emptyMeansTenant')}</p>

      <form
        className="cw-form"
        onSubmit={(event) => {
          event.preventDefault();
          void action.run(
            () =>
              client.mutate('post', '/api/v1/admin/memberships/{id}/grants', {
                path: { id },
                body: { scope, scopeObjectId: needsObject ? objectId.trim() : null },
              }),
            t('memberships.grants.added'),
            () => {
              setObjectId('');
              refresh();
            },
          );
        }}
      >
        <fieldset>
          <legend>{t('memberships.grants.addLegend')}</legend>
          <label htmlFor={scopeFieldId}>{t('memberships.grants.scope')}</label>
          <select
            id={scopeFieldId}
            value={scope}
            onChange={(event) => {
              setScope(Number(event.target.value));
            }}
          >
            {GRANT_SCOPE_NAMES.map((name, value) => (
              <option key={name} value={value}>
                {t(`grantScope.${name}`)}
              </option>
            ))}
          </select>
          <label htmlFor={objectFieldId}>{t('memberships.grants.objectId')}</label>
          <input
            id={objectFieldId}
            value={objectId}
            disabled={!needsObject}
            required={needsObject}
            onChange={(event) => {
              setObjectId(event.target.value);
            }}
          />
          <Button type="submit" disabled={action.busy || (needsObject && objectId.trim() === '')}>
            {t('memberships.grants.add')}
          </Button>
        </fieldset>
      </form>

      <div className="cw-actions">
        {active && (
          <Button
            variant="secondary"
            disabled={action.busy}
            onClick={() => {
              setConfirmDisable(true);
            }}
          >
            {t('memberships.editor.disable')}
          </Button>
        )}
        <Button variant="secondary" onClick={onClose}>
          {t('memberships.editor.close')}
        </Button>
      </div>

      {confirmDisable && (
        <ConfirmDialog
          title={t('memberships.disableDialog.title', { subject: membership.subjectId })}
          confirmLabel={t('memberships.disableDialog.confirm')}
          cancelLabel={t('dialog.cancel')}
          busy={action.busy}
          onCancel={() => {
            setConfirmDisable(false);
          }}
          onConfirm={() => {
            void action
              .run(
                () => client.mutate('post', '/api/v1/admin/memberships/{id}/disable', { path: { id }, ifMatch: etag }),
                t('memberships.editor.disabled'),
                refresh,
              )
              .finally(() => {
                setConfirmDisable(false);
              });
          }}
        >
          <p>{t('memberships.disableDialog.body')}</p>
        </ConfirmDialog>
      )}
    </section>
  );
}

/**
 * Members of the caller's tenant (administrators): a paginated list, and per member the role, the scope grants and
 * disabling (with confirmation). Changes send the ETag of the loaded version; a change by someone else in between
 * gives a "changed, reload" message with a reload action.
 */
export function MembershipsPage({ client = apiClient }: MembershipsPageProps) {
  const { t, role, membershipStatus } = useAdminLabels();
  const [selected, setSelected] = useState<string | null>(null);
  const load = useCallback(
    (cursor: string | undefined, signal: AbortSignal) =>
      client.get('/api/v1/admin/memberships', { query: { Limit: MEMBERSHIPS_PAGE_SIZE, Cursor: cursor }, signal }),
    [client],
  );
  const pages = useCursorPages(load);

  const columns: DataTableColumn<MembershipDetails>[] = [
    { key: 'subject', header: t('memberships.subject'), render: (row) => row.subjectId },
    { key: 'role', header: t('memberships.role'), render: (row) => role(row.role) },
    { key: 'status', header: t('memberships.status'), render: (row) => membershipStatus(row.status) },
    {
      key: 'scope',
      header: t('memberships.scope'),
      render: (row) =>
        row.grants.length === 0
          ? t('memberships.grants.wholeTenant')
          : t('memberships.grantCount', { count: row.grants.length }),
    },
    { key: 'createdAt', header: t('memberships.createdAt'), render: (row) => <Timestamp value={row.createdAt} /> },
    {
      key: 'actions',
      header: t('memberships.actions'),
      render: (row) => (
        <Button
          variant="secondary"
          aria-label={t('memberships.manageLabel', { subject: row.subjectId })}
          onClick={() => {
            setSelected(row.id);
          }}
        >
          {t('memberships.manage')}
        </Button>
      ),
    },
  ];

  return (
    <section aria-labelledby="memberships-title">
      <h1 id="memberships-title">{t('memberships.title')}</h1>
      <p>{t('memberships.intro')}</p>
      {pages.status === 'loading' && <StatusMessage tone="info">{t('memberships.loading')}</StatusMessage>}
      {pages.status === 'error' && (
        <ApiErrorMessage error={pages.error} forbiddenMessage={t('memberships.forbidden')} onReload={pages.reload} />
      )}
      {pages.data && (
        <>
          <DataTable<MembershipDetails>
            caption={t('memberships.caption')}
            columns={columns}
            rows={pages.data.items}
            rowKey={(row) => row.id}
          />
          <Pagination
            label={t('memberships.pagination')}
            page={pages.page}
            hasPrevious={pages.hasPrevious}
            hasNext={pages.hasNext}
            onPrevious={pages.previous}
            onNext={pages.next}
          />
        </>
      )}
      {selected && (
        <MembershipEditor
          key={selected}
          id={selected}
          client={client}
          onChanged={pages.reload}
          onClose={() => {
            setSelected(null);
          }}
        />
      )}
    </section>
  );
}
