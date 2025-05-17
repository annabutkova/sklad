// src/app/admin/products/[id]/page.tsx
import { notFound } from 'next/navigation';
import { productsApi, categoriesApi } from '@/lib/api/serverApi';
import ProductForm from '@/components/admin/ProductForm';

type Props = {
  params: { id: string };
}

export default async function EditProductPage({ params }: Props) {
  const product = await productsApi.getProductById(params.id);
  if (!product) {
    notFound();
  }

  const categories = await categoriesApi.getAllCategories();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Product: {product.name}</h1>
      <ProductForm product={product} categories={categories} />
    </div>
  );
}