import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <section aria-labelledby="not-found-title">
      <h1 id="not-found-title">{t('notFound.title')}</h1>
      <Link to="/">{t('notFound.backHome')}</Link>
    </section>
  );
}
