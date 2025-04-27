// src/app/checkout/success/page.tsx
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Order Placed Successfully | Furniture Shop',
  description: 'Your order has been placed successfully',
};

export default function CheckoutSuccessPage() {
  return (
    <div className="main">
      <h1 className="page-header">Спасибо за Ваш заказ!</h1>

      <p>
        Скоро с Вами свяжется наш менеджер и уточит детали доставки
      </p>

      <div>
        <Link
          href="/"
          className="btn btn--secondary"
        >
          Вернуться на главную
        </Link>

        <Link
          href="/catalog"
          className="btn btn--primary"
        >
          Перейти в каталог
        </Link>
      </div>
    </div>
  );
}