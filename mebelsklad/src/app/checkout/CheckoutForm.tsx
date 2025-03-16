"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCart } from '@/context/CartContext';
import { Product, ProductSet } from '@/types';
import { formatPrice } from '@/lib/utils/format';

// Form validation schema
const checkoutSchema = z.object({
  name: z.string().min(2, "Please enter your full name"),
  phone: z.string().min(9, "Please enter a valid phone number"),
  address: z.string().min(5, "Please enter your delivery address"),
  notes: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

interface CheckoutFormProps {
  products: Product[];
  sets: ProductSet[];
}

export default function CheckoutForm({ products, sets }: CheckoutFormProps) {
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
      const set = sets.find(s => s.id === item.id);
      
      if (product) {
        const price = product.discount 
          ? product.price - product.discount
          : product.price;
        return sum + (price * item.quantity);
      }
      
      if (set) {
        // For sets, calculate based on configured items
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
  
  // Handle form submission
  const onSubmit = async (data: CheckoutFormValues) => {
    if (cartItems.length === 0) {
      alert('Your cart is empty. Please add items before checking out.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare order data
      const orderItems = cartItems.map(item => {
        const details = getItemDetails(item.id);
        if (!details) return null;
        
        const { type, item: cartItem } = details;
        const price = type === 'product' 
          ? (cartItem as Product).discount 
            ? (cartItem as Product).price - (cartItem as Product).discount
            : (cartItem as Product).price
          : 0; // For sets, we'll calculate the price server-side
          
        return {
          id: item.id,
          name: cartItem.name,
          type,
          quantity: item.quantity,
          price: type === 'product' ? price : null,
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
    <>
      {/* Customer information form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-6">Customer Information</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name*
            </label>
            <input
              type="text"
              {...register('name')}
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your full name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number*
            </label>
            <input
              type="tel"
              {...register('phone')}
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              placeholder="+998 __ ___ __ __"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Delivery Address*
            </label>
            <textarea
              {...register('address')}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your full address"
            ></textarea>
            {errors.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order Notes (Optional)
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              placeholder="Any special instructions or notes about your order"
            ></textarea>
          </div>
          
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition-colors disabled:bg-blue-400"
            >
              {isSubmitting ? 'Processing...' : `Place Order - ${formatPrice(subtotal)}`}
            </button>
          </div>
        </form>
      </div>
      
      {/* Order summary */}
      <div>
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          
          {cartItems.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded">
              <p className="text-gray-500">Your cart is empty</p>
            </div>
          ) : (
            <div className="divide-y">
              {cartItems.map(item => {
                const details = getItemDetails(item.id);
                if (!details) return null;
                
                const { type, item: cartItem } = details;
                let itemPrice = 0;
                
                if (type === 'product') {
                  itemPrice = (cartItem as Product).discount 
                    ? (cartItem as Product).price - (cartItem as Product).discount
                    : (cartItem as Product).price;
                } else if (type === 'set') {
                  // For sets, calculate price based on included products
                  const set = cartItem as ProductSet;
                  itemPrice = set.items.reduce((sum, setItem) => {
                    const product = products.find(p => p.id === setItem.productId);
                    if (!product) return sum;
                    
                    const productPrice = product.discount 
                      ? product.price - product.discount
                      : product.price;
                      
                    return sum + (productPrice * setItem.defaultQuantity);
                  }, 0);
                }
                
                const totalPrice = itemPrice * item.quantity;
                
                return (
                  <div key={item.id} className="py-4 flex justify-between">
                    <div>
                      <p className="font-medium">{cartItem.name}</p>
                      <p className="text-sm text-gray-500">
                        {type === 'set' ? 'Collection' : 'Product'} × {item.quantity}
                      </p>
                    </div>
                    <div className="font-medium">
                      {formatPrice(totalPrice)}
                    </div>
                  </div>
                );
              })}
              
              <div className="py-4 flex justify-between font-bold">
                <span>Total</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">Delivery Information</h3>
          <p className="text-sm text-blue-600">
            Delivery is available within the city. Our manager will contact you to confirm 
            your order and arrange delivery details.
          </p>
        </div>
      </div>
    </>
  );
}