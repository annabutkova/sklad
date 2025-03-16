// src/app/admin/categories/new/page.tsx
import { jsonDataService } from '@/lib/api/jsonDataService';
import CategoryForm from '@/components/admin/CategoryForm';

export default async function NewCategoryPage() {
  const categories = await jsonDataService.getAllCategories();
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Add New Category</h1>
      <CategoryForm categories={categories} />
    </div>
  );
}