import type React from 'react';
import { useEffect, useMemo, useReducer } from 'react';
import { productosIniciales } from '../../lib/productosIniciales';
import type { Product } from '../../lib/types';
import { productsReducer } from './productsReducer';
import { ProductsContext } from './ProductsContext';

const STORAGE_KEY = 'mitiendita.products.v1';

function loadProductsFromStorage(): Product[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    return parsed as Product[];
  } catch {
    return null;
  }
}

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(productsReducer, { products: productosIniciales });

  useEffect(() => {
    const stored = loadProductsFromStorage();
    if (stored) {
      dispatch({ type: 'hydrate', products: stored });
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.products));
    } catch {
      return;
    }
  }, [state.products]);

  const value = useMemo(() => ({ ...state, dispatch }), [state]);

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}
