// src/app/admin/categories/new/page.tsx
import CategoryForm from '@/components/admin/CategoryForm';
import { categoriesApi } from '@/lib/api/mongoApi';

export default async function NewCategoryPage() {
  const categories = await categoriesApi.getAllCategories();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Add New Category</h1>
      <CategoryForm categories={categories} />
    </div>
  );
}