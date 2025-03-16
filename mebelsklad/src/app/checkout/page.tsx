// src/app/checkout/page.tsx
import { Metadata } from 'next';
import { jsonDataService } from '@/lib/api/jsonDataService';
import CheckoutForm from './CheckoutForm';

export const metadata: Metadata = {
  title: 'Checkout | Furniture Shop',
  description: 'Complete your order',
};

export default async function CheckoutPage() {
  // We'll fetch products and sets to display the order summary
  const products = await jsonDataService.getAllProducts();
  const sets = await jsonDataService.getAllProductSets();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <CheckoutForm products={products} sets={sets} />
      </div>
    </div>
  );
}