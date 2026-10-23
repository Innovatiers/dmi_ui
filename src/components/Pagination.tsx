import { useTranslation } from 'react-i18next';
import { Button } from './Button';

export interface PaginationProps {
  /** The accessible name of the pagination region, e.g. "Members pages". */
  readonly label: string;
  /** One-based number of the current page. */
  readonly page: number;
  readonly hasPrevious: boolean;
  readonly hasNext: boolean;
  readonly onPrevious: () => void;
  readonly onNext: () => void;
}

/** Previous and next page buttons for a cursor-paginated list. */
export function Pagination({ label, page, hasPrevious, hasNext, onPrevious, onNext }: PaginationProps) {
  const { t } = useTranslation();
  return (
    <nav aria-label={label} className="cw-pagination">
      <Button variant="secondary" onClick={onPrevious} disabled={!hasPrevious}>
        {t('pagination.previous')}
      </Button>
      <span>{t('pagination.page', { page })}</span>
      <Button variant="secondary" onClick={onNext} disabled={!hasNext}>
        {t('pagination.next')}
      </Button>
    </nav>
  );
}
