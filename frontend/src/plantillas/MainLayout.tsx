import { Outlet } from 'react-router-dom';
import { Navbar } from '../organismos/Navbar';

export function MainLayout() {
  return (
    <div className="bg-gray-50 text-gray-800 font-sans min-h-screen flex flex-col">
      <Navbar />
      <main className="container mx-auto px-4 py-8 flex-grow">
        <Outlet />
      </main>
      <footer className="bg-gray-800 text-gray-400 py-6 text-center text-sm mt-auto">
        <p>&copy; 2026 MiTiendita. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
