// src/app/admin/categories/[id]/page.tsx
import { notFound } from 'next/navigation';
import { jsonDataService } from '@/lib/api/jsonDataService';
import CategoryForm from '@/components/admin/CategoryForm';

export default async function EditCategoryPage({ params }: { params: { id: string } }) {
  const categories = await jsonDataService.getAllCategories();
  const category = categories.find(c => c.id === params.id);
  
  if (!category) {
    notFound();
  }
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Category: {category.name}</h1>
      <CategoryForm category={category} categories={categories.filter(c => c.id !== category.id)} />
    </div>
  );
}