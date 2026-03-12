import type { Product } from '../../lib/types';

export type ProductsState = {
  products: Product[];
};

export type ProductsAction =
  | { type: 'hydrate'; products: Product[] }
  | { type: 'adjustStock'; id: number; delta: number }
  | { type: 'setStock'; id: number; stock: number };

function clampStock(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.trunc(value));
}

export function productsReducer(state: ProductsState, action: ProductsAction): ProductsState {
  switch (action.type) {
    case 'hydrate': {
      return { products: action.products };
    }
    case 'adjustStock': {
      return {
        products: state.products.map((p) =>
          p.id === action.id ? { ...p, stock: clampStock(p.stock + action.delta) } : p,
        ),
      };
    }
    case 'setStock': {
      return {
        products: state.products.map((p) =>
          p.id === action.id ? { ...p, stock: clampStock(action.stock) } : p,
        ),
      };
    }
    default: {
      return state;
    }
  }
}
