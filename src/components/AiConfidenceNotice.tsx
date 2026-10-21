import { useTranslation } from 'react-i18next';

export interface AiConfidenceNoticeProps {
  /** Model confidence between 0 and 1. */
  readonly confidence: number;
  /** Confidence below this value is flagged. Defaults to 0.6. */
  readonly threshold?: number;
}

/** Shows an accessible warning when an AI result lacks sufficient confidence; renders nothing otherwise. */
export function AiConfidenceNotice({ confidence, threshold = 0.6 }: AiConfidenceNoticeProps) {
  const { t } = useTranslation();
  if (Number.isFinite(confidence) && confidence >= threshold) {
    return null;
  }
  return (
    <div role="status" className="cw-ai-notice">
      <strong>{t('ai.lowConfidence')}</strong> <span>{t('ai.lowConfidenceDetail')}</span>
    </div>
  );
}
