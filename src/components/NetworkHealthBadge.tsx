import { useTranslation } from 'react-i18next';
import { isNetworkHealthStatus, type NetworkHealthStatus } from '../api/networks';

export interface NetworkHealthBadgeProps {
  /** The status reported by the API; an unknown value is shown as unknown, never as healthy. */
  readonly status: string;
}

type Tone = 'ok' | 'degraded' | 'failed' | 'unknown';

const TONE: Readonly<Record<NetworkHealthStatus, Tone>> = {
  ok: 'ok',
  degraded: 'degraded',
  auth: 'failed',
  network: 'failed',
  timeout: 'failed',
  invalid_config: 'failed',
  unavailable: 'failed',
  feature_disabled: 'unknown',
};

/** A text symbol per tone, so the status never depends on colour alone (WCAG 1.4.1). */
const SYMBOL: Readonly<Record<Tone, string>> = {
  ok: '✓',
  degraded: '◐',
  failed: '✕',
  unknown: '?',
};

/**
 * Shows the health status of a network with its own label and symbol. `degraded` (a partially successful
 * response, DEC-45-2b) has its own label, symbol and explanation, distinct from both `ok` and `network`.
 */
export function NetworkHealthBadge({ status }: NetworkHealthBadgeProps) {
  const { t } = useTranslation();
  const known = isNetworkHealthStatus(status) ? status : undefined;
  const tone = known ? TONE[known] : 'unknown';
  const label = t(`networkHealth.status.${known ?? 'unknown'}`);
  return (
    <span className={`cw-badge cw-health cw-health--${tone}`} data-status={known ?? 'unknown'}>
      <span className="cw-health__symbol" aria-hidden="true">
        {SYMBOL[tone]}
      </span>{' '}
      <strong>{label}</strong>
      {known === 'degraded' && <span className="cw-health__detail"> {t('networkHealth.degradedDetail')}</span>}
    </span>
  );
}
