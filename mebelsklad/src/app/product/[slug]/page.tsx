// src/app/product/[slug]/page.tsx
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { jsonDataService } from '@/lib/api/jsonDataService';
import { formatPrice } from '@/lib/utils/format';
import AddToCartButton from '@/components/shop/AddToCartButton/AddToCartButton';
import ProductCard from '@/components/shop/ProductCard/ProductCard';
import './style.scss';
import SpecificationRow from '@/components/SpecificationRow';
import ImageGallery from 'react-image-gallery';

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
  const relatedProducts = await jsonDataService.getProductsByCategory(product.categoryId);
  const filteredRelatedProducts = relatedProducts
    .filter(p => p.id !== product.id)
    .slice(0, 4);

  // Get main image
  const mainImage = product.images.find(img => img.isMain) || product.images[0];
  const images = product.images.map(image => ({
    original: image.url,
    thumbnail: image.url,
    originalAlt: image.alt || product.name,
    thumbnailAlt: image.alt || product.name
  }));

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
        {/* <div className="product-page_images-wrapper">
          <Image
            src={mainImage.url}
            alt={mainImage.alt || product.name}
            width={0}
            height={0}
            sizes="100vw"
            style={{ width: "100%", height: "auto" }}
            className="product-page_image"
            priority
          />

          {product.images.length > 1 && (
            <div className="product-page_thumbnails">
              {product.images.map((image, index) => (
                <div key={index} className={`
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
        </div> */}



        <ImageGallery
          items={images}
          showPlayButton={false}
          showFullscreenButton={true}
          useBrowserFullscreen={false}
          showNav={true}
        />



        {/* Product info */}
        <div className="product-page_info">
          <h1 className="product-page_title">{product.name}</h1>

          <ul className="product-page_list">


            {product.specifications?.color && (
              <li className="product-page_list-item">
                <span className="product-page_list-option">цвет</span>
                <span className="product-page_list-value">{product.specifications?.color} </span>
              </li>
            )}


            {product.specifications?.dimensions && Object.values(product.specifications.dimensions).some(v => v) && (
              <>
                {product.specifications?.dimensions?.width && product.specifications?.dimensions?.height && product.specifications?.dimensions?.depth && (
                  <li className="product-page_list-item">
                    <span className="product-page_list-option">габариты (Ш×В×Г), см</span>
                    <span className="product-page_list-value">{product.specifications.dimensions.width} × {product.specifications.dimensions.height} × {product.specifications.dimensions.depth} </span>
                  </li>
                )}
              </>
            )}

            {product.specifications?.material && (
              <li className="product-page_list-item">
                <span className="product-page_list-option">материал</span>
                <span className="product-page_list-value">{String(product.specifications?.material)} </span>
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
          <div className="product-page_table">
            <h2 className="product-page_subheader">Характеристики товара</h2>

            {/* Материалы */}
            {product.specifications.material?.karkas && (
              <SpecificationRow label="Материал каркаса" value={product.specifications.material.karkas} />
            )}
            {product.specifications.material?.fasad && (
              <SpecificationRow label="Материал фасада" value={product.specifications.material.fasad} />
            )}
            {product.specifications.material?.obivka && (
              <SpecificationRow label="Обивка" value={product.specifications.material.obivka} />
            )}

            {/* Стиль и цвета */}
            {product.specifications.style?.style && (
              <SpecificationRow label="Стиль" value={product.specifications.style.style} />
            )}
            {product.specifications.style?.color?.karkas && (
              <SpecificationRow label="Цвет каркаса" value={product.specifications.style.color.karkas} />
            )}
            {product.specifications.style?.color?.fasad && (
              <SpecificationRow label="Цвет фасада" value={product.specifications.style.color.fasad} />
            )}
            {product.specifications.style?.color?.obivka && (
              <SpecificationRow label="Цвет обивки" value={product.specifications.style.color.obivka} />
            )}

            {/* Размеры */}
            {product.specifications.dimensions && (
              <SpecificationRow
                label="Габариты (Ш×В×Г), см"
                value={`${product.specifications.dimensions.width ?? '-'} × ${product.specifications.dimensions.height ?? '-'} × ${product.specifications.dimensions.depth ?? '-'}`}
              />
            )}
            {product.specifications.bedSize && (
              <SpecificationRow label="Спальное место" value={product.specifications.bedSize} />
            )}

            {/* Наполнение */}
            {product.specifications.content?.polki !== undefined && (
              <SpecificationRow label="Полки" value={product.specifications.content.polki} />
            )}
            {product.specifications.content?.yashiki !== undefined && (
              <SpecificationRow label="Ящики" value={product.specifications.content.yashiki} />
            )}


            {/* Гарантия */}
            {product.specifications.warranty?.duration && (
              <SpecificationRow label="Гарантия" value={`${product.specifications.warranty.duration} мес.`} />
            )}
            {product.specifications.warranty?.production && (
              <SpecificationRow label="Производитель" value={product.specifications.warranty.production} />
            )}
            {product.specifications.warranty?.lifetime && (
              <SpecificationRow label="Срок службы" value={product.specifications.warranty.lifetime} />
            )}
          </div>
        )}
      </div>

      {/* Related products */}
      {filteredRelatedProducts.length > 0 && (
        <div>
          <h2 className="product-page_subheader">Товары из серии</h2>
          <div className="products-wrapper">
            {filteredRelatedProducts.map(relatedProduct => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}