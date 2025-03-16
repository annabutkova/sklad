// src/app/catalog/page.tsx
import { Suspense } from 'react';
import { jsonDataService } from '@/lib/api/jsonDataService';
import { Category, Product } from '@/types';
import ProductCard from '@/components/shop/ProductCard/ProductCard';
import CategorySidebar from '@/components/shop/CategorySidebar';
import SortSelector from '@/components/shop/SortSelector';

interface CatalogPageProps {
  searchParams: {
    category?: string;
    sort?: string;
  };
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  // Create a local copy of the search params to avoid the error
  const params = { ...searchParams };
  const categorySlug = params.category;
  const sortOption = params.sort || 'name-asc';
  
  const categories = await jsonDataService.getAllCategories();
  const categoryTree = await jsonDataService.getCategoryTree();
  
  let products: Product[] = [];
  let activeCategory: Category | null = null;
  
  if (categorySlug) {
    // Find the selected category
    activeCategory = categories.find(c => c.slug === categorySlug) || null;
    
    if (activeCategory) {
      // Get products for this category
      products = await jsonDataService.getProductsByCategory(activeCategory.id);
    } else {
      // Category not found - get all products
      products = await jsonDataService.getAllProducts();
    }
  } else {
    // No category selected - get all products
    products = await jsonDataService.getAllProducts();
  }
  
  // Sort products
  const sortProducts = (products: Product[], sortOption: string) => {
    switch (sortOption) {
      case 'name-asc':
        return [...products].sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return [...products].sort((a, b) => b.name.localeCompare(a.name));
      case 'price-asc':
        return [...products].sort((a, b) => {
          const aPrice = a.discount ? a.price - a.discount : a.price;
          const bPrice = b.discount ? b.price - b.discount : b.price;
          return aPrice - bPrice;
        });
      case 'price-desc':
        return [...products].sort((a, b) => {
          const aPrice = a.discount ? a.price - a.discount : a.price;
          const bPrice = b.discount ? b.price - b.discount : b.price;
          return bPrice - aPrice;
        });
      default:
        return products;
    }
  };
  
  const sortedProducts = sortProducts(products, sortOption);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">
        {activeCategory ? activeCategory.name : 'All Products'}
      </h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Category sidebar */}
        <div className="md:w-1/4">
          <Suspense fallback={<div>Loading categories...</div>}>
            <CategorySidebar 
              categories={categoryTree} 
              activeCategory={activeCategory ? activeCategory.id : null} 
            />
          </Suspense>
        </div>
        
        {/* Product grid */}
        <div className="md:w-3/4">
          {/* Sort and filter options */}
          <div className="flex justify-between items-center mb-6">
            <div className="text-sm text-gray-500">
              {sortedProducts.length} products
            </div>
            <SortSelector currentSort={sortOption} />
          </div>
          
          {sortedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">No products found</h2>
              <p className="text-gray-600">Try selecting a different category or search term.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}