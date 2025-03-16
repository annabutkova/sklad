// src/app/cart/page.tsx
import { Metadata } from 'next';
import { jsonDataService } from '@/lib/api/jsonDataService';
import CartContents from './CartContents';

export const metadata: Metadata = {
  title: 'Shopping Cart | Furniture Shop',
  description: 'View and manage your shopping cart',
};

export default async function CartPage() {
  const products = await jsonDataService.getAllProducts();
  const sets = await jsonDataService.getAllProductSets();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      <CartContents products={products} sets={sets} />
    </div>
  );
}