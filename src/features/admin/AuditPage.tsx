import { useCallback, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apiClient, type ApiClient } from '../../api/client';
import { auditExportMediaType, type AuditEvent, type AuditExportFormat, type AuditFilter } from '../../api/governance';
import { useCursorPages } from '../../api/useCursorPages';
import { ApiErrorMessage } from '../../components/ApiErrorMessage';
import { Button } from '../../components/Button';
import { DataTable, type DataTableColumn } from '../../components/DataTable';
import { Pagination } from '../../components/Pagination';
import { StatusMessage } from '../../components/StatusMessage';
import { Timestamp } from '../../components/Timestamp';
import { localInputToUtc } from '../../format/dateTime';
import { formatMaskedState } from '../../format/maskState';
import { saveFile as defaultSaveFile, type SaveFile } from '../../format/saveFile';
import { useAction } from './useAction';

/** Audit events per page. */
export const AUDIT_PAGE_SIZE = 50;

type AuditClient = Pick<ApiClient, 'get' | 'download'>;

export interface AuditPageProps {
  /** The API client; tests pass their own. Must be stable across renders. */
  readonly client?: AuditClient;
  /** Offers an exported file to the viewer; tests pass their own. */
  readonly saveFile?: SaveFile;
}

const TEXT_FIELDS = ['actor', 'action', 'entityType', 'entityId', 'correlationId'] as const;

type FilterField = 'from' | 'to' | (typeof TEXT_FIELDS)[number];

/** The filter fields of the form, as typed (times in the viewer's local time); a missing field is empty. */
type FilterDraft = ReadonlyMap<FilterField, string>;

const EMPTY_DRAFT: FilterDraft = new Map();

function toFilter(draft: FilterDraft): AuditFilter {
  const text = (name: FilterField) => {
    const value = (draft.get(name) ?? '').trim();
    return value === '' ? null : value;
  };
  return {
    from: localInputToUtc(draft.get('from') ?? ''),
    to: localInputToUtc(draft.get('to') ?? ''),
    actor: text('actor'),
    action: text('action'),
    entityType: text('entityType'),
    entityId: text('entityId'),
    correlationId: text('correlationId'),
  };
}

function StateCell({ event }: { readonly event: AuditEvent }) {
  const { t } = useTranslation();
  const oldState = formatMaskedState(event.oldState);
  const newState = formatMaskedState(event.newState);
  if (oldState === null && newState === null) {
    return <>{t('audit.noChanges')}</>;
  }
  return (
    <details>
      <summary>{t('audit.showChanges')}</summary>
      {oldState !== null && (
        <>
          <p>{t('audit.oldState')}</p>
          <pre>{oldState}</pre>
        </>
      )}
      {newState !== null && (
        <>
          <p>{t('audit.newState')}</p>
          <pre>{newState}</pre>
        </>
      )}
    </details>
  );
}

/**
 * The audit trail of the caller's tenant (administrators and auditors): filters, a paginated table, and an export of
 * the filtered trail as CSV or JSON (subject to the tenant's export policy). Credential-like fields in the recorded
 * states are masked by the API and again here.
 */
export function AuditPage({ client = apiClient, saveFile = defaultSaveFile }: AuditPageProps) {
  const { t } = useTranslation();
  const formId = useId();
  const [draft, setDraft] = useState<FilterDraft>(EMPTY_DRAFT);
  const [filter, setFilter] = useState<AuditFilter>(() => toFilter(EMPTY_DRAFT));
  const action = useAction();

  const load = useCallback(
    (cursor: string | undefined, signal: AbortSignal) =>
      client.get('/api/v1/audit-events', {
        query: {
          From: filter.from ?? undefined,
          To: filter.to ?? undefined,
          Actor: filter.actor ?? undefined,
          Action: filter.action ?? undefined,
          EntityType: filter.entityType ?? undefined,
          EntityId: filter.entityId ?? undefined,
          CorrelationId: filter.correlationId ?? undefined,
          Limit: AUDIT_PAGE_SIZE,
          Cursor: cursor,
        },
        signal,
      }),
    [client, filter],
  );
  const pages = useCursorPages(load);

  const exportAs = (format: AuditExportFormat) => {
    void action.run(
      async () => {
        const file = await client.download('/api/v1/audit-events/export', auditExportMediaType(format), {
          body: { ...filter, format },
        });
        saveFile(file.blob, file.filename ?? `audit-events.${format}`);
      },
      t('audit.exported', { format: format.toUpperCase() }),
    );
  };

  const columns: DataTableColumn<AuditEvent>[] = [
    { key: 'occurredAt', header: t('audit.occurredAt'), render: (row) => <Timestamp value={row.occurredAt} /> },
    { key: 'actor', header: t('audit.actor'), render: (row) => row.actor },
    { key: 'action', header: t('audit.action'), render: (row) => row.action },
    { key: 'object', header: t('audit.object'), render: (row) => `${row.entityType}: ${row.entityId}` },
    { key: 'correlationId', header: t('audit.correlationId'), render: (row) => row.correlationId },
    { key: 'changes', header: t('audit.changes'), render: (row) => <StateCell event={row} /> },
  ];

  const field = (name: FilterField, type: 'text' | 'datetime-local' = 'text') => {
    const id = `${formId}-${name}`;
    return (
      <div className="cw-field" key={name}>
        <label htmlFor={id}>{t(`audit.filter.${name}`)}</label>
        <input
          id={id}
          type={type}
          value={draft.get(name) ?? ''}
          onChange={(event) => {
            setDraft(new Map(draft).set(name, event.target.value));
          }}
        />
      </div>
    );
  };

  return (
    <section aria-labelledby="audit-title">
      <h1 id="audit-title">{t('audit.title')}</h1>
      <p>{t('audit.intro')}</p>

      <form
        className="cw-form"
        onSubmit={(event) => {
          event.preventDefault();
          setFilter(toFilter(draft));
        }}
      >
        <fieldset>
          <legend>{t('audit.filter.legend')}</legend>
          <div className="cw-field-grid">
            {field('from', 'datetime-local')}
            {field('to', 'datetime-local')}
            {TEXT_FIELDS.map((name) => field(name))}
          </div>
          <p>{t('audit.filter.timeZoneHint')}</p>
          <div className="cw-actions">
            <Button type="submit">{t('audit.filter.apply')}</Button>
            <Button
              variant="secondary"
              onClick={() => {
                setDraft(EMPTY_DRAFT);
                setFilter(toFilter(EMPTY_DRAFT));
              }}
            >
              {t('audit.filter.reset')}
            </Button>
          </div>
        </fieldset>
      </form>

      <div className="cw-actions" role="group" aria-label={t('audit.exportGroup')}>
        <Button
          variant="secondary"
          disabled={action.busy}
          onClick={() => {
            exportAs('csv');
          }}
        >
          {t('audit.exportCsv')}
        </Button>
        <Button
          variant="secondary"
          disabled={action.busy}
          onClick={() => {
            exportAs('json');
          }}
        >
          {t('audit.exportJson')}
        </Button>
      </div>
      <p>{t('audit.exportHint')}</p>
      {action.notice && <StatusMessage tone="success">{action.notice}</StatusMessage>}
      {action.error !== null && <ApiErrorMessage error={action.error} forbiddenMessage={t('audit.exportForbidden')} />}

      {pages.status === 'loading' && <StatusMessage tone="info">{t('audit.loading')}</StatusMessage>}
      {pages.status === 'error' && <ApiErrorMessage error={pages.error} forbiddenMessage={t('audit.forbidden')} />}
      {pages.data && (
        <>
          <DataTable<AuditEvent>
            caption={t('audit.caption')}
            columns={columns}
            rows={pages.data.items}
            rowKey={(row) => row.id}
          />
          <Pagination
            label={t('audit.pagination')}
            page={pages.page}
            hasPrevious={pages.hasPrevious}
            hasNext={pages.hasNext}
            onPrevious={pages.previous}
            onNext={pages.next}
          />
        </>
      )}
    </section>
  );
}
