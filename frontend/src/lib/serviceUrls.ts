export const serviceUrls = {
  inventory: (import.meta.env.VITE_INVENTORY_API as string | undefined) ?? '/api/inventory',
  orders: (import.meta.env.VITE_ORDERS_API as string | undefined) ?? '/api/orders',
  users: (import.meta.env.VITE_USERS_API as string | undefined) ?? '/api/users',
  stock: (import.meta.env.VITE_STOCK_API as string | undefined) ?? '/api/stock',
  payments: (import.meta.env.VITE_PAYMENTS_API as string | undefined) ?? '/api/payments',
  shipping: (import.meta.env.VITE_SHIPPING_API as string | undefined) ?? '/api/shipping',
  customer: (import.meta.env.VITE_CUSTOMER_API as string | undefined) ?? '/api/customer',
};

