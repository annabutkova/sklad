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
  // Make sure we're only dealing with items of type 'set'
  if (set.type !== "set") {
    console.warn(`SetCard received an item that's not a set: ${set.id}`);
  }

  const mainImage = set.images.find((img) => img.isMain) || set.images[0];
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
    <div className="product-card">
      {/* View set button */}
      <Link href={`/set/${set.slug}`} className="product-link">
        <Image
          src={mainImage.url}
          alt={mainImage.alt || set.name}
          width={0}
          height={0}
          sizes="100vw"
          className={"product-img"}
          style={{ width: "100%", height: "auto" }}
        />

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
