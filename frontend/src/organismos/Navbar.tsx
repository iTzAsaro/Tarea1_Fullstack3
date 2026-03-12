import type React from 'react';
import { Settings, ShoppingBag, Store } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../utils/cn';

function NavButton({
  to,
  label,
  icon,
}: {
  to: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'px-3 py-2 rounded-md transition font-medium inline-flex items-center space-x-1',
          isActive ? 'bg-indigo-700 hover:bg-indigo-800' : 'hover:bg-indigo-700',
        )
      }
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </NavLink>
  );
}

export function Navbar() {
  return (
    <nav className="bg-indigo-600 text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2 text-xl font-bold">
          <Store className="w-6 h-6" />
          <span>MiTiendita</span>
        </div>
        <div className="flex space-x-4">
          <NavButton to="/" label="Tienda" icon={<ShoppingBag className="w-4 h-4" />} />
          <NavButton to="/admin" label="Administración" icon={<Settings className="w-4 h-4" />} />
        </div>
      </div>
    </nav>
  );
}
