import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './Button';

export type StatusTone = 'info' | 'success' | 'warning' | 'error';

export interface StatusMessageProps {
  readonly tone: StatusTone;
  readonly children: ReactNode;
  readonly onDismiss?: () => void;
}

/**
 * Status message announced to assistive technology: errors and warnings interrupt (`role="alert"`),
 * info and success are polite (`role="status"`).
 */
export function StatusMessage({ tone, children, onDismiss }: StatusMessageProps) {
  const { t } = useTranslation();
  const role = tone === 'error' || tone === 'warning' ? 'alert' : 'status';
  return (
    <div role={role} className={`cw-status cw-status--${tone}`}>
      <span className="cw-status__label">{t(`status.${tone}`)}</span>
      <span className="cw-status__body">{children}</span>
      {onDismiss && (
        <Button variant="secondary" onClick={onDismiss}>
          {t('status.dismiss')}
        </Button>
      )}
    </div>
  );
}
