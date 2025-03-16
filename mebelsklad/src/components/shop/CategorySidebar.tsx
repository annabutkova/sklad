// src/components/shop/CategorySidebar.tsx
"use client"

import { useState } from 'react';
import Link from 'next/link';
import { Category } from '@/types';

interface CategorySidebarProps {
  categories: Category[];
  activeCategory: string | null;
}

// Recursive component for nested categories
const CategoryItem = ({ 
  category, 
  activeCategory, 
  depth = 0 
}: { 
  category: Category; 
  activeCategory: string | null;
  depth?: number;
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = category.children && category.children.length > 0;
  const isActive = category.id === activeCategory;
  
  return (
    <div className="mb-1">
      <div className="flex items-center">
        {hasChildren && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="mr-1 h-5 w-5 text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-90' : ''}`}
            >
              <path
                fillRule="evenodd"
                d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
        
        <Link
          href={`/catalog?category=${category.slug}`}
          className={`${
            isActive
              ? 'font-medium text-blue-600'
              : 'text-gray-700 hover:text-blue-600'
          } ${hasChildren ? '' : 'ml-6'}`}
          style={{ marginLeft: depth > 0 && !hasChildren ? `${depth * 1}rem` : 0 }}
        >
          {category.name}
        </Link>
      </div>
      
      {hasChildren && isOpen && (
        <div className="mt-1 ml-4">
          {category.children.map((child) => (
            <CategoryItem
              key={child.id}
              category={child}
              activeCategory={activeCategory}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function CategorySidebar({ categories, activeCategory }: CategorySidebarProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-4">Categories</h2>
      
      <div>
        <Link
          href="/catalog"
          className={`block mb-2 ${
            !activeCategory ? 'font-medium text-blue-600' : 'text-gray-700 hover:text-blue-600'
          }`}
        >
          All Products
        </Link>
        
        {categories.map((category) => (
          <CategoryItem
            key={category.id}
            category={category}
            activeCategory={activeCategory}
          />
        ))}
      </div>
    </div>
  );
}