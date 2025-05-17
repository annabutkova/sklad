// src/app/cart/page.tsx
import { Metadata } from 'next';
import CartContents from './CartContents';
import "./style.scss";
import Link from 'next/link';
import { clientApi } from '@/lib/api/clientApi';

export const metadata: Metadata = {
  title: 'Корзина | Mebelsklad',
  description: 'Просмотреть содержимое корзины и оформить заказ',
};

export default async function CartPage() {
  const products = await clientApi.getAllProducts();
  const sets = await clientApi.getAllProductSets();

  return (
    <div className="main">
      <nav className="mb-8">
        <Link
          href="/catalog"
          className="text-blue-600 hover:text-blue-800"
        >
          ← Вернуться в каталог
        </Link>
      </nav>

      <h1 className="page-header">Корзина</h1>
      <CartContents products={products} sets={sets} />
    </div>
  );
}