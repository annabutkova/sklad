"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils/format";
import "./ProductCard.scss";
import AddToCartButton from "../AddToCartButton/AddToCartButton";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const mainImage =
    product.images.find((img) => img.isMain) || product.images[0];

  const secondaryImage = product.images && product.images.length > 1
    ? product.images.find(img => !img.isMain) || product.images[1]
    : null;

  // URL изображения по умолчанию, если нет изображений
  //const defaultImageUrl = '/images/placeholder.jpg';

  return (
    <div className="product-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/product/${product.slug}`} className="product-link">
        {product.discount !== 0 && (
          <div className="product-label product-discount-label">
            -{Math.round(((product.discount ?? 0) / product.price) * 100)}%
          </div>
        )}
        {product.inStock && (
          <div className="product-label product-inStock-label">в наличии</div>
        )}

        <Image
          src={mainImage.url}
          alt={mainImage.alt || product.name}
          width={0}
          height={0}
          sizes="100vw"
          className={`product-img ${isHovered && secondaryImage ? 'product-img--is-hidden' : 'product-img--is-visible'}`}
        />

        {secondaryImage && (
          <Image
            src={secondaryImage.url}
            alt={secondaryImage.alt || product.name}
            width={0}
            height={0}
            sizes="100vw"
            className={`product-img product-img--secondary ${isHovered ? 'product-img--is-visible' : 'product-img--is-hidden'}`}
          />
        )}

        <h3 className="product-title">{product.name}</h3>

        {product.discount && product.discount > 0 ? (
          <div className="price-wrapper">
            <span className="product--old-price">
              {formatPrice(product.price)}
            </span>
            <span className="product-price product--new-price">
              {formatPrice(product.price - product.discount)}
            </span>
          </div>
        ) : (
          <span className="product-price">{formatPrice(product.price)}</span>
        )}
      </Link>
      <AddToCartButton productId={product.id} />
    </div>
  );
}
