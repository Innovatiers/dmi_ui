import { useTranslation } from 'react-i18next';
import { isNetworkHealthStatus, type NetworkHealthStatus } from '../api/networks';

export interface NetworkHealthBadgeProps {
  /** The status reported by the API; an unknown value is shown as unknown, never as healthy. */
  readonly status: string;
}

type Tone = 'ok' | 'degraded' | 'failed' | 'unknown';

function toneOf(status: NetworkHealthStatus | undefined): Tone {
  switch (status) {
    case 'ok':
      return 'ok';
    case 'degraded':
      return 'degraded';
    case 'auth':
    case 'network':
    case 'timeout':
    case 'invalid_config':
    case 'unavailable':
      return 'failed';
    default:
      return 'unknown';
  }
}

/** A text symbol per tone, so the status never depends on colour alone (WCAG 1.4.1). */
function symbolOf(tone: Tone): string {
  switch (tone) {
    case 'ok':
      return '✓';
    case 'degraded':
      return '◐';
    case 'failed':
      return '✕';
    default:
      return '?';
  }
}

/**
 * Shows the health status of a network with its own label and symbol. `degraded` (a partially successful
 * response, DEC-45-2b) has its own label, symbol and explanation, distinct from both `ok` and `network`.
 */
export function NetworkHealthBadge({ status }: NetworkHealthBadgeProps) {
  const { t } = useTranslation();
  const known = isNetworkHealthStatus(status) ? status : undefined;
  const tone = toneOf(known);
  const label = t(`networkHealth.status.${known ?? 'unknown'}`);
  return (
    <span className={`cw-badge cw-health cw-health--${tone}`} data-status={known ?? 'unknown'}>
      <span className="cw-health__symbol" aria-hidden="true">
        {symbolOf(tone)}
      </span>{' '}
      <strong>{label}</strong>
      {known === 'degraded' && <span className="cw-health__detail"> {t('networkHealth.degradedDetail')}</span>}
    </span>
  );
}
