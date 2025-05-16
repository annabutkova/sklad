// src/app/admin/products/duplicate/[id]/page.tsx
import { notFound, redirect } from 'next/navigation';
import { jsonDataService } from '@/lib/api/jsonDataService';
import { generateId } from '@/lib/utils/format';

export default async function DuplicateProductPage({ params }: { params: { id: string } }) {
  // Get the original product
  const originalProduct = await jsonDataService.getProductById(params.id);

  if (!originalProduct) {
    notFound();
  }

  // Create a copy with a new ID and slightly modified name
  const newProduct = {
    ...originalProduct,
    id: generateId('PROD'),
    name: `${originalProduct.name} (Copy)`,
    slug: `${originalProduct.slug}-copy`
  };

  // Save the new product
  await jsonDataService.saveProduct(newProduct);

  // Redirect to edit page for the new product
  redirect(`/admin/products/${newProduct.id}?isDuplicate=true`);
}