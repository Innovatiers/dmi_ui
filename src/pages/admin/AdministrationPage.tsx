import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

/** Relative path of the security and privacy dashboard below the administration module. */
export const SECURITY_DASHBOARD_PATH = 'security';

/** Start page of the administration module (M14): links to its screens. */
export function AdministrationPage() {
  const { t } = useTranslation();
  return (
    <section aria-labelledby="administration-title">
      <h1 id="administration-title">{t('modules.M14')}</h1>
      <p>{t('admin.intro')}</p>
      <ul>
        <li>
          <Link to={SECURITY_DASHBOARD_PATH}>{t('admin.securityLink')}</Link>
        </li>
      </ul>
    </section>
  );
}
