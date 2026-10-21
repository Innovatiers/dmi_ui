import { NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MODULES } from '../modules';

/** Responsive application frame: skip link, header, module navigation and main content region. */
export function AppShell() {
  const { t } = useTranslation();
  return (
    <div className="cw-shell">
      <a className="cw-skip-link" href="#main-content">
        {t('app.skipToContent')}
      </a>
      <header className="cw-header">
        <span className="cw-header__brand">{t('app.name')}</span>
      </header>
      <nav className="cw-nav" aria-label={t('app.mainNavigation')}>
        <ul>
          <li>
            <NavLink to="/" end>
              {t('app.home')}
            </NavLink>
          </li>
          {MODULES.map((module) => (
            <li key={module.id}>
              <NavLink to={`/${module.slug}`}>{t(`modules.${module.id}`)}</NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <main id="main-content" className="cw-main" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  );
}
