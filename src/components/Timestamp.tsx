import { useTranslation } from 'react-i18next';
import { formatUtcTimestamp } from '../format/dateTime';

export interface TimestampProps {
  /** A UTC ISO-8601 timestamp with offset, as sent by the API. */
  readonly value: string;
}

/** A timestamp in the viewer's time zone, with the UTC time as tooltip and in `dateTime`. */
export function Timestamp({ value }: TimestampProps) {
  const { t } = useTranslation();
  return (
    <time dateTime={value} title={t('time.utc', { time: formatUtcTimestamp(value, 'en', 'UTC') })}>
      {formatUtcTimestamp(value)}
    </time>
  );
}
