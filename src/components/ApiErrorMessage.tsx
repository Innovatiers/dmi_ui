import { useTranslation } from 'react-i18next';
import { API_ERROR_CODES, ApiError } from '../api/errors';
import { Button } from './Button';
import { StatusMessage } from './StatusMessage';

/** Error codes of refused administration requests that get their own explanation (`errors.codes.<code>`). */
export const EXPLAINED_ERROR_CODES = [
  'LAST_ADMIN',
  'ROLE_NOT_MANAGEABLE',
  'MEMBERSHIP_EXISTS',
  'GRANT_EXISTS',
  'GRANT_TARGET_NOT_FOUND',
  'INVALID_GRANT_SCOPE',
  'OWN_TENANT_SUSPENSION',
  'EXPORT_TOO_LARGE',
  'EXPORT_ROLE_NOT_PERMITTED',
  'RETENTION_NOT_ALLOWED',
  'VALIDATION_FAILED',
  'NOT_FOUND',
] as const;

type ExplainedCode = (typeof EXPLAINED_ERROR_CODES)[number];

function isExplained(code: string): code is ExplainedCode {
  const codes: readonly string[] = EXPLAINED_ERROR_CODES;
  return codes.includes(code);
}

export interface ApiErrorMessageProps {
  readonly error: unknown;
  /** The text for a refusal (403); defaults to a generic "no permission" text. */
  readonly forbiddenMessage?: string;
  /** Reloads the data after a concurrency conflict (409 `CONCURRENCY_CONFLICT`); without it no button is shown. */
  readonly onReload?: () => void;
}

/**
 * Explains a failed API request with the standard envelope: not signed in (401), no permission (403), changed by
 * someone else (409, with a reload action), a known business refusal, the service being unavailable (5xx) or the
 * server being unreachable. Every message carries the correlation ID of the request as reference.
 */
export function ApiErrorMessage({ error, forbiddenMessage, onReload }: ApiErrorMessageProps) {
  const { t } = useTranslation();
  if (!(error instanceof ApiError)) {
    return <StatusMessage tone="error">{t('errors.unexpected')}</StatusMessage>;
  }
  const { correlationId } = error.envelope;
  const reference = correlationId ? <span>{t('errors.reference', { correlationId })}</span> : null;

  if (error.envelope.code === API_ERROR_CODES.concurrencyConflict) {
    return (
      <StatusMessage tone="warning">
        <span>{t('errors.conflict')}</span>
        {reference}
        {onReload && (
          <Button variant="secondary" onClick={onReload}>
            {t('errors.reload')}
          </Button>
        )}
      </StatusMessage>
    );
  }

  let message: string;
  let tone: 'warning' | 'error' = 'warning';
  if (error.status === 401) {
    message = t('errors.unauthenticated');
  } else if (error.status === 403) {
    message = forbiddenMessage ?? t('errors.forbidden');
  } else if (isExplained(error.envelope.code)) {
    message = t(`errors.codes.${error.envelope.code}`);
  } else if (error.status === 0) {
    message = t('errors.network');
    tone = 'error';
  } else if (error.status >= 500) {
    message = t('errors.unavailable');
    tone = 'error';
  } else if (error.status === 400 || error.status === 409 || error.status === 422) {
    message = t('errors.rejected');
  } else {
    message = t('errors.unexpected');
    tone = 'error';
  }
  return (
    <StatusMessage tone={tone}>
      <span>{message}</span>
      {reference}
    </StatusMessage>
  );
}
