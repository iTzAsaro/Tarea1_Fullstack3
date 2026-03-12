import type { Product } from './types';

export const productosIniciales: Product[] = [
  {
    id: 1,
    nombre: 'Audífonos Inalámbricos Pro',
    categoria: 'Tecnología',
    precio: 45990,
    descripcion: 'Audífonos con cancelación de ruido activa y batería de 24 horas.',
    stock: 15,
    imagenUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80'
  },
  {
    id: 2,
    nombre: 'Polera Básica Algodón',
    categoria: 'Ropa',
    precio: 12500,
    descripcion: 'Polera 100% algodón premium, ideal para el uso diario. Talla L.',
    stock: 50,
    imagenUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80'
  },
  {
    id: 3,
    nombre: 'Zapatillas Urbanas X',
    categoria: 'Calzado',
    precio: 65000,
    descripcion: 'Zapatillas cómodas y ligeras para caminar por la ciudad.',
    stock: 8,
    imagenUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80'
  },
  {
    id: 4,
    nombre: 'Smartwatch Deportivo',
    categoria: 'Tecnología',
    precio: 89990,
    descripcion: 'Reloj inteligente con monitor de ritmo cardíaco y GPS integrado.',
    stock: 0,
    imagenUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80'
  },
  {
    id: 5,
    nombre: 'Mochila Porta Notebook',
    categoria: 'Accesorios',
    precio: 34900,
    descripcion: "Mochila resistente al agua con compartimento para notebook de 15''.",
    stock: 22,
    imagenUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80'
  }
];
