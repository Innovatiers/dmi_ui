import { useCallback, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apiClient, type ApiClient } from '../../api/client';
import { isKnown, type ExportPolicySettings, type RetentionPolicySettings } from '../../api/governance';
import { useApiQuery } from '../../api/useApiQuery';
import { ASSIGNABLE_ROLES, roleValue } from '../../auth/permissions';
import { ApiErrorMessage } from '../../components/ApiErrorMessage';
import { Button } from '../../components/Button';
import { StatusMessage } from '../../components/StatusMessage';
import { useAction, type ActionState } from './useAction';

/** Export types the UI can name; any other type is shown by its code. */
export const KNOWN_EXPORT_TYPES = ['audit', 'measurements', 'dashboards'] as const;

type PoliciesClient = Pick<ApiClient, 'get' | 'mutate'>;

export interface PoliciesPageProps {
  /** The API client; tests pass their own. Must be stable across renders. */
  readonly client?: PoliciesClient;
}

interface FormProps<T> {
  readonly settings: T;
  readonly client: PoliciesClient;
  readonly onSaved: () => void;
  /** Kept by the page, so the confirmation survives the reload after saving. */
  readonly action: ActionState;
}

function ExportPolicyForm({ settings, client, onSaved, action }: FormProps<ExportPolicySettings>) {
  const { t } = useTranslation();
  const formId = useId();
  const [allowed, setAllowed] = useState<ReadonlyMap<string, ReadonlySet<number>>>(
    () => new Map(settings.policies.map((policy) => [policy.exportType, new Set(policy.allowedRoles)])),
  );
  const typeLabel = (type: string) => (isKnown(KNOWN_EXPORT_TYPES, type) ? t(`policies.export.types.${type}`) : type);

  const toggle = (exportType: string, role: number, checked: boolean) => {
    const roles = new Set(allowed.get(exportType));
    if (checked) {
      roles.add(role);
    } else {
      roles.delete(role);
    }
    setAllowed(new Map(allowed).set(exportType, roles));
  };

  return (
    <form
      className="cw-form"
      onSubmit={(event) => {
        event.preventDefault();
        void action.run(
          () =>
            client.mutate('put', '/api/v1/admin/export-policy', {
              body: {
                policies: settings.policies.map((policy) => ({
                  exportType: policy.exportType,
                  allowedRoles: [...(allowed.get(policy.exportType) ?? [])].sort((a, b) => a - b),
                })),
              },
            }),
          t('policies.export.saved'),
          onSaved,
        );
      }}
    >
      {settings.policies.map((policy) => (
        <fieldset key={policy.exportType}>
          <legend>
            {policy.isDefault
              ? t('policies.export.legendDefault', { type: typeLabel(policy.exportType) })
              : typeLabel(policy.exportType)}
          </legend>
          {ASSIGNABLE_ROLES.map((role) => {
            const id = `${formId}-${policy.exportType}-${role}`;
            return (
              <div className="cw-check" key={role}>
                <input
                  id={id}
                  type="checkbox"
                  checked={allowed.get(policy.exportType)?.has(roleValue(role)) === true}
                  onChange={(event) => {
                    toggle(policy.exportType, roleValue(role), event.target.checked);
                  }}
                />
                <label htmlFor={id}>{t(`roles.${role}`)}</label>
              </div>
            );
          })}
        </fieldset>
      ))}
      <Button type="submit" disabled={action.busy}>
        {t('policies.export.save')}
      </Button>
    </form>
  );
}

interface RetentionRow {
  readonly objectType: string;
  readonly days: string;
  readonly legalHold: boolean;
}

function RetentionPolicyForm({ settings, client, onSaved, action }: FormProps<RetentionPolicySettings>) {
  const { t } = useTranslation();
  const formId = useId();
  const [rows, setRows] = useState<readonly RetentionRow[]>(() =>
    settings.policies.map((policy) => ({
      objectType: policy.objectType,
      days: policy.retentionDays === null ? '' : String(policy.retentionDays),
      legalHold: policy.legalHold,
    })),
  );
  const [newType, setNewType] = useState('');
  const update = (index: number, change: Partial<RetentionRow>) => {
    setRows(rows.map((row, position) => (position === index ? { ...row, ...change } : row)));
  };
  const trimmedNewType = newType.trim();
  const canAdd = trimmedNewType !== '' && !rows.some((row) => row.objectType === trimmedNewType);

  return (
    <form
      className="cw-form"
      onSubmit={(event) => {
        event.preventDefault();
        void action.run(
          () =>
            client.mutate('put', '/api/v1/admin/retention-policy', {
              body: {
                policies: rows.map((row) => ({
                  objectType: row.objectType,
                  retentionDays: row.days.trim() === '' ? null : Number(row.days),
                  legalHold: row.legalHold,
                })),
              },
            }),
          t('policies.retention.saved'),
          onSaved,
        );
      }}
    >
      {rows.length === 0 && <p>{t('policies.retention.none')}</p>}
      {rows.map((row, index) => {
        const daysId = `${formId}-${row.objectType}-days`;
        const holdId = `${formId}-${row.objectType}-hold`;
        return (
          <fieldset key={row.objectType}>
            <legend>{row.objectType}</legend>
            <label htmlFor={daysId}>{t('policies.retention.days')}</label>
            <input
              id={daysId}
              type="number"
              min={1}
              step={1}
              value={row.days}
              aria-describedby={`${formId}-days-hint`}
              onChange={(event) => {
                update(index, { days: event.target.value });
              }}
            />
            <div className="cw-check">
              <input
                id={holdId}
                type="checkbox"
                checked={row.legalHold}
                onChange={(event) => {
                  update(index, { legalHold: event.target.checked });
                }}
              />
              <label htmlFor={holdId}>{t('policies.retention.legalHold')}</label>
            </div>
          </fieldset>
        );
      })}
      <p id={`${formId}-days-hint`}>{t('policies.retention.daysHint')}</p>
      <div className="cw-field">
        <label htmlFor={`${formId}-new`}>{t('policies.retention.newType')}</label>
        <input
          id={`${formId}-new`}
          value={newType}
          onChange={(event) => {
            setNewType(event.target.value);
          }}
        />
        <Button
          variant="secondary"
          disabled={!canAdd}
          onClick={() => {
            setRows([...rows, { objectType: trimmedNewType, days: '', legalHold: false }]);
            setNewType('');
          }}
        >
          {t('policies.retention.add')}
        </Button>
      </div>
      <p>{t('policies.retention.protected', { types: settings.protectedObjectTypes.join(', ') })}</p>
      <Button type="submit" disabled={action.busy}>
        {t('policies.retention.save')}
      </Button>
    </form>
  );
}

/**
 * Export and retention policy of the caller's tenant (administrators). The export policy can only narrow the
 * permission matrix; retention terms are stored and shown only and remove nothing (DEC-11: only temporary technical
 * data is cleaned up automatically; terms for business and audit data have no default and are not enforced).
 */
export function PoliciesPage({ client = apiClient }: PoliciesPageProps) {
  const { t } = useTranslation();
  const [exportVersion, setExportVersion] = useState(0);
  const [retentionVersion, setRetentionVersion] = useState(0);
  const loadExport = useCallback(
    (signal: AbortSignal) => client.get('/api/v1/admin/export-policy', { signal }),
    [client],
  );
  const loadRetention = useCallback(
    (signal: AbortSignal) => client.get('/api/v1/admin/retention-policy', { signal }),
    [client],
  );
  const exportPolicy = useApiQuery(loadExport, exportVersion);
  const retentionPolicy = useApiQuery(loadRetention, retentionVersion);
  const exportAction = useAction();
  const retentionAction = useAction();

  return (
    <section aria-labelledby="policies-title">
      <h1 id="policies-title">{t('policies.title')}</h1>
      <p>{t('policies.intro')}</p>

      <section aria-labelledby="export-policy-title">
        <h2 id="export-policy-title">{t('policies.export.title')}</h2>
        <p>{t('policies.export.intro')}</p>
        {exportPolicy.status === 'loading' && <StatusMessage tone="info">{t('policies.loading')}</StatusMessage>}
        {exportPolicy.status === 'error' && (
          <ApiErrorMessage error={exportPolicy.error} forbiddenMessage={t('policies.forbidden')} />
        )}
        {exportAction.notice && <StatusMessage tone="success">{exportAction.notice}</StatusMessage>}
        {exportAction.error !== null && <ApiErrorMessage error={exportAction.error} />}
        {exportPolicy.data && (
          <ExportPolicyForm
            action={exportAction}
            key={exportVersion}
            settings={exportPolicy.data}
            client={client}
            onSaved={() => {
              setExportVersion((value) => value + 1);
            }}
          />
        )}
      </section>

      <section aria-labelledby="retention-policy-title">
        <h2 id="retention-policy-title">{t('policies.retention.title')}</h2>
        <p className="cw-banner">
          <strong>{t('policies.retention.banner')}</strong>
        </p>
        {retentionPolicy.status === 'loading' && <StatusMessage tone="info">{t('policies.loading')}</StatusMessage>}
        {retentionPolicy.status === 'error' && (
          <ApiErrorMessage error={retentionPolicy.error} forbiddenMessage={t('policies.forbidden')} />
        )}
        {retentionAction.notice && <StatusMessage tone="success">{retentionAction.notice}</StatusMessage>}
        {retentionAction.error !== null && <ApiErrorMessage error={retentionAction.error} />}
        {retentionPolicy.data && (
          <RetentionPolicyForm
            action={retentionAction}
            key={retentionVersion}
            settings={retentionPolicy.data}
            client={client}
            onSaved={() => {
              setRetentionVersion((value) => value + 1);
            }}
          />
        )}
      </section>
    </section>
  );
}
