// src/app/admin/products/[id]/page.tsx
import { notFound } from 'next/navigation';
import { jsonDataService } from '@/lib/api/jsonDataService';
import ProductForm from '@/components/admin/ProductForm';

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const product = await jsonDataService.getProductById(params.id);
  
  if (!product) {
    notFound();
  }
  
  const categories = await jsonDataService.getAllCategories();
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Product: {product.name}</h1>
      <ProductForm product={product} categories={categories} />
    </div>
  );
}