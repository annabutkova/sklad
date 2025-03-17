"use client"

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ProductSet, Product } from '@/types';
import { formatPrice } from '@/lib/utils/format';

interface SetCardProps {
  set: ProductSet;
  allProducts?: Product[]; // We need this to calculate the price
}

export default function SetCard({ set, allProducts = [] }: SetCardProps) {
  // Make sure we're only dealing with items of type 'set'
  if (set.type !== 'set') {
    console.warn(`SetCard received an item that's not a set: ${set.id}`);
  }
  
  const mainImage = set.images.find(img => img.isMain) || set.images[0];
  const [totalPrice, setTotalPrice] = useState(0);
  
  // Calculate the total price based on the products and their quantities
  useEffect(() => {
    if (allProducts.length === 0) return;
    
    const price = set.items.reduce((sum, item) => {
      const product = allProducts.find(p => p.id === item.productId);
      if (!product) return sum;
      
      const productPrice = product.discount 
        ? product.price - product.discount 
        : product.price;
        
      return sum + (productPrice * item.defaultQuantity);
    }, 0);
    
    setTotalPrice(price);
  }, [set.items, allProducts]);
  
  return (
    <div className="group relative border rounded-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Set image */}
      <div className="aspect-square overflow-hidden">
        <Image
          src={mainImage.url}
          alt={mainImage.alt || set.name}
          width={300}
          height={300}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
        />
        
        {/* Badge showing this is a set */}
        <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">
          Комплект
        </div>
      </div>
      
      {/* Set info */}
      <div className="p-4">
        <h3 className="text-lg font-semibold truncate">
          <Link href={`/set/${set.slug}`} className="hover:text-blue-600">
            {set.name}
          </Link>
        </h3>
        
        <div className="mt-1 text-sm text-gray-500">
          {set.items.length} {set.items.length === 1 ? 'предмет' : 'предметов'}
        </div>
        
        {/* Price */}
        <div className="mt-2">
          <span className="font-bold text-lg">
            {formatPrice(totalPrice)}
          </span>
        </div>
        
        {/* View set button */}
        <Link 
          href={`/set/${set.slug}`}
          className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition-colors block text-center"
        >
          Настроить комплект
        </Link>
      </div>
    </div>
  );
}