// src/app/set/[slug]/SetDetail.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ProductSet, Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils/format";
import "./style.scss";

export interface SetDetailProps {
  set: ProductSet;
  setProducts: Array<{
    product: Product;
    defaultQuantity: number;
    minQuantity: number;
    maxQuantity: number;
    required: boolean;
  }>;
}

export default function SetDetail({ set, setProducts }: SetDetailProps) {
  const { addProductsFromSet } = useCart();
  const [selectedQuantities, setSelectedQuantities] = useState<
    Record<string, number>
  >({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [defaultPrice, setDefaultPrice] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);

  // Initialize selected quantities with default values
  useEffect(() => {
    const initialQuantities: Record<string, number> = {};
    setProducts.forEach((item) => {
      initialQuantities[item.product.id] = item.defaultQuantity;
    });
    setSelectedQuantities(initialQuantities);
  }, [setProducts]);

  // Calculate default price of the set (with default quantities)
  useEffect(() => {
    const defaultTotal = setProducts.reduce((sum, item) => {
      const productPrice = item.product.discount
        ? item.product.price - item.product.discount
        : item.product.price;

      return sum + productPrice * item.defaultQuantity;
    }, 0);

    setDefaultPrice(defaultTotal);
  }, [setProducts]);

  // Calculate total price based on selected quantities
  useEffect(() => {
    const total = setProducts.reduce((sum, item) => {
      const quantity = selectedQuantities[item.product.id] || 0;
      const productPrice = item.product.discount
        ? item.product.price - item.product.discount
        : item.product.price;

      return sum + productPrice * quantity;
    }, 0);

    setTotalPrice(total);
  }, [selectedQuantities, setProducts]);

  // Handle quantity decrease (minus button)
  const decreaseQuantity = (productId: string) => {
    setSelectedQuantities((prev) => {
      const currentQuantity = prev[productId] || 0;
      if (currentQuantity <= 0) return prev; // Already at minimum

      return {
        ...prev,
        [productId]: currentQuantity - 1
      };
    });
  };

  // Handle quantity increase (plus button)
  const increaseQuantity = (productId: string, maxQuantity: number) => {
    setSelectedQuantities((prev) => {
      const currentQuantity = prev[productId] || 0;
      if (currentQuantity >= maxQuantity) return prev; // Already at maximum

      return {
        ...prev,
        [productId]: currentQuantity + 1
      };
    });
  };

  // Handle direct input change
  const handleInputChange = (productId: string, inputValue: string, maxQuantity: number) => {
    // Parse the input value as a number, default to 0 if invalid
    const newQuantity = parseInt(inputValue) || 0;

    // Ensure the value is between 0 and maxQuantity
    const validQuantity = Math.min(Math.max(newQuantity, 0), maxQuantity);

    setSelectedQuantities((prev) => ({
      ...prev,
      [productId]: validQuantity
    }));
  };

  // Handle adding the customized set to cart
  const handleAddToCart = () => {
    // Create configuration based on selected quantities
    const productsToAdd = Object.entries(selectedQuantities)
      .filter(([_, quantity]) => quantity > 0)
      .map(([productId, quantity]) => ({
        productId,
        quantity,
      }));

    // Only proceed if there are items in the configuration
    if (productsToAdd.length > 0) {
      // Now we use the addProductsFromSet method to add individual products
      // but keep track of which set they came from
      addProductsFromSet(set.id, productsToAdd);

      // Show success feedback
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } else {
      alert("Please select at least one item from the set.");
    }
  };

  // Get main image
  const mainImage = set.images.find((img) => img.isMain) || set.images[0];

  return (
    <div className="main">
      {/* Breadcrumbs */}
      <nav className="mb-8">
        <ol className="flex text-sm">
          <li className="flex items-center">
            <Link href="/" className="text-gray-500 hover:text-gray-900">
              Home
            </Link>
            <svg
              className="mx-2 h-5 w-5 text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </li>
          <li className="flex items-center">
            <Link href="/catalog" className="text-gray-500 hover:text-gray-900">
              Sets
            </Link>
            <svg
              className="mx-2 h-5 w-5 text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </li>
          <li className="text-gray-900 font-medium">{set.name}</li>
        </ol>
      </nav>

      <div className="product-page">
        {/* Set image */}
        <div className="product-page_images-wrapper">
          <Image
            src={mainImage.url}
            alt={mainImage.alt || set.name}
            width={0}
            height={0}
            sizes="100vw"
            style={{ width: "100%", height: "auto" }}
            className="product-page_image"
            priority
          />
        </div>

        {/* Thumbnail gallery */}
        {set.images.length > 1 && (
          <div className="product-page_thumbnails">
            {set.images.map((image, index) => (
              <div
                key={index}
                className={`
                  rounded-md overflow-hidden cursor-pointer
                  ${image.isMain
                    ? "ring-2 ring-blue-500"
                    : "border border-gray-200"
                  }
                `}
              >
                <Image
                  src={image.url}
                  alt={image.alt || `${set.name} image ${index + 1}`}
                  width={100}
                  height={100}
                  className="w-full h-20 object-cover"
                />
              </div>
            ))}
          </div>
        )}


        {/* Set info */}
        <div className="product-page_info">
          <h1 className="product-page_title">{set.name}</h1>

          {/* Product selection */}
          <div className="product-page_set-wrapper">
            <h2 className="product-page_set-header">Состав комплекта</h2>

            <div className="product-page_set-table">
              {setProducts.map(
                ({
                  product,
                  defaultQuantity,
                  minQuantity,
                  maxQuantity,
                  required,
                }) => {
                  // Get the current quantity from state, or use default if not yet set
                  const currentQuantity = selectedQuantities[product.id] !== undefined
                    ? selectedQuantities[product.id]
                    : defaultQuantity;

                  return (
                    <div
                      key={product.id}
                      className="product-page_set-item"
                    >
                      {/* Product info */}
                      <div className="product-page_set-item--left">
                        <Link
                          href={`/product/${product.slug}`}>
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={product.images[0].url}
                              alt={product.name}
                              className="product-page_set-item-img"
                            />
                          ) : (
                            <div className="h-16 w-16 rounded-md bg-gray-200"></div>
                          )}
                        </Link>
                        <div className="product-page_set-item-info">
                          <Link
                            href={`/product/${product.slug}`}
                            className="product-page_set-item-title"
                          >
                            {product.name}
                          </Link>
                          <span className="product-page_set-item-price">
                            {formatPrice(
                              product.discount
                                ? product.price - product.discount
                                : product.price
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Quantity selector */}
                      <div className="flex items-center">
                        <button
                          onClick={() => decreaseQuantity(product.id)}
                          className="w-10 h-10 leading-10 text-gray-600 transition hover:opacity-75 border border-gray-300 rounded-l-md"
                          disabled={currentQuantity <= 0}
                        >
                          -
                        </button>

                        <input
                          type="number"
                          value={currentQuantity}
                          onChange={(e) => handleInputChange(
                            product.id,
                            e.target.value,
                            maxQuantity
                          )}
                          className="h-10 w-16 border-t border-b border-gray-300 text-center [-moz-appearance:_textfield] sm:text-sm [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none"
                          min={0}
                          max={maxQuantity}
                        />

                        <button
                          onClick={() => increaseQuantity(product.id, maxQuantity)}
                          className="w-10 h-10 leading-10 text-gray-600 transition hover:opacity-75 border border-gray-300 rounded-r-md"
                          disabled={currentQuantity >= maxQuantity}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>

          {/* Custom price based on selection */}
          {totalPrice > 0 && (
            <div className="product-page_price-wrapper">
              <span className="product-page_price-header">Цена за комплект</span>
              <span className="product-page_price">
                {formatPrice(totalPrice)}
              </span>
            </div>
          )}

          {/* Add to cart */}
          <div>
            <button
              onClick={handleAddToCart}
              disabled={addedToCart}
              className={`add-button ${addedToCart
                ? 'add-button--added' : ''
                }`}
            >
              {addedToCart ? "Комплект в корзине" : "Добавить комплект в корзину"}
            </button>
          </div>
        </div>
      </div>

      <div id="#harakteristiki" className="product-page">
        {/* Description */}
        {set.description && (
          <div className="product-page_description">
            <h2 className="product-page_subheader">Характеристики товара</h2>
            <p className="text-gray-700">{set.description}</p>
          </div>
        )}

        {/* Specifications */}
        {set.specifications && Object.keys(set.specifications).length > 0 && (
          <div className="product-page_table">
            {Object.entries(set.specifications).map(([key, value]) => (
              <div key={key} className="py-3 flex justify-between border-b border-gray-200">
                <span className="text-gray-500">{key}</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
