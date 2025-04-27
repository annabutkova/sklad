// src/app/cart/CartContents.tsx
"use client"

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { Product, ProductSet } from '@/types';
import { formatPrice } from '@/lib/utils/format';
import "./style.scss";

interface CartContentsProps {
  products: Product[];
  sets: ProductSet[];
}

export default function CartContents({ products, sets }: CartContentsProps) {
  const router = useRouter();
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const [subtotal, setSubtotal] = useState(0);

  // Calculate subtotal whenever cart items change
  useEffect(() => {
    const total = cartItems.reduce((sum, item) => {
      // Find the product or set
      const product = products.find(p => p.id === item.id);
      const set = sets.find(s => s.id === item.id);

      if (product) {
        const price = product.discount
          ? product.price - product.discount
          : product.price;
        return sum + (price * item.quantity);
      }

      if (set) {
        // For sets, calculate based on products they contain
        const setPrice = set.items.reduce((setSum, setItem) => {
          const setProduct = products.find(p => p.id === setItem.productId);
          if (!setProduct) return setSum;

          const productPrice = setProduct.discount
            ? setProduct.price - setProduct.discount
            : setProduct.price;

          return setSum + (productPrice * setItem.defaultQuantity);
        }, 0);

        return sum + (setPrice * item.quantity);
      }

      return sum;
    }, 0);

    setSubtotal(total);
  }, [cartItems, products, sets]);

  // Find full details of a cart item
  const getItemDetails = (id: string) => {
    const product = products.find(p => p.id === id);
    if (product) return { type: 'product', item: product };

    const set = sets.find(s => s.id === id);
    if (set) return { type: 'set', item: set };

    return null;
  };

  // Calculate price for a specific set
  const calculateSetPrice = (set: ProductSet) => {
    return set.items.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return sum;

      const productPrice = product.discount
        ? product.price - product.discount
        : product.price;

      return sum + (productPrice * item.defaultQuantity);
    }, 0);
  };

  // Handle checkout
  const handleCheckout = () => {
    router.push('/checkout');
  };

  // Empty cart view
  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <h2 className="">Ваша корзина пуста</h2>
        <p>
          Добавьте товары в корзину, чтобы увидеть их здесь
        </p>
        <Link
          href="/catalog"
          className="btn btn--primary"
        >
          Перейти в каталог
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      {/* Cart items */}
      <table className="cart-page_table">
        <thead className="cart-page_table-head">
          <tr className="cart-page_table-item">
            <th scope="col" className="cart-page_table-header">
            </th>
            <th scope="col" className="cart-page_table-header">
              Цена
            </th>
            <th scope="col" className="cart-page_table-header cart-page_table-data--input">
              Количество
            </th>
            <th scope="col" className="cart-page_table-header">
              Сумма
            </th>
            <th scope="col" className="cart-page_table-header cart-page_table-data--remove">
              Удалить
            </th>
          </tr>
        </thead>
        <tbody className="cart-page_table-body">
          {cartItems.map(item => {
            const details = getItemDetails(item.id);
            if (!details) return null;

            const { type, item: cartItem } = details;

            // Calculate the price based on item type
            let price = 0;
            if (type === 'product') {
              price = (cartItem as Product).discount
                ? (cartItem as Product).price - ((cartItem as Product).discount ?? 0)
                : (cartItem as Product).price;
            } else if (type === 'set') {
              price = calculateSetPrice(cartItem as ProductSet);
            }

            const totalPrice = price * item.quantity;
            const image = cartItem.images && cartItem.images.length > 0
              ? cartItem.images[0].url
              : '/images/placeholder.jpg';

            return (
              <tr key={item.id} className="cart-page_table-item ">
                <td className="cart-page_table-data">
                  <div className="cart-page_table-data-links">
                    <Link
                      href={`/product/${cartItem.slug}`}>
                      <img
                        src={image}
                        alt={cartItem.name}
                        className="cart-page_table-data-image"
                      />
                    </Link>
                    <Link
                      href={`/product/${cartItem.slug}`} className="cart-page_table-data-title">
                      {cartItem.name}
                    </Link>
                  </div>
                </td>
                <td className="cart-page_table-data">
                  {formatPrice(price)}
                </td>
                <td className="cart-page_table-data cart-page_table-data--input">
                  <button
                    onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                    className="button-input button-input--left"
                  >
                    —
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.id, Math.max(1, parseInt(e.target.value) || 1))}
                    className="number-input"
                  />
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="button-input button-input--right "
                  >
                    +
                  </button>
                </td>
                <td className="cart-page_table-data">
                  {formatPrice(totalPrice)}
                </td>
                <td className="cart-page_table-data cart-page_table-data--remove">
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="cart-page_table-data_remove-btn"
                  >
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 8H7M7 8H23M7 8L7 22C7 22.5304 7.21071 23.0391 7.58579 23.4142C7.96086 23.7893 8.46957 24 9 24H19C19.5304 24 20.0391 23.7893 20.4142 23.4142C20.7893 23.0391 21 22.5304 21 22V8M10 8V6C10 5.46957 10.2107 4.96086 10.5858 4.58579C10.9609 4.21071 11.4696 4 12 4H16C16.5304 4 17.0391 4.21071 17.4142 4.58579C17.7893 4.96086 18 5.46957 18 6V8M12 13V19M16 13V19" stroke="#4D4D4D" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="cart-page_total">
        <span>Итого</span>
        <span className="cart-page_total-sum">{formatPrice(subtotal)}</span>
      </div>

      <div className="cart-page_buttons">
        <button
          onClick={clearCart}
          className="btn btn--secondary"
        >
          Очистить корзину
        </button>
        <button
          onClick={handleCheckout}
          className="btn btn--primary"
        >
          Оформить заказ
        </button>
      </div>

    </div >
  );
}