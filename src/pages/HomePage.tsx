import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MODULES } from '../modules';

export function HomePage() {
  const { t } = useTranslation();
  return (
    <section aria-labelledby="home-title">
      <h1 id="home-title">{t('home.title')}</h1>
      <p>{t('home.intro')}</p>
      <ul className="cw-module-grid">
        {MODULES.map((module) => (
          <li key={module.id}>
            <Link to={`/${module.slug}`}>{t(`modules.${module.id}`)}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
