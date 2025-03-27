// src/components/shop/CategorySidebar.tsx
"use client";

import Link from "next/link";
import { Category } from "@/types";
import "./CategorySidebar.scss";

interface CategorySidebarProps {
  categories: Category[];
  activeCategory: string | null;
}

export default function CategorySidebar({
  categories,
  activeCategory,
}: CategorySidebarProps) {
  // Function to flatten the nested category structure
  const flattenCategories = (categories: Category[]): Category[] => {
    let result: Category[] = [];

    categories.forEach((category) => {
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
    <div className="sidebar">
      <Link
        href="/catalog"
        className={`sidebar-item ${
          !activeCategory ? "sidebar-item--active" : ""
        }`}
      >
        Все товары
      </Link>

      {allCategories.map((category) => (
        <Link
          key={category.id}
          href={`/catalog?category=${category.slug}`}
          className={`sidebar-item ${
            category.id === activeCategory ? "sidebar-item--active" : ""
          }`}
        >
          {category.name}
        </Link>
      ))}
    </div>
  );
}
