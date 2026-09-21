// =================================================================
// Archivo: src/layouts/MainLayout/MainLayout.tsx
// Layout Shell: pinta el SenaHeader (marca + navegación + sesión) y el
// RoleInfoBanner (explicación del rol activo), envuelve todo en el
// DataProvider (equipos/préstamos/incidencias reales) y deja que
// <Outlet /> inyecte la página que React Router decida según la URL.
// =================================================================
import { Outlet } from 'react-router-dom';
import { DataProvider } from '../../context/DataContext';
import SenaHeader from '../../components/SenaHeader/SenaHeader';
import RoleInfoBanner from '../../components/RoleInfoBanner/RoleInfoBanner';

export default function MainLayout() {
  return (
    <DataProvider>
      <div className="min-h-screen text-slate-100 flex flex-col">
        <SenaHeader />
        <RoleInfoBanner />

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </DataProvider>
  );
}
