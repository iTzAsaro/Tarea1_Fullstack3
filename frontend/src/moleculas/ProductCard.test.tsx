import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Product } from '../lib/types';
import { ProductCard } from './ProductCard';

const product: Product = {
  id: 1,
  nombre: 'Audífonos',
  categoria: 'Tecnología',
  precio: 45990,
  descripcion: 'Desc',
  stock: 0,
  imagenUrl: 'https://example.com/img.jpg'
};

describe('ProductCard', () => {
  it('muestra AGOTADO cuando no hay stock', () => {
    render(<ProductCard product={product} />);
    expect(screen.getByText('AGOTADO')).toBeInTheDocument();
  });
});

