// src/app/cart/CartContents.tsx
"use client"

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { Product, ProductSet } from '@/types';
import { formatPrice } from '@/lib/utils/format';

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
      <div className="text-center py-16 bg-gray-50 rounded-lg">
        <svg 
          className="w-16 h-16 mx-auto text-gray-400 mb-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
        <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
        <p className="text-gray-600 mb-8">Looks like you haven't added any items to your cart yet.</p>
        <Link 
          href="/catalog" 
          className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Cart items */}
      <div className="lg:w-2/3">
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cartItems.map(item => {
                const details = getItemDetails(item.id);
                if (!details) return null;
                
                const { type, item: cartItem } = details;
                
                // Calculate the price based on item type
                let price = 0;
                if (type === 'product') {
                  price = (cartItem as Product).discount 
                    ? (cartItem as Product).price - (cartItem as Product).discount
                    : (cartItem as Product).price;
                } else if (type === 'set') {
                  price = calculateSetPrice(cartItem as ProductSet);
                }
                
                const totalPrice = price * item.quantity;
                const image = cartItem.images && cartItem.images.length > 0 
                  ? cartItem.images[0].url
                  : '/images/placeholder.jpg';
                
                return (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-16 w-16 flex-shrink-0 mr-4">
                          <img 
                            src={image} 
                            alt={cartItem.name} 
                            className="h-16 w-16 rounded-md object-cover"
                          />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {cartItem.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {type === 'set' ? 'Collection' : 'Product'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatPrice(price)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <button
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="p-1 border border-gray-300 rounded-l-md"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.id, Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-12 p-1 text-center border-t border-b border-gray-300"
                        />
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 border border-gray-300 rounded-r-md"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatPrice(totalPrice)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div className="flex justify-between">
          <Link 
            href="/catalog" 
            className="text-blue-600 hover:text-blue-800"
          >
            ← Continue Shopping
          </Link>
          <button 
            onClick={clearCart}
            className="text-red-600 hover:text-red-800"
          >
            Clear Cart
          </button>
        </div>
      </div>
      
      {/* Order summary */}
      <div className="lg:w-1/3">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-6">Order Summary</h2>
          
          <div className="border-t border-gray-200 pt-4 mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Tax</span>
              <span>Calculated at checkout</span>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4 mb-6">
            <div className="flex justify-between text-lg font-medium">
              <span>Total</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
          </div>
          
          <button
            onClick={handleCheckout}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-md font-medium hover:bg-blue-700 transition-colors"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}