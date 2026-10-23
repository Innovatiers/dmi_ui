import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { apiClient, type ApiClient } from '../../api/client';
import type { FeatureFlags } from '../../api/governance';
import { useApiQuery } from '../../api/useApiQuery';
import { ApiErrorMessage } from '../../components/ApiErrorMessage';
import { DataTable, type DataTableColumn } from '../../components/DataTable';
import { StatusMessage } from '../../components/StatusMessage';
import { Timestamp } from '../../components/Timestamp';
import { HealthSections } from '../../pages/admin/SecurityDashboardPage';

type FlagRow = FeatureFlags['items'][number];

export interface PlatformStatusPageProps {
  /** The API client; tests pass their own. Must be stable across renders. */
  readonly client?: Pick<ApiClient, 'get'>;
}

/**
 * Platform status (administrators and platform operators): the API version and server time, the readiness of the
 * API, the database, the job host and the data provider per network (the tables of the security dashboard), and the
 * feature flags of the tenant (on or off, read-only). Flags are managed outside the UI.
 */
export function PlatformStatusPage({ client = apiClient }: PlatformStatusPageProps) {
  const { t } = useTranslation();
  const loadInfo = useCallback((signal: AbortSignal) => client.get('/api/v1/system/info', { signal }), [client]);
  const loadHealth = useCallback((signal: AbortSignal) => client.get('/api/v1/admin/health', { signal }), [client]);
  const loadFlags = useCallback((signal: AbortSignal) => client.get('/api/v1/features', { signal }), [client]);
  const info = useApiQuery(loadInfo);
  const health = useApiQuery(loadHealth);
  const flags = useApiQuery(loadFlags);

  const flagColumns: DataTableColumn<FlagRow>[] = [
    { key: 'name', header: t('platformStatus.flags.name'), render: (row) => row.name },
    {
      key: 'state',
      header: t('platformStatus.flags.state'),
      render: (row) => (row.enabled ? t('platformStatus.flags.on') : t('platformStatus.flags.off')),
    },
  ];

  return (
    <section aria-labelledby="platform-status-title">
      <h1 id="platform-status-title">{t('platformStatus.title')}</h1>
      <p>{t('platformStatus.intro')}</p>

      <section aria-labelledby="platform-info-title">
        <h2 id="platform-info-title">{t('platformStatus.info.title')}</h2>
        {info.status === 'loading' && <StatusMessage tone="info">{t('platformStatus.loading')}</StatusMessage>}
        {info.status === 'error' && <ApiErrorMessage error={info.error} />}
        {info.data && (
          <dl className="cw-facts">
            <dt>{t('platformStatus.info.application')}</dt>
            <dd>{info.data.applicationName}</dd>
            <dt>{t('platformStatus.info.version')}</dt>
            <dd>{info.data.version}</dd>
            <dt>{t('platformStatus.info.serverTime')}</dt>
            <dd>
              <Timestamp value={info.data.serverTimeUtc} />
            </dd>
          </dl>
        )}
      </section>

      <section aria-labelledby="platform-health-title">
        <h2 id="platform-health-title">{t('security.health.title')}</h2>
        {health.status === 'loading' && <StatusMessage tone="info">{t('security.health.loading')}</StatusMessage>}
        {health.status === 'error' && (
          <ApiErrorMessage error={health.error} forbiddenMessage={t('security.health.forbidden')} />
        )}
        {health.data && <HealthSections health={health.data} />}
      </section>

      <section aria-labelledby="platform-flags-title">
        <h2 id="platform-flags-title">{t('platformStatus.flags.title')}</h2>
        {flags.status === 'loading' && <StatusMessage tone="info">{t('platformStatus.loading')}</StatusMessage>}
        {flags.status === 'error' && <ApiErrorMessage error={flags.error} />}
        {flags.data && (
          <DataTable<FlagRow>
            caption={t('platformStatus.flags.caption')}
            columns={flagColumns}
            rows={flags.data.items}
            rowKey={(row) => row.name}
          />
        )}
      </section>
    </section>
  );
}
