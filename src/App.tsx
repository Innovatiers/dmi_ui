import { Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { MODULES } from './modules';
import { HomePage } from './pages/HomePage';
import { ModulePlaceholderPage } from './pages/ModulePlaceholderPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AdministrationPage, SECURITY_DASHBOARD_PATH } from './pages/admin/AdministrationPage';
import { SecurityDashboardPage } from './pages/admin/SecurityDashboardPage';

const ADMINISTRATION_MODULE = 'M14';

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        {MODULES.map((module) =>
          module.id === ADMINISTRATION_MODULE ? (
            <Route key={module.id} path={module.slug}>
              <Route index element={<AdministrationPage />} />
              <Route path={SECURITY_DASHBOARD_PATH} element={<SecurityDashboardPage />} />
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
