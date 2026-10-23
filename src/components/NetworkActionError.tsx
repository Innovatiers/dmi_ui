import { useTranslation } from 'react-i18next';
import { ApiError } from '../api/errors';
import { isNetworkDisabled, type NetworkAction } from '../api/networks';
import { StatusMessage } from './StatusMessage';

export interface NetworkActionErrorProps {
  /** The refused action: a connection test or a dataset discovery. */
  readonly action: NetworkAction;
  /** The error of the action. */
  readonly error: unknown;
}

/**
 * Explains why a network test or discovery failed. A disabled network (409 `NETWORK_DISABLED`, DEC-45-3b) gets a
 * clear explanation that reading health and datasets still works; other errors get the generic message with the
 * correlation reference.
 */
export function NetworkActionError({ action, error }: NetworkActionErrorProps) {
  const { t } = useTranslation();
  if (isNetworkDisabled(error)) {
    return (
      <StatusMessage tone="warning">
        <strong>{t(`networks.actions.${action}Refused`)}</strong> {t('networks.errors.networkDisabled')}
      </StatusMessage>
    );
  }
  return (
    <StatusMessage tone="error">
      {t('errors.unexpected')}
      {error instanceof ApiError && (
        <> {t('errors.reference', { correlationId: error.envelope.correlationId })}</>
      )}
    </StatusMessage>
  );
}
