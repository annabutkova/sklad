// src/components/shop/AddToCartButton.tsx
"use client"

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import './AddToCartButton.scss';

interface AddToCartButtonProps {
  productId: string;
}

export default function AddToCartButton({ productId }: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    setIsAdding(true);
    addToCart(productId, 1); // Add 1 quantity by default for product card view
    
    // Reset after animation
    setTimeout(() => {
      setIsAdding(false);
    }, 1000);
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={isAdding}
      className={`add-button ${
        isAdding ? 'add-button--added' : ''
      }`}
    >
      {isAdding ? 'Добавлено!' : 'В корзину'}
    </button>
  );
}