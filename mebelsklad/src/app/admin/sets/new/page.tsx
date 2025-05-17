// src/app/admin/sets/new/page.tsx
import SetForm from '@/components/admin/SetForm';
import { categoriesApi, productsApi } from '@/lib/api/serverApi';

export default async function NewSetPage() {
  const categories = await categoriesApi.getAllCategories();
  const products = await productsApi.getAllProducts();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Add New Product Set</h1>
      <SetForm categories={categories} products={products} />
    </div>
  );
}