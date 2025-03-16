// src/components/shop/CategorySidebar.tsx
"use client"

import Link from 'next/link';
import { Category } from '@/types';

interface CategorySidebarProps {
  categories: Category[];
  activeCategory: string | null;
}

export default function CategorySidebar({ categories, activeCategory }: CategorySidebarProps) {
  // Function to flatten the nested category structure
  const flattenCategories = (categories: Category[]): Category[] => {
    let result: Category[] = [];
    
    categories.forEach(category => {
      // Add the current category
      result.push(category);
      
      // If it has children, add them too
      if (category.children && category.children.length > 0) {
        result = [...result, ...flattenCategories(category.children)];
      }
    });
    
    return result;
  };
  
  // Get a flat list of all categories
  const allCategories = flattenCategories(categories);
  
  // Sort them by name
  allCategories.sort((a, b) => a.name.localeCompare(b.name));
  
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-4">Categories</h2>
      
      <div className="space-y-2">
        <Link
          href="/catalog"
          className={`block py-2 px-3 rounded ${
            !activeCategory 
              ? 'bg-blue-50 text-blue-600 font-medium' 
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          All Products
        </Link>
        
        {allCategories.map((category) => (
          <Link
            key={category.id}
            href={`/catalog?category=${category.slug}`}
            className={`block py-2 px-3 rounded ${
              category.id === activeCategory 
                ? 'bg-blue-50 text-blue-600 font-medium' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            {category.name}
          </Link>
        ))}
      </div>
    </div>
  );
}