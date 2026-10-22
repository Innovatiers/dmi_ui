import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { apiClient, type ApiClient } from '../../api/client';
import { ApiError } from '../../api/errors';
import {
  HEALTH_STATUS,
  KNOWN_COMPONENTS,
  KNOWN_REASONS,
  METRIC_STATUS,
  NETWORK_STATUS_NAMES,
  PROVIDER_TYPE_NAMES,
  ROLE_NAMES,
  isKnown,
  nameOf,
  type SecurityOverview,
  type ServiceHealth,
} from '../../api/governance';
import { useApiQuery } from '../../api/useApiQuery';
import { DataTable, type DataTableColumn } from '../../components/DataTable';
import { KpiCard, KpiGrid } from '../../components/KpiCard';
import { StatusMessage } from '../../components/StatusMessage';
import { formatUtcTimestamp } from '../../format/dateTime';

type Overview = SecurityOverview;
type CredentialRow = Overview['credentialRefs']['networks'][number];
type RoleRow = Overview['usersByRole'][number];
type RetentionRow = Overview['retention']['policies'][number];
type ExportRow = Overview['exports']['byType'][number];
type ComponentRow = ServiceHealth['components'][number];
type ProviderRow = ServiceHealth['dataProviders'][number];

export interface SecurityDashboardPageProps {
  /** The API client; tests pass their own. Must be stable across renders. */
  readonly client?: Pick<ApiClient, 'get'>;
}

function useLabels() {
  const { t } = useTranslation();
  const timestamp = (iso: string | null | undefined) => (iso ? formatUtcTimestamp(iso) : t('security.kpi.never'));
  const reason = (code: string | null | undefined) =>
    isKnown(KNOWN_REASONS, code) ? t(`security.reasons.${code}`) : t('security.reasons.unknown');
  const role = (value: number) => {
    const name = nameOf(ROLE_NAMES, value);
    return name ? t(`roles.${name}`) : t('roles.unknown');
  };
  const networkStatus = (value: number) => {
    const name = nameOf(NETWORK_STATUS_NAMES, value);
    return name ? t(`networkStatus.${name}`) : t('networkStatus.unknown');
  };
  const providerType = (value: number) => {
    const name = nameOf(PROVIDER_TYPE_NAMES, value);
    return name ? t(`providerType.${name}`) : t('providerType.unknown');
  };
  const healthStatus = (status: string) => {
    switch (status) {
      case HEALTH_STATUS.ready:
        return t('security.health.statusValue.ready');
      case HEALTH_STATUS.unavailable:
        return t('security.health.statusValue.unavailable');
      case HEALTH_STATUS.notAvailable:
        return t('security.health.statusValue.not_available');
      default:
        return t('security.health.statusValue.unknown');
    }
  };
  const component = (code: string) =>
    isKnown(KNOWN_COMPONENTS, code) ? t(`security.health.components.${code}`) : code;
  return { t, timestamp, reason, role, networkStatus, providerType, healthStatus, component };
}

function ErrorMessage({ error, forbiddenMessage }: { readonly error: unknown; readonly forbiddenMessage: string }) {
  const { t } = useTranslation();
  if (error instanceof ApiError && error.status === 403) {
    return <StatusMessage tone="warning">{forbiddenMessage}</StatusMessage>;
  }
  const correlationId = error instanceof ApiError ? error.envelope.correlationId : undefined;
  return (
    <StatusMessage tone="error">
      <span>{error instanceof ApiError && error.status === 0 ? t('errors.network') : t('errors.unexpected')}</span>
      {correlationId && <span>{t('errors.reference', { correlationId })}</span>}
    </StatusMessage>
  );
}

function OverviewSections({ overview }: { readonly overview: Overview }) {
  const { t, timestamp, reason, role, networkStatus } = useLabels();
  const activeUsers = overview.usersByRole.reduce((sum, entry) => sum + entry.active, 0);
  const activeStatus = NETWORK_STATUS_NAMES.indexOf('Active');
  const activeNetworks = overview.credentialRefs.byNetworkStatus.find((entry) => entry.networkStatus === activeStatus);
  const notAvailable = (status: string, value: number | null | undefined) =>
    status === METRIC_STATUS.available && value !== null && value !== undefined ? value : t('security.notAvailable');
  const roleColumns: DataTableColumn<RoleRow>[] = [
    { key: 'role', header: t('security.users.role'), render: (row) => role(row.role) },
    { key: 'active', header: t('security.users.active'), render: (row) => row.active },
    { key: 'disabled', header: t('security.users.disabled'), render: (row) => row.disabled },
  ];

  const credentialColumns: DataTableColumn<CredentialRow>[] = [
    {
      key: 'network',
      header: t('security.credentials.network'),
      render: (row) => `${row.displayName} (${row.externalNetworkId})`,
    },
    { key: 'status', header: t('security.credentials.status'), render: (row) => networkStatus(row.status) },
    {
      key: 'credential',
      header: t('security.credentials.credential'),
      render: (row) => (row.hasCredentialRef ? t('security.credentials.set') : t('security.credentials.notSet')),
    },
    {
      key: 'rotatedAt',
      header: t('security.credentials.rotatedAt'),
      render: (row) => timestamp(row.credentialRotatedAt),
    },
  ];

  const retentionColumns: DataTableColumn<RetentionRow>[] = [
    { key: 'objectType', header: t('security.retention.objectType'), render: (row) => row.objectType },
    {
      key: 'term',
      header: t('security.retention.term'),
      render: (row) =>
        row.retentionDays === null
          ? t('security.retention.noTerm')
          : t('security.retention.days', { count: row.retentionDays }),
    },
    {
      key: 'legalHold',
      header: t('security.retention.legalHold'),
      render: (row) => (row.legalHold ? t('security.yes') : t('security.no')),
    },
  ];

  const exportColumns: DataTableColumn<ExportRow>[] = [
    { key: 'type', header: t('security.exports.type'), render: (row) => row.exportType },
    { key: 'count', header: t('security.exports.count'), render: (row) => row.count },
  ];

  return (
    <>
      <p>{t('security.generatedAt', { time: timestamp(overview.generatedAt) })}</p>

      <section aria-labelledby="security-kpis">
        <h2 id="security-kpis">{t('security.kpi.label')}</h2>
        <KpiGrid>
          <KpiCard label={t('security.kpi.activeUsers')} value={activeUsers} />
          <KpiCard label={t('security.kpi.deniedLast24Hours')} value={overview.accessDenied.forbiddenLast24Hours} />
          <KpiCard label={t('security.kpi.deniedLast7Days')} value={overview.accessDenied.forbiddenLast7Days} />
          <KpiCard label={t('security.kpi.crossTenantLast7Days')} value={overview.accessDenied.crossTenantLast7Days} />
          <KpiCard label={t('security.kpi.exportsLast30Days')} value={overview.exports.last30Days} />
          <KpiCard
            label={t('security.kpi.networksWithoutCredential')}
            value={activeNetworks?.networksWithoutCredentialRef ?? 0}
          />
          <KpiCard label={t('security.kpi.lastRotation')} value={timestamp(overview.credentialRefs.lastRotatedAt)} />
          <KpiCard
            label={t('security.kpi.inactiveUsers')}
            value={notAvailable(overview.inactiveUsers.status, overview.inactiveUsers.count)}
            detail={
              overview.inactiveUsers.status === METRIC_STATUS.available
                ? undefined
                : reason(overview.inactiveUsers.reason)
            }
          />
          <KpiCard
            label={t('security.kpi.failingNetworks')}
            value={notAvailable(overview.networkHealth.status, overview.networkHealth.failingNetworks)}
            detail={
              overview.networkHealth.status === METRIC_STATUS.available
                ? undefined
                : reason(overview.networkHealth.reason)
            }
          />
        </KpiGrid>
      </section>

      <DataTable<RoleRow>
        caption={t('security.users.caption')}
        columns={roleColumns}
        rows={overview.usersByRole}
        rowKey={(row) => String(row.role)}
      />

      <DataTable<CredentialRow>
        caption={t('security.credentials.caption')}
        columns={credentialColumns}
        rows={overview.credentialRefs.networks}
        rowKey={(row) => row.networkId}
      />

      <DataTable<RetentionRow>
        caption={t('security.retention.caption')}
        columns={retentionColumns}
        rows={overview.retention.policies}
        rowKey={(row) => row.objectType}
      />
      <p>{t('security.retention.notice')}</p>
      <p>{t('security.retention.protected', { types: overview.retention.protectedObjectTypes.join(', ') })}</p>

      <DataTable<ExportRow>
        caption={t('security.exports.caption')}
        columns={exportColumns}
        rows={overview.exports.byType}
        rowKey={(row) => row.exportType}
      />
    </>
  );
}

function HealthSections({ health }: { readonly health: ServiceHealth }) {
  const { t, timestamp, reason, networkStatus, providerType, healthStatus, component } = useLabels();
  const componentColumns: DataTableColumn<ComponentRow>[] = [
    { key: 'component', header: t('security.health.component'), render: (row) => component(row.component) },
    { key: 'status', header: t('security.health.status'), render: (row) => healthStatus(row.status) },
    { key: 'reason', header: t('security.health.reason'), render: (row) => (row.reason ? reason(row.reason) : '') },
  ];

  const providerColumns: DataTableColumn<ProviderRow>[] = [
    {
      key: 'network',
      header: t('security.health.network'),
      render: (row) => `${row.displayName} (${row.externalNetworkId})`,
    },
    { key: 'provider', header: t('security.health.provider'), render: (row) => providerType(row.providerType) },
    {
      key: 'networkStatus',
      header: t('security.health.networkStatus'),
      render: (row) => networkStatus(row.networkStatus),
    },
    { key: 'status', header: t('security.health.status'), render: (row) => healthStatus(row.status) },
    { key: 'reason', header: t('security.health.reason'), render: (row) => (row.reason ? reason(row.reason) : '') },
  ];
  return (
    <>
      <p>{t('security.health.checkedAt', { time: timestamp(health.checkedAt) })}</p>
      <DataTable<ComponentRow>
        caption={t('security.health.componentsCaption')}
        columns={componentColumns}
        rows={health.components}
        rowKey={(row) => row.component}
      />
      <DataTable<ProviderRow>
        caption={t('security.health.providersCaption')}
        columns={providerColumns}
        rows={health.dataProviders}
        rowKey={(row) => row.networkId}
      />
    </>
  );
}

/**
 * Security and privacy dashboard of the caller's tenant (administrators): key figures, users per role, credential
 * references (set or not, never a value), retention settings, exports and the service health. Figures the platform
 * cannot determine yet are shown as "not available", never estimated.
 */
export function SecurityDashboardPage({ client = apiClient }: SecurityDashboardPageProps) {
  const { t } = useTranslation();
  const loadOverview = useCallback(
    (signal: AbortSignal) => client.get('/api/v1/admin/security-overview', { signal }),
    [client],
  );
  const loadHealth = useCallback((signal: AbortSignal) => client.get('/api/v1/admin/health', { signal }), [client]);
  const overview = useApiQuery(loadOverview);
  const health = useApiQuery(loadHealth);

  return (
    <section aria-labelledby="security-title">
      <h1 id="security-title">{t('security.title')}</h1>
      <p>{t('security.intro')}</p>

      {overview.status === 'loading' && <StatusMessage tone="info">{t('security.loading')}</StatusMessage>}
      {overview.status === 'error' && (
        <ErrorMessage error={overview.error} forbiddenMessage={t('security.forbidden')} />
      )}
      {overview.data && <OverviewSections overview={overview.data} />}

      <section aria-labelledby="health-title">
        <h2 id="health-title">{t('security.health.title')}</h2>
        {health.status === 'loading' && <StatusMessage tone="info">{t('security.health.loading')}</StatusMessage>}
        {health.status === 'error' && <ErrorMessage error={health.error} forbiddenMessage={t('security.forbidden')} />}
        {health.data && <HealthSections health={health.data} />}
      </section>
    </section>
  );
}
