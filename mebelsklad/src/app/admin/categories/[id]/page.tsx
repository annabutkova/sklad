// src/app/admin/categories/[id]/page.tsx
"use client"

import { notFound } from 'next/navigation';
import CategoryForm from '@/components/admin/CategoryForm';

import { useParams } from 'next/navigation';
import { categoriesApi } from '@/lib/api/mongoApi';

export default async function EditCategoryPage() {
  const params = useParams();
  const categories = await categoriesApi.getAllCategories();
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