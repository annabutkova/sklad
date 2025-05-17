// src/app/set/[slug]/page.tsx
import { notFound } from 'next/navigation';
import SetDetail, { SetDetailProps } from './SetDetail';
import "./style.scss";
import { productsApi, setsApi } from '@/lib/api/mongoApi';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const paramsData = await params;
  const set = await setsApi.getSetBySlug(paramsData.slug);

  if (!set) {
    return {
      title: 'Set Not Found',
    };
  }

  return {
    title: `${set.name} | Furniture Shop`,
    description: set.description || `Buy ${set.name} collection from our furniture shop.`,
  };
}

export default async function SetPage({ params }: { params: { slug: string } }) {
  const paramsData = await params;
  const set = await setsApi.getSetBySlug(paramsData.slug);

  if (!set) {
    notFound();
  }

  // Get all products to have full product details
  const products = await productsApi.getAllProducts();

  const relatedProducts = await productsApi.getProductsByCollection(set.collection);
  const relatedSets = await setsApi.getSetsByCollection(set.collection);

  // Filter products to only include those in the set
  const setProducts = set.items
    .map(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        return {
          product,
          defaultQuantity: item.defaultQuantity,
          minQuantity: item.minQuantity,
          maxQuantity: item.maxQuantity,
          required: item.required
        };
      }
      return null;
    })
    .filter(Boolean);

  return <SetDetail set={set} setProducts={setProducts.filter(Boolean) as SetDetailProps['setProducts']} relatedSets={relatedSets} relatedProducts={relatedProducts} />;
}