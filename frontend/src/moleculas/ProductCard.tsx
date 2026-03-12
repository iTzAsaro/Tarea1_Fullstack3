import { Ban, ShoppingCart } from 'lucide-react';
import { Badge } from '../atomos/Badge';
import { Button } from '../atomos/Button';
import { formatCLP } from '../lib/formatCLP';
import type { Product } from '../lib/types';
import { cn } from '../utils/cn';

export function ProductCard({ product }: { product: Product }) {
  const agotado = product.stock <= 0;
  const stockClass =
    product.stock > 5 ? 'text-green-600' : product.stock > 0 ? 'text-orange-500' : 'text-red-500';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition duration-300 flex flex-col">
      <div className="relative h-48 bg-gray-200">
        <img
          src={product.imagenUrl}
          alt={product.nombre}
          className={cn('w-full h-full object-cover', agotado && 'grayscale opacity-70')}
        />
        <div className="absolute top-2 right-2">
          <Badge>{product.categoria}</Badge>
        </div>
        {agotado && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white font-bold text-lg border-2 border-white px-3 py-1 rounded rotate-12">
              AGOTADO
            </span>
          </div>
        )}
      </div>
      <div className="p-5 flex-grow flex flex-col">
        <h2 className="text-lg font-bold text-gray-800 leading-tight mb-1">{product.nombre}</h2>
        <p className="text-sm text-gray-500 mb-4 flex-grow">{product.descripcion}</p>

        <div className="flex items-end justify-between mt-auto">
          <div>
            <p className="text-xl font-extrabold text-indigo-600">{formatCLP(product.precio)}</p>
            <p className={cn('text-xs font-medium mt-1', stockClass)}>
              {product.stock > 0 ? `En stock: ${product.stock} un.` : 'Sin unidades'}
            </p>
          </div>
          <Button
            variant={agotado ? 'secondary' : 'primary'}
            disabled={agotado}
            className={cn(
              'p-2 rounded-full',
              agotado && 'bg-gray-300 hover:bg-gray-300 text-white',
            )}
            title="Agregar al carrito"
            type="button"
          >
            {agotado ? <Ban className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
