// src/app/admin/products/new/page.tsx
import { jsonDataService } from '@/lib/api/jsonDataService';
import ProductForm from '@/components/admin/ProductForm';

export default async function NewProductPage() {
  const categories = await jsonDataService.getAllCategories();
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Add New Product</h1>
      <ProductForm categories={categories} />
    </div>
  );
}