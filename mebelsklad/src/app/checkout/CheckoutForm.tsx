"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCart } from '@/context/CartContext';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils/format';
import "./style.scss";
import Link from 'next/link';

// Form validation schema
const checkoutSchema = z.object({
  name: z.string().min(2, "Пожалуйста, введите Ваше имя"),
  phone: z.string().min(9, "Пожалуйста, введите корректный номер телефона"),
  address: z.string().optional(),
  notes: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

interface CheckoutFormProps {
  products: Product[];
}

export default function CheckoutForm({ products }: CheckoutFormProps) {
  const router = useRouter();
  const { cartItems, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subtotal, setSubtotal] = useState(0);

  // React Hook Form
  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: '',
      phone: '',
      address: '',
      notes: '',
    }
  });

  // Calculate subtotal whenever cart items change
  useEffect(() => {
    const total = cartItems.reduce((sum, item) => {
      // Find the product or set
      const product = products.find(p => p.id === item.id);

      if (product) {
        const price = product.discount
          ? product.price - product.discount
          : product.price;
        return sum + (price * item.quantity);
      }

      return sum;
    }, 0);

    setSubtotal(total);
  }, [cartItems, products]);

  // Find full details of a cart item
  const getItemDetails = (id: string) => {
    const product = products.find(p => p.id === id);
    if (product) return { item: product };

    return null;
  };

  // Handle form submission
  const onSubmit = async (data: CheckoutFormValues) => {
    if (cartItems.length === 0) {
      alert('Ваша корзина пуста. Пожалуйста, добавьте товары перед оформлением заказа.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare order data
      const orderItems = cartItems.map(item => {
        const details = getItemDetails(item.id);
        if (!details) return null;

        const { item: cartItem } = details;
        const price = (cartItem as Product).discount
          ? (cartItem as Product).price - ((cartItem as Product).discount ?? 0)
          : (cartItem as Product).price;

        return {
          id: item.id,
          name: cartItem.name,
          quantity: item.quantity,
          price: price,
          configuration: item.configuration || null,
        };
      }).filter(Boolean);

      // Construct the order
      const order = {
        customer: {
          name: data.name,
          phone: data.phone,
          address: data.address,
        },
        items: orderItems,
        subtotal,
        notes: data.notes,
        createdAt: new Date().toISOString(),
      };

      // Submit the order
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order),
      });

      if (!response.ok) {
        throw new Error('Failed to process your order');
      }

      // On success, clear the cart and redirect to thank you page
      clearCart();
      router.push('/checkout/success');

    } catch (error) {
      console.error('Error submitting order:', error);
      alert('There was a problem processing your order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="checkout-page">
      {/* Customer information form */}
      <div className="checkout-page_userinfo">
        <h2 className="checkout-page_userinfo-header">Заполните информацию о себе</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="checkout-page_userinfo-form">
          <input
            type="text"
            {...register('name')}
            placeholder="Ваше имя"
          />
          {errors.name && (
            <p className="error-text">{errors.name.message}</p>
          )}

          <input
            type="tel"
            {...register('phone')}
            placeholder="+998 __ ___ __ __"
          />
          {errors.phone && (
            <p className="error-text">{errors.phone.message}</p>
          )}

          <textarea
            {...register('address')}
            rows={2}
            placeholder="Ваш адрес доставки"
          ></textarea>

          <textarea
            {...register('notes')}
            rows={2}
            placeholder="Дополнительные примечания к заказу"
          ></textarea>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn--primary"
          >
            {isSubmitting ? 'Processing...' : `Оформить заказ`}
          </button>
        </form>
      </div>

      {/* Order summary */}
      <div className="checkout-page_order-summary">
        <h2 className="checkout-page_order-summary-header">Ваш заказ</h2>

        {cartItems.length === 0 ? (
          <>
            <p>Ваша корзина пуста</p>
            <Link
              href="/catalog"
              className="btn btn--primary"
            >
              Перейти в каталог
            </Link>
          </>
        ) : (
          <div className="checkout-page_order-summary-list">
            {cartItems.map(item => {
              const details = getItemDetails(item.id);
              if (!details) return null;

              const { item: cartItem } = details;
              let itemPrice = 0;

              itemPrice = (cartItem as Product).discount
                ? (cartItem as Product).price - ((cartItem as Product).discount ?? 0)
                : (cartItem as Product).price;


              const totalPrice = itemPrice * item.quantity;

              return (
                <div key={item.id} className="checkout-page_order-summary-item">
                  <div>
                    <p className="checkout-page_order-summary-item-title">{cartItem.name}</p>
                    <p className="checkout-page_order-summary-item-qty">
                      × {item.quantity}
                    </p>
                  </div>
                  <div className="checkout-page_order-summary-item-price">
                    {formatPrice(totalPrice)}
                  </div>
                </div>
              );
            })}

            <div className="checkout-page_order-summary-total">
              <span>Итого</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}