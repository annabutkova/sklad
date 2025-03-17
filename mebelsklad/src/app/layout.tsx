// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { CartProvider } from '@/context/CartContext';
import './globals.scss';
import Header from '@/components/layout/Header/Header';
import Footer from '@/components/layout/Footer/Footer';

export const metadata: Metadata = {
  title: 'Mebel Sklad | Готовая мебель из России',
  description: 'мебель из России по выгодным ценам в Узбекистане',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        <CartProvider>
            <Header />
            <>{children}</>
            <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
