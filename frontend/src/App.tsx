import { Navigate, Route, Routes } from 'react-router-dom';
import { MainLayout } from './plantillas/MainLayout';
import { AdminPage } from './paginas/AdminPage';
import { NotFoundPage } from './paginas/NotFoundPage';
import { TiendaPage } from './paginas/TiendaPage';

export function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<TiendaPage />} />
        <Route path="admin" element={<AdminPage />} />
        <Route path="home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
