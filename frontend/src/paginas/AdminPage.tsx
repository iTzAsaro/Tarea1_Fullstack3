import { useEffect, useState } from 'react';
import { useProducts } from '../app/products/useProducts';
import { SuccessMessage } from '../moleculas/SuccessMessage';
import { AdminInventoryTable } from '../organismos/AdminInventoryTable';

export function AdminPage() {
  const { products, dispatch } = useProducts();
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!showSuccess) return;
    const t = window.setTimeout(() => setShowSuccess(false), 2000);
    return () => window.clearTimeout(t);
  }, [showSuccess]);

  const notify = () => setShowSuccess(true);

  return (
    <section className="animate-fade-in">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
          <p className="text-gray-500 mt-1">Gestiona el inventario y stock de tus productos.</p>
        </div>
        <SuccessMessage visible={showSuccess} text="Stock actualizado" />
      </div>

      <AdminInventoryTable
        products={products}
        onAdjustStock={(id, delta) => {
          dispatch({ type: 'adjustStock', id, delta });
          notify();
        }}
        onSetStock={(id, stock) => {
          dispatch({ type: 'setStock', id, stock });
          notify();
        }}
      />
    </section>
  );
}

