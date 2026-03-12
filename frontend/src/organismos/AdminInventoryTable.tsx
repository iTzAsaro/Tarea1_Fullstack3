import { formatCLP } from '../lib/formatCLP';
import type { Product } from '../lib/types';
import { StockControl } from '../moleculas/StockControl';

export function AdminInventoryTable({
  products,
  onAdjustStock,
  onSetStock,
}: {
  products: Product[];
  onAdjustStock: (id: number, delta: number) => void;
  onSetStock: (id: number, stock: number) => void;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-100 text-gray-700 uppercase text-xs tracking-wider">
            <th className="p-4 border-b">ID</th>
            <th className="p-4 border-b">Producto</th>
            <th className="p-4 border-b">Categoría</th>
            <th className="p-4 border-b">Precio</th>
            <th className="p-4 border-b text-center">Stock Actual</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {products.map((prod) => (
            <tr key={prod.id} className="hover:bg-gray-50 border-b border-gray-100 transition">
              <td className="p-4 font-mono text-gray-500">#{prod.id}</td>
              <td className="p-4 font-medium text-gray-900">
                <div className="flex items-center space-x-3">
                  <img
                    src={prod.imagenUrl}
                    alt={prod.nombre}
                    className="w-10 h-10 rounded object-cover shadow-sm"
                  />
                  <span>{prod.nombre}</span>
                </div>
              </td>
              <td className="p-4 text-gray-600">
                <span className="bg-gray-100 px-2 py-1 rounded text-xs">{prod.categoria}</span>
              </td>
              <td className="p-4 text-gray-900 font-medium">{formatCLP(prod.precio)}</td>
              <td className="p-4 text-center">
                <StockControl
                  value={prod.stock}
                  onDecrement={() => onAdjustStock(prod.id, -1)}
                  onIncrement={() => onAdjustStock(prod.id, 1)}
                  onChange={(value) => onSetStock(prod.id, value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

