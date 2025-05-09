// src/app/set/[slug]/SetDetail.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ProductSet, Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils/format";
import "./style.scss";
import ProductGallery from "@/components/shop/ProductGallery/ProductGallery";
import SpecificationRow from "@/components/shop/SpecificationsTable/SpecificationRow";
import ProductCard from "@/components/shop/ProductCard/ProductCard";
import SpecificationsTable from "@/components/shop/SpecificationsTable/SpecificationsTable";
import { jsonDataService } from "@/lib/api/jsonDataService";
import SetCard from "@/components/shop/SetCard/SetCard";

export interface SetDetailProps {
  set: ProductSet;
  setProducts: Array<{
    product: Product;
    defaultQuantity: number;
    minQuantity: number;
    maxQuantity: number;
    required: boolean;
  }>;
  relatedProducts: Product[];
  relatedSets: ProductSet[];
}

export default function SetDetail({ set, setProducts, relatedProducts, relatedSets }: SetDetailProps) {
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
        <ProductGallery images={set.images} />


        {/* Set info */}
        <div className="product-page_info">
          <h1 className="product-page_title">{set.name}</h1>

          <ul className="product-page_list">

            {(set.specifications?.style?.color?.karkas || set.specifications?.style?.color?.fasad) && (
              <li className="product-page_list-item">
                <span className="product-page_list-option">цвет</span>
                <span className="product-page_list-value">
                  {[
                    set.specifications.style.color.karkas && `${set.specifications.style.color.karkas}`,
                    set.specifications.style.color.fasad && `${set.specifications.style.color.fasad}`
                  ].filter(Boolean).join(', ')}
                </span>
              </li>
            )}

            {(set.specifications?.material?.karkas || set.specifications?.material?.fasad) && (
              <li className="product-page_list-item">
                <span className="product-page_list-option">материал</span>
                <span className="product-page_list-value">
                  {[
                    set.specifications.material.karkas && `${set.specifications.material.karkas}`,
                    set.specifications.material.fasad && `${set.specifications.material.fasad}`,
                    set.specifications.material.obivka && `${set.specifications.material.obivka}`
                  ].filter(Boolean).join(', ')}
                </span>
              </li>
            )}

            <a href="#harakteristiki" className="product-page_link">Все характеристики</a>

          </ul>

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
                          href={`/product/${product.slug}`} className="product-page_set-item-link">
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
        {set.specifications && (
          <SpecificationsTable specifications={set.specifications} />
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
              <SetCard key={relatedSet.id} set={relatedSet} allProducts={relatedProducts} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
