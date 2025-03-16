// src/app/admin/sets/[id]/page.tsx
import { notFound } from 'next/navigation';
import { jsonDataService } from '@/lib/api/jsonDataService';
import SetForm from '@/components/admin/SetForm';

export default async function EditSetPage({ params }: { params: { id: string } }) {
  const set = await jsonDataService.getProductSetById(params.id);
  
  if (!set) {
    notFound();
  }
  
  const categories = await jsonDataService.getAllCategories();
  const products = await jsonDataService.getAllProducts();
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Product Set: {set.name}</h1>
      <SetForm productSet={set} categories={categories} products={products} />
    </div>
  );
}