import { Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { ADMIN_SECTIONS, type AdminSection } from './features/admin/adminSections';
import { AuditPage } from './features/admin/AuditPage';
import { MembershipsPage } from './features/admin/MembershipsPage';
import { PlatformStatusPage } from './features/admin/PlatformStatusPage';
import { PoliciesPage } from './features/admin/PoliciesPage';
import { TenantsPage } from './features/admin/TenantsPage';
import { ADMINISTRATION_MODULE, MODULES } from './modules';
import { HomePage } from './pages/HomePage';
import { ModulePlaceholderPage } from './pages/ModulePlaceholderPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AdministrationPage } from './pages/admin/AdministrationPage';
import { SecurityDashboardPage } from './pages/admin/SecurityDashboardPage';

/**
 * The page of an administration screen. Every screen is routed for everyone: the menu shows a screen only with the
 * permission, but the API decides, and a screen opened without permission shows the API's refusal.
 */
function adminPage(section: AdminSection) {
  switch (section.id) {
    case 'tenants':
      return <TenantsPage />;
    case 'memberships':
      return <MembershipsPage />;
    case 'audit':
      return <AuditPage />;
    case 'policies':
      return <PoliciesPage />;
    case 'platformStatus':
      return <PlatformStatusPage />;
    case 'security':
      return <SecurityDashboardPage />;
  }
}

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        {MODULES.map((module) =>
          module.id === ADMINISTRATION_MODULE ? (
            <Route key={module.id} path={module.slug}>
              <Route index element={<AdministrationPage />} />
              {ADMIN_SECTIONS.map((section) => (
                <Route key={section.id} path={section.path} element={adminPage(section)} />
              ))}
            </Route>
          ) : (
            <Route key={module.id} path={module.slug} element={<ModulePlaceholderPage module={module} />} />
          ),
        )}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
