import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <section className="animate-fade-in">
      <div className="max-w-md bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">Página no encontrada</h1>
        <p className="text-gray-600 mt-2">La ruta que intentas visitar no existe.</p>
        <Link
          to="/"
          className="mt-4 inline-flex items-center justify-center rounded-md transition font-medium bg-gray-900 hover:bg-gray-800 text-white px-4 py-2"
        >
          Volver a la tienda
        </Link>
      </div>
    </section>
  );
}
