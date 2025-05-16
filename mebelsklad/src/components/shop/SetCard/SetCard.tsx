"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ProductSet, Product } from "@/types";
import { formatPrice } from "@/lib/utils/format";
import "./SetCard.scss";

interface SetCardProps {
  set: ProductSet;
  allProducts?: Product[]; // We need this to calculate the price
}

export default function SetCard({ set, allProducts = [] }: SetCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const mainImage = set.images.find((img) => img.isMain) || set.images[0];

  const secondaryImage = set.images && set.images.length > 1
    ? set.images.find(img => !img.isMain) || set.images[1]
    : null;

  // URL изображения по умолчанию, если нет изображений
  //const defaultImageUrl = '/images/placeholder.jpg';

  const [totalPrice, setTotalPrice] = useState(0);

  // Calculate the total price based on the products and their quantities
  useEffect(() => {
    if (allProducts.length === 0) return;

    const price = set.items.reduce((sum, item) => {
      const product = allProducts.find((p) => p.id === item.productId);
      if (!product) return sum;

      const productPrice = product.discount
        ? product.price - product.discount
        : product.price;

      return sum + productPrice * item.defaultQuantity;
    }, 0);

    setTotalPrice(price);
  }, [set.items, allProducts]);

  return (
    <div className="product-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* View set button */}
      <Link href={`/set/${set.slug}`} className="product-link">
        <Image
          src={mainImage.url}
          alt={mainImage.alt || set.name}
          width={0}
          height={0}
          sizes="100vw"
          className={`product-img ${isHovered && secondaryImage ? 'product-img--is-hidden' : 'product-img--is-visible'}`}
        />

        {secondaryImage && (
          <Image
            src={secondaryImage.url}
            alt={secondaryImage.alt || set.name}
            width={0}
            height={0}
            sizes="100vw"
            className={`product-img product-img--secondary ${isHovered ? 'product-img--is-visible' : 'product-img--is-hidden'}`}
          />
        )}

        {/* Set info */}
        <h3 className="product-title">{set.name}</h3>

        {/* Price */}
        <span className="product-price">{formatPrice(totalPrice)}</span>
      </Link>
      <Link href={`/set/${set.slug}`} className="product-btn">
        Собрать комплект
      </Link>
    </div>
  );
}
