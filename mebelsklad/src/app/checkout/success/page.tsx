// src/app/checkout/success/page.tsx
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Order Placed Successfully | Furniture Shop',
  description: 'Your order has been placed successfully',
};

export default function CheckoutSuccessPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Order Placed Successfully!</h1>
        
        <p className="text-gray-600 mb-6">
          Thank you for your order. Our manager will contact you shortly to confirm 
          your order details and arrange delivery.
        </p>
        
        <div className="flex flex-col space-y-3">
          <Link 
            href="/"
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
          >
            Return to Home
          </Link>
          
          <Link 
            href="/catalog"
            className="text-blue-600 hover:underline"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}