// src/app/product/[slug]/page.tsx
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { jsonDataService } from '@/lib/api/jsonDataService';
import { formatPrice } from '@/lib/utils/format';
import AddToCartButton from '@/components/shop/AddToCartButton/AddToCartButton';
import ProductCard from '@/components/shop/ProductCard/ProductCard';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const product = await jsonDataService.getProductBySlug(params.slug);
  
  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }
  
  return {
    title: `${product.name} | Furniture Shop`,
    description: product.description || `Buy ${product.name} from our furniture shop.`,
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await jsonDataService.getProductBySlug(params.slug);
  
  if (!product) {
    notFound();
  }
  
  // Get category information
  const categories = await jsonDataService.getAllCategories();
  const category = categories.find(c => c.id === product.categoryId);
  
  // Get related products
  const relatedProducts = await jsonDataService.getProductsByCategory(product.categoryId);
  const filteredRelatedProducts = relatedProducts
    .filter(p => p.id !== product.id)
    .slice(0, 4);
  
  // Get main image
  const mainImage = product.images.find(img => img.isMain) || product.images[0];
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav className="mb-8">
        <ol className="flex text-sm">
          <li className="flex items-center">
            <Link href="/" className="text-gray-500 hover:text-gray-900">Home</Link>
            <svg className="mx-2 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </li>
          <li className="flex items-center">
            <Link 
              href="/catalog" 
              className="text-gray-500 hover:text-gray-900"
            >
              Catalog
            </Link>
            <svg className="mx-2 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </li>
          {category && (
            <li className="flex items-center">
              <Link 
                href={`/catalog?category=${category.slug}`} 
                className="text-gray-500 hover:text-gray-900"
              >
                {category.name}
              </Link>
              <svg className="mx-2 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </li>
          )}
          <li className="text-gray-900 font-medium">{product.name}</li>
        </ol>
      </nav>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Product images */}
        <div>
          <div className="rounded-lg overflow-hidden mb-4">
            <Image
              src={mainImage.url}
              alt={mainImage.alt || product.name}
              width={600}
              height={600}
              className="w-full h-auto object-cover"
              priority
            />
          </div>
          
          {/* Thumbnail gallery */}
          {product.images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {product.images.map((image, index) => (
                <div key={index} className={`
                  rounded-md overflow-hidden cursor-pointer
                  ${image.isMain ? 'ring-2 ring-blue-500' : 'border border-gray-200'}
                `}>
                  <Image
                    src={image.url}
                    alt={image.alt || `${product.name} image ${index + 1}`}
                    width={100}
                    height={100}
                    className="w-full h-20 object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Product info */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          
          {/* Price */}
          <div className="mb-6">
            {product.discount && product.discount > 0 ? (
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold">
                  {formatPrice(product.price - product.discount)}
                </span>
                <span className="text-xl text-gray-500 line-through">
                  {formatPrice(product.price)}
                </span>
                <span className="bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded">
                  -{Math.round((product.discount / product.price) * 100)}%
                </span>
              </div>
            ) : (
              <span className="text-3xl font-bold">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          
          {/* Add to cart */}
          <div className="mb-8">
            <AddToCartButton productId={product.id} />
          </div>
          
          {/* Description */}
          {product.description && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <p className="text-gray-700">{product.description}</p>
            </div>
          )}
          
          {/* Specifications */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-2">Specifications</h2>
              <div className="border-t border-gray-200">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="py-3 flex justify-between border-b border-gray-200">
                    <span className="text-gray-500">{key}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Dimensions */}
          {product.dimensions && Object.values(product.dimensions).some(v => v) && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-2">Dimensions</h2>
              <div className="border-t border-gray-200">
                {product.dimensions.width && (
                  <div className="py-3 flex justify-between border-b border-gray-200">
                    <span className="text-gray-500">Width</span>
                    <span className="font-medium">{product.dimensions.width} cm</span>
                  </div>
                )}
                {product.dimensions.height && (
                  <div className="py-3 flex justify-between border-b border-gray-200">
                    <span className="text-gray-500">Height</span>
                    <span className="font-medium">{product.dimensions.height} cm</span>
                  </div>
                )}
                {product.dimensions.depth && (
                  <div className="py-3 flex justify-between border-b border-gray-200">
                    <span className="text-gray-500">Depth</span>
                    <span className="font-medium">{product.dimensions.depth} cm</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Related products */}
      {filteredRelatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">You might also like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredRelatedProducts.map(relatedProduct => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}