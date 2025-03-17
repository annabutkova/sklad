// src/components/shop/NestedCategorySidebar.tsx
"use client"

import Link from 'next/link';
import { useState } from 'react';
import { Category } from '@/types';

interface NestedCategorySidebarProps {
  categories: Category[];
  activeCategory: string | null;
}

// Helper to render a nested category with its children
const CategoryItem = ({ 
  category, 
  activeCategory,
  level = 0
}: { 
  category: Category; 
  activeCategory: string | null;
  level?: number;
}) => {
  const [isExpanded, setIsExpanded] = useState(
    // Auto-expand if this category or any of its children is active
    category.id === activeCategory || 
    category.children?.some(child => 
      child.id === activeCategory || 
      child.children?.some(grandchild => grandchild.id === activeCategory)
    )
  );
  
  const hasChildren = category.children && category.children.length > 0;
  
  return (
    <div className="category-item">
      <div className="flex items-center">
        {/* Indentation based on level */}
        {level > 0 && (
          <div style={{ width: `${level * 16}px` }} className="flex-shrink-0"></div>
        )}
        
        {/* Expand/collapse button for categories with children */}
        {hasChildren && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)} 
            className="mr-1 w-4 h-4 flex items-center justify-center"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              className={`w-3 h-3 transition-transform ${isExpanded ? 'transform rotate-90' : ''}`}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
        
        {/* Category link */}
        <Link
          href={`/catalog?category=${category.slug}`}
          className={`py-2 px-2 flex-grow rounded ${
            category.id === activeCategory 
              ? 'bg-blue-50 text-blue-600 font-medium' 
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          {category.name}
        </Link>
      </div>
      
      {/* Children categories */}
      {hasChildren && isExpanded && (
        <div className="ml-2">
          {category.children?.map((child) => (
            <CategoryItem 
              key={child.id} 
              category={child} 
              activeCategory={activeCategory}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function NestedCategorySidebar({ categories, activeCategory }: NestedCategorySidebarProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-4">Categories</h2>
      
      <div className="space-y-1">
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