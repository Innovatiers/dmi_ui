import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useIdentity } from '../../auth/session';
import { visibleAdminSections } from '../../features/admin/adminSections';

/**
 * Start page of the administration module (M14): links to the screens the user's role may open. The API stays
 * leading; a screen opened by its address without permission shows the API's refusal.
 */
export function AdministrationPage() {
  const { t } = useTranslation();
  const sections = visibleAdminSections(useIdentity());
  return (
    <section aria-labelledby="administration-title">
      <h1 id="administration-title">{t('modules.M14')}</h1>
      <p>{t('admin.intro')}</p>
      {sections.length === 0 ? (
        <p>{t('admin.noSections')}</p>
      ) : (
        <ul>
          {sections.map((section) => (
            <li key={section.id}>
              <Link to={section.path}>{t(`admin.sections.${section.id}`)}</Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
