"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils/format";
import "./ProductCard.scss";
import AddToCartButton from "../AddToCartButton/AddToCartButton";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {

  const mainImage =
    product.images.find((img) => img.isMain) || product.images[0];

  return (
    <div className="product-card">
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
          className={"product-img"}
          style={{ width: "100%", height: "auto" }}
        />
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
