// ============================================================================
// 📁 src/App.tsx
// Punto de entrada visual: envuelve toda la aplicación en AuthProvider (quién
// eres) y DataProvider (equipos/préstamos/incidencias) para que cualquier
// página/componente hijo pueda leer sesión y datos con useAuth() /
// useSpaceHubData(), sin pasar props manualmente por cada nivel. MainLayout
// ya decide internamente qué módulo mostrar, así que aquí ya no hace falta
// pasarle ninguna página como children.
// ============================================================================

import { AuthProvider } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import { MainLayout } from "./components/MainLayout";

function App() {
  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <AuthProvider>
          <DataProvider>
            <MainLayout />
          </DataProvider>
        </AuthProvider>
      </div>
    </div>
  );
}

export default App;
