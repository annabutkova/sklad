// src/context/CartContext.tsx
"use client"

import React, { createContext, useState, useContext, useEffect } from 'react';

// Define the structure of a cart item
export interface CartItem {
  id: string;
  quantity: number;
  type: 'product'; // All cart items are products, even if they came from sets
  setId?: string; // Optional reference to the set this product was part of
  configuration?: Array<{productId: string, quantity: number}>; // For configurable sets
}

// Define the cart context type
interface CartContextType {
  cartItems: CartItem[];
  addToCart: (productId: string, quantity?: number) => void;
  addProductsFromSet: (setId: string, products: Array<{productId: string, quantity: number}>) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
}

// Create the context with undefined initial value
const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider component that wraps your app and makes cart context available
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error parsing cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
    
    // Calculate total items
    const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    setTotalItems(itemCount);
  }, [cartItems]);

  // Add item to cart (for individual products)
  const addToCart = (productId: string, quantity = 1) => {
    setCartItems(prev => {
      const existingItemIndex = prev.findIndex(item => item.id === productId);
      
      if (existingItemIndex >= 0) {
        // Item already exists, update quantity
        const updatedItems = [...prev];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity
        };
        return updatedItems;
      } else {
        // Add new item
        return [...prev, { id: productId, quantity, type: 'product' }];
      }
    });
  };

  // Add products from a set to the cart
  const addProductsFromSet = (setId: string, products: Array<{productId: string, quantity: number}>) => {
    if (products.length === 0) {
      return;
    }
    
    setCartItems(prev => {
      const updatedItems = [...prev];
      
      // Add each product from the set
      products.forEach(({ productId, quantity }) => {
        if (quantity <= 0) return;
        
        const existingItemIndex = updatedItems.findIndex(item => item.id === productId);
        
        if (existingItemIndex >= 0) {
          // Item already exists, update quantity
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + quantity
          };
        } else {
          // Add new item with reference to the source set
          updatedItems.push({ 
            id: productId, 
            quantity, 
            type: 'product',
            setId 
          });
        }
      });
      
      return updatedItems;
    });
  };

  // Remove item from cart
  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  // Update item quantity
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems(prev => {
      return prev.map(item => 
        item.id === productId ? { ...item, quantity } : item
      );
    });
  };

  // Clear the entire cart
  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      addProductsFromSet,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
    }}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use the cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};