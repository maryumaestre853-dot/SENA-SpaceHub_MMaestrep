import { Outlet } from 'react-router-dom';
import SenaHeader from '../../components/SenaHeader/SenaHeader';
import './MainLayout.css';

export default function MainLayout() {
  return (
    <div className="layout-shell">
      <SenaHeader />

      <main className="content-viewport">
        <Outlet />
      </main>
    </div>
  );
}