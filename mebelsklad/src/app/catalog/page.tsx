// src/app/catalog/page.tsx
import { Suspense } from 'react';
import { jsonDataService } from '@/lib/api/jsonDataService';
import { Category, Product, ProductSet } from '@/types';
import ProductCard from '@/components/shop/ProductCard/ProductCard';
import SetCard from '@/components/shop/SetCard';
import CategorySidebar from '@/components/shop/CategorySidebar';
import SortSelector from '@/components/shop/SortSelector';

interface CatalogPageProps {
  searchParams: {
    category?: string;
    sort?: string;
    type?: string; // Parameter to filter by type (products/sets)
  };
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  // Create a local copy of the search params
  const params = { ...searchParams };
  const categorySlug = params.category;
  const sortOption = params.sort || 'name-asc';
  const contentType = params.type || 'all'; // 'all', 'products', or 'sets'
  
  const categories = await jsonDataService.getAllCategories();
  const categoryTree = await jsonDataService.getCategoryTree();
  const allProducts = await jsonDataService.getAllProducts();
  const allSets = await jsonDataService.getAllProductSets();
  
  // Verify that products and sets have the correct type field
  const typedProducts = allProducts.filter(p => p.type === 'product');
  const typedSets = allSets.filter(s => s.type === 'set');
  
  let products: Product[] = [];
  let sets: ProductSet[] = [];
  let activeCategory: Category | null = null;
  
  if (categorySlug) {
    // Find the selected category
    activeCategory = categories.find(c => c.slug === categorySlug) || null;
    
    if (activeCategory) {
      // Check if this category has any sets
      const categorySets = typedSets.filter(set => set.categoryId === activeCategory!.id);
      
      // Check if this category has any individual products
      const categoryProducts = typedProducts.filter(product => product.categoryId === activeCategory!.id);
      
      // Determine what content to show based on available items and content type filter
      if (contentType === 'products' || (contentType === 'all' && categoryProducts.length > 0)) {
        products = categoryProducts;
      }
      
      if (contentType === 'sets' || (contentType === 'all' && categorySets.length > 0)) {
        sets = categorySets;
      }
      
      // If the category only has sets and no type is specified, show only sets
      if (contentType === 'all' && categorySets.length > 0 && categoryProducts.length === 0) {
        // This is a "sets-only" category (like bedroom)
        sets = categorySets;
        products = []; // Clear products to show only sets
      }
    } else {
      // Category not found - get all products and sets based on content type
      if (contentType === 'all' || contentType === 'products') {
        products = typedProducts;
      }
      if (contentType === 'all' || contentType === 'sets') {
        sets = typedSets;
      }
    }
  } else {
    // No category selected - get all products and sets based on content type
    if (contentType === 'all' || contentType === 'products') {
      products = typedProducts;
    }
    if (contentType === 'all' || contentType === 'sets') {
      sets = typedSets;
    }
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
  
  // Sort product sets
  const sortSets = (sets: ProductSet[], sortOption: string) => {
    switch (sortOption) {
      case 'name-asc':
        return [...sets].sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return [...sets].sort((a, b) => b.name.localeCompare(a.name));
      case 'price-asc':
        return [...sets].sort((a, b) => {
          // Calculate total price for set A
          const aTotalPrice = a.items.reduce((sum, item) => {
            const product = typedProducts.find(p => p.id === item.productId);
            if (!product) return sum;
            const productPrice = product.discount 
              ? product.price - product.discount 
              : product.price;
            return sum + (productPrice * item.defaultQuantity);
          }, 0);
          
          // Calculate total price for set B
          const bTotalPrice = b.items.reduce((sum, item) => {
            const product = typedProducts.find(p => p.id === item.productId);
            if (!product) return sum;
            const productPrice = product.discount 
              ? product.price - product.discount 
              : product.price;
            return sum + (productPrice * item.defaultQuantity);
          }, 0);
          
          return aTotalPrice - bTotalPrice;
        });
      case 'price-desc':
        return [...sets].sort((a, b) => {
          // Calculate total price for set A
          const aTotalPrice = a.items.reduce((sum, item) => {
            const product = typedProducts.find(p => p.id === item.productId);
            if (!product) return sum;
            const productPrice = product.discount 
              ? product.price - product.discount 
              : product.price;
            return sum + (productPrice * item.defaultQuantity);
          }, 0);
          
          // Calculate total price for set B
          const bTotalPrice = b.items.reduce((sum, item) => {
            const product = typedProducts.find(p => p.id === item.productId);
            if (!product) return sum;
            const productPrice = product.discount 
              ? product.price - product.discount 
              : product.price;
            return sum + (productPrice * item.defaultQuantity);
          }, 0);
          
          return bTotalPrice - aTotalPrice;
        });
      default:
        return sets;
    }
  };
  
  const sortedProducts = sortProducts(products, sortOption);
  const sortedSets = sortSets(sets, sortOption);
  
  // Calculate total items count
  const totalItems = sortedProducts.length + sortedSets.length;
  
  // Flag to determine if we're only showing sets
  const showingSetsOnly = sortedProducts.length === 0 && sortedSets.length > 0;
  
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
              {totalItems} {totalItems === 1 ? 'item' : 'items'} found
            </div>
            <div className="flex items-center gap-4">
              {/* Content type filter - only show if this category has both types */}
              {activeCategory && typedProducts.some(p => p.categoryId === activeCategory?.id) && 
                typedSets.some(s => s.categoryId === activeCategory?.id) && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Show:</span>
                  <select
                    className="border rounded-md p-1 text-sm"
                    defaultValue={contentType}
                    onChange={(e) => {
                      const url = new URL(window.location.href);
                      url.searchParams.set('type', e.target.value);
                      window.location.href = url.toString();
                    }}
                  >
                    <option value="all">All Items</option>
                    <option value="sets">Collections Only</option>
                    <option value="products">Products Only</option>
                  </select>
                </div>
              )}
              <SortSelector currentSort={sortOption} />
            </div>
          </div>
          
          {/* Empty state */}
          {totalItems === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">No items found</h2>
              <p className="text-gray-600">Try selecting a different category or filter.</p>
            </div>
          )}
          
          {/* Product sets section */}
          {sortedSets.length > 0 && (
            <div className="mb-8">
              {!showingSetsOnly && <h2 className="text-xl font-semibold mb-4">Collections</h2>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {sortedSets.map(set => (
                  <SetCard key={set.id} set={set} allProducts={typedProducts} />
                ))}
              </div>
            </div>
          )}
          
          {/* Individual products section */}
          {sortedProducts.length > 0 && (
            <div>
              {sortedSets.length > 0 && <h2 className="text-xl font-semibold mb-4">Individual Products</h2>}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}