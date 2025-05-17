// src/app/search/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import ProductCard from '@/components/shop/ProductCard/ProductCard';
import { productsApi, setsApi } from '@/lib/api/mongoApi';

interface SearchPageProps {
  searchParams: {
    q?: string;
  };
}

export function generateMetadata({ searchParams }: SearchPageProps): Metadata {
  const searchTerm = searchParams.q || '';
  return {
    title: `Search Results for "${searchTerm}" | Furniture Shop`,
    description: `Find furniture products matching "${searchTerm}" in our collection`,
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const searchTerm = searchParams.q || '';

  // If no search term provided, show empty state
  if (!searchTerm) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Search</h1>
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">No search term provided</h2>
          <p className="text-gray-600 mb-6">Please enter a search term to find products.</p>
          <Link href="/catalog" className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors">
            Browse Catalog
          </Link>
        </div>
      </div>
    );
  }

  // Get all products
  const products = await productsApi.getAllProducts();
  const sets = await setsApi.getAllSets();

  // Search in products
  const matchingProducts = products.filter(product => {
    const searchLower = searchTerm.toLowerCase();
    return (
      product.name.toLowerCase().includes(searchLower) ||
      (product.description && product.description.toLowerCase().includes(searchLower))
    );
  });

  // Search in sets
  const matchingSets = sets.filter(set => {
    const searchLower = searchTerm.toLowerCase();
    return (
      set.name.toLowerCase().includes(searchLower) ||
      (set.description && set.description.toLowerCase().includes(searchLower))
    );
  });

  const totalResults = matchingProducts.length + matchingSets.length;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Search Results</h1>
      <p className="text-gray-600 mb-8">
        Found {totalResults} result{totalResults !== 1 ? 's' : ''} for {searchTerm}
      </p>

      {totalResults === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">No products found</h2>
          <p className="text-gray-600 mb-6">Try a different search term or browse our catalog.</p>
          <Link href="/catalog" className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors">
            Browse Catalog
          </Link>
        </div>
      ) : (
        <div>
          {/* Products section */}
          {matchingProducts.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-semibold mb-6">Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {matchingProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}

          {/* Sets section */}
          {matchingSets.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-6">Collections</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {matchingSets.map(set => (
                  <div key={set.id} className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                    <Link href={`/set/${set.slug}`} className="block">
                      {set.images && set.images.length > 0 ? (
                        <div className="aspect-video relative">
                          <img
                            src={set.images[0].url}
                            alt={set.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                            Collection
                          </div>
                        </div>
                      ) : (
                        <div className="aspect-video bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500">No image</span>
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="text-lg font-semibold">{set.name}</h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{set.description}</p>
                        <div className="mt-4 text-blue-600 font-medium">View collection →</div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}