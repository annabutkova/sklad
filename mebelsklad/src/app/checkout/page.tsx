// src/app/checkout/page.tsx
import { Metadata } from 'next';
import { jsonDataService } from '@/lib/api/jsonDataService';
import CheckoutForm from './CheckoutForm';
import "./style.scss";
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Checkout | Furniture Shop',
  description: 'Complete your order',
};

export default async function CheckoutPage() {
  // We'll fetch products and sets to display the order summary
  const products = await jsonDataService.getAllProducts();

  return (
    <div className="main">
      <nav className="mb-8">
        <Link
          href="/cart"
          className="text-blue-600 hover:text-blue-800"
        >
          ← Вернуться в корзину
        </Link>
      </nav>

      <h1 className="page-header">Оформление заказа</h1>

      <CheckoutForm products={products} />
    </div>
  );
}