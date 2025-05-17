// src/app/admin/products/duplicate/[id]/page.tsx
import { notFound, redirect } from 'next/navigation';
import { productsApi } from '@/lib/api/mongoApi';
import { generateId } from '@/lib/utils/format';

type Props = {
  params: { id: string };
}

export default async function DuplicateProductPage({ params }: Props) {
  try {
    // Get the original product
    const originalProduct = await productsApi.getProductById(params.id);
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
    await productsApi.saveProduct(newProduct);

    // Redirect to edit page for the new product
    redirect(`/admin/products/${newProduct.id}?isDuplicate=true`);
  } catch (error) {
    console.error('Error duplicating product:', error);
    // В случае ошибки перенаправляем на страницу списка продуктов
    redirect('/admin/products');
  }
}