import { Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { MODULES } from './modules';
import { HomePage } from './pages/HomePage';
import { ModulePlaceholderPage } from './pages/ModulePlaceholderPage';
import { NotFoundPage } from './pages/NotFoundPage';

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        {MODULES.map((module) => (
          <Route key={module.id} path={module.slug} element={<ModulePlaceholderPage module={module} />} />
        ))}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
