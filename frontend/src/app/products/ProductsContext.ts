import type React from 'react';
import { createContext } from 'react';
import type { ProductsAction, ProductsState } from './productsReducer';

export type ProductsContextValue = ProductsState & {
  dispatch: React.Dispatch<ProductsAction>;
};

export const ProductsContext = createContext<ProductsContextValue | null>(null);

