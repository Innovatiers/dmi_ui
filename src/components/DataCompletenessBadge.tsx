import { useTranslation } from 'react-i18next';
import type { Completeness } from '../api/errors';

export interface DataCompletenessBadgeProps {
  readonly completeness: Completeness;
}

/**
 * Makes partial or unavailable data explicit (AI Coder §9: never present partial data as complete).
 * Complete data renders a quiet badge; partial and unavailable render an announced explanation.
 */
export function DataCompletenessBadge({ completeness }: DataCompletenessBadgeProps) {
  const { t } = useTranslation();
  if (completeness === 'complete') {
    return <span className="cw-badge cw-badge--complete">{t('completeness.complete')}</span>;
  }
  return (
    <span role="status" className={`cw-badge cw-badge--${completeness}`}>
      <strong>{t(`completeness.${completeness}`)}</strong>{' '}
      <span>{t(`completeness.${completeness}Detail`)}</span>
    </span>
  );
}
