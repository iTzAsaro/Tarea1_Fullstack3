import { describe, expect, it } from 'vitest';
import type { Product } from '../../lib/types';
import { productsReducer } from './productsReducer';

const base: Product = {
  id: 1,
  nombre: 'Test',
  categoria: 'Cat',
  precio: 1000,
  descripcion: 'Desc',
  stock: 1,
  imagenUrl: 'https://example.com/img.jpg'
};

describe('productsReducer', () => {
  it('ajusta stock y clamp a 0', () => {
    const state = { products: [base] };
    const next = productsReducer(state, { type: 'adjustStock', id: 1, delta: -2 });
    expect(next.products[0]?.stock).toBe(0);
  });

  it('establece stock y convierte a entero', () => {
    const state = { products: [base] };
    const next = productsReducer(state, { type: 'setStock', id: 1, stock: 3.9 });
    expect(next.products[0]?.stock).toBe(3);
  });
});

