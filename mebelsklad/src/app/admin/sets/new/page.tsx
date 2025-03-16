// src/app/admin/sets/new/page.tsx
import { jsonDataService } from '@/lib/api/jsonDataService';
import SetForm from '@/components/admin/SetForm';

export default async function NewSetPage() {
  const categories = await jsonDataService.getAllCategories();
  const products = await jsonDataService.getAllProducts();
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Add New Product Set</h1>
      <SetForm categories={categories} products={products} />
    </div>
  );
}