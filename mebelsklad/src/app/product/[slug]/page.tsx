// src/app/product/[slug]/page.tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { jsonDataService } from '@/lib/api/jsonDataService';
import { formatPrice } from '@/lib/utils/format';
import AddToCartButton from '@/components/shop/AddToCartButton/AddToCartButton';
import ProductCard from '@/components/shop/ProductCard/ProductCard';
import './style.scss';
import SpecificationRow from '@/components/shop/SpecificationsTable/SpecificationRow';
import ProductGallery from '@/components/shop/ProductGallery/ProductGallery';
import SpecificationsTable from '@/components/shop/SpecificationsTable/SpecificationsTable';
import SetCard from '@/components/shop/SetCard/SetCard';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const paramsData = await params;
  const product = await jsonDataService.getProductBySlug(paramsData.slug);

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
  const paramsData = await params;
  const product = await jsonDataService.getProductBySlug(paramsData.slug);

  if (!product) {
    notFound();
  }

  // Get category information
  const categories = await jsonDataService.getAllCategories();
  const category = categories.find(c => c.id === product.categoryId);

  // Get related products
  const relatedProducts = await jsonDataService.getProductsByCollection(product.collection);
  const allProducts = await jsonDataService.getAllProducts();

  const relatedSets = await jsonDataService.getProductSetsByCollection(product.collection);


  return (
    <div className="main">
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

      <div className="product-page">
        {/* Product images */}

        <ProductGallery images={product.images} />

        {/* Product info */}
        <div className="product-page_info">
          <h1 className="product-page_title">{product.name}</h1>

          <ul className="product-page_list">


            {(product.specifications?.style?.color?.karkas || product.specifications?.style?.color?.fasad) && (
              <li className="product-page_list-item">
                <span className="product-page_list-option">цвет</span>
                <span className="product-page_list-value">
                  {[
                    product.specifications.style.color.karkas && `${product.specifications.style.color.karkas}`,
                    product.specifications.style.color.fasad && `${product.specifications.style.color.fasad}`
                  ].filter(Boolean).join(', ')}
                </span>
              </li>
            )}


            {product.specifications?.dimensions && Object.values(product.specifications.dimensions).some(v => v && typeof v === 'number' && v > 0) && (
              <>
                {product.specifications?.dimensions?.width != null && product.specifications.dimensions.width > 0 &&
                  product.specifications.dimensions.height != null && product.specifications.dimensions.height > 0 &&
                  product.specifications.dimensions.depth != null && product.specifications.dimensions.depth > 0 && (
                    <li className="product-page_list-item">
                      <span className="product-page_list-option">габариты (Ш×В×Г), см</span>
                      <span className="product-page_list-value">{product.specifications.dimensions.width} × {product.specifications.dimensions.height} × {product.specifications.dimensions.depth} </span>
                    </li>
                  )}
                {product.specifications?.dimensions?.width != null && product.specifications.dimensions.width > 0 &&
                  product.specifications.dimensions.height != null && product.specifications.dimensions.height > 0 &&
                  product.specifications.dimensions.length != null && product.specifications.dimensions.length > 0 && (
                    <li className="product-page_list-item">
                      <span className="product-page_list-option">габариты (Ш×В×Д), см</span>
                      <span className="product-page_list-value">{product.specifications.dimensions.width} × {product.specifications.dimensions.height} × {product.specifications.dimensions.length} </span>
                    </li>
                  )}
              </>
            )}

            {(product.specifications?.material?.karkas) && (
              <li className="product-page_list-item">
                <span className="product-page_list-option">каркас</span>
                <span className="product-page_list-value">
                  {
                    product.specifications.material.karkas
                  }
                </span>
              </li>
            )}

            {(product.specifications?.material?.fasad) && (
              <li className="product-page_list-item">
                <span className="product-page_list-option">фасад</span>
                <span className="product-page_list-value">
                  {
                    product.specifications.material.fasad
                  }
                </span>
              </li>
            )}

            {(product.specifications?.material?.obivka) && (
              <li className="product-page_list-item">
                <span className="product-page_list-option">обивка</span>
                <span className="product-page_list-value">
                  {
                    product.specifications.material.obivka
                  }
                </span>
              </li>
            )}

            <a href="#harakteristiki" className="product-page_link">Все характеристики</a>


          </ul>

          {/* Price */}
          <div className="product-page_price-wrapper">
            {product.discount && product.discount > 0 ? (
              <>
                <span className="product-page_old-price">
                  {formatPrice(product.price)}
                </span>
                <span className="product-page_new-price">
                  {formatPrice(product.price - product.discount)}
                </span>
                <span className="product-page_discount">
                  -{Math.round((product.discount / product.price) * 100)}%
                </span>
              </>
            ) : (
              <span className="product-page_price">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Add to cart */}
          <div>
            <AddToCartButton productId={product.id} />
          </div>
        </div>
      </div>
      <div id="#harakteristiki" className="product-page">
        {/* Description */}
        {product.description && (
          <div className="product-page_description">
            <h2 className="product-page_subheader">Характеристики товара</h2>
            <p className="text-gray-700">{product.description}</p>
          </div>
        )}

        {/* Specifications */}
        {product.specifications && (
          <SpecificationsTable specifications={product.specifications} />
        )}
      </div>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="product-page_subheader">Товары из серии</h2>
          <div className="products-wrapper">
            {relatedProducts.map(relatedProduct => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}

      {relatedSets.length > 0 && (
        <div>
          <h2 className="product-page_subheader">Комплекты из серии</h2>
          <div className="products-wrapper">
            {relatedSets.map(relatedSet => (
              <SetCard key={relatedSet.id} set={relatedSet} allProducts={allProducts} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}