import { ProductGrid } from '../organismos/ProductGrid';
import { useProducts } from '../app/products/useProducts';

export function TiendaPage() {
  const { products } = useProducts();

  return (
    <section className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Nuestros Productos</h1>
        <p className="text-gray-500 mt-1">Descubre lo mejor de nuestro catálogo.</p>
      </div>
      <ProductGrid products={products} />
    </section>
  );
}
