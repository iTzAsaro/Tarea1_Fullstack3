import { useContext } from 'react';
import { ProductsContext } from './ProductsContext';

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) {
    throw new Error('ProductsContext no está disponible');
  }
  return ctx;
}
