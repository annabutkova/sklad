// src/app/admin/sets/[id]/page.tsx
import { notFound } from 'next/navigation';
import SetForm from '@/components/admin/SetForm';
import { categoriesApi, productsApi, setsApi } from '@/lib/api/serverApi';


type Props = {
  params: { id: string };
}

export default async function EditSetPage({ params }: Props) {
  const set = await setsApi.getSetById(params.id);

  if (!set) {
    notFound();
  }

  const categories = await categoriesApi.getAllCategories();
  const products = await productsApi.getAllProducts();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Product Set: {set.name}</h1>
      <SetForm productSet={set} categories={categories} products={products} />
    </div>
  );
}