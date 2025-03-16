"use client"

import Image from 'next/image';
import Link from 'next/link';
import { ProductSet } from '@/types';
import { formatPrice } from '@/lib/utils/format';

interface SetCardProps {
  set: ProductSet;
}

export default function SetCard({ set }: SetCardProps) {
  const mainImage = set.images.find(img => img.isMain) || set.images[0];
  
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
        
        {/* Discount badge */}
        {set.discount && set.discount > 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            -{Math.round((set.discount / set.basePrice) * 100)}%
          </div>
        )}
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
        <div className="mt-2 flex items-baseline gap-2">
          {set.discount && set.discount > 0 ? (
            <>
              <span className="text-gray-500 line-through text-sm">
                {formatPrice(set.basePrice)}
              </span>
              <span className="font-bold text-lg">
                {formatPrice(set.basePrice - set.discount)}
              </span>
            </>
          ) : (
            <span className="font-bold text-lg">
              {formatPrice(set.basePrice)}
            </span>
          )}
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