// src/components/shop/SortSelector.tsx
"use client"

import { useRouter } from 'next/navigation';

interface SortSelectorProps {
  currentSort: string;
}

export default function SortSelector({ currentSort }: SortSelectorProps) {
  const router = useRouter();

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const url = new URL(window.location.href);
    url.searchParams.set('sort', value);
    router.push(url.toString());
  };

  return (
    <div className="flex items-center">
      <span className="mr-2">Sort by:</span>
      <select 
        className="border rounded-md p-1"
        defaultValue={currentSort}
        onChange={handleSortChange}
      >
        <option value="name-asc">Name (A-Z)</option>
        <option value="name-desc">Name (Z-A)</option>
        <option value="price-asc">Price (Low to High)</option>
        <option value="price-desc">Price (High to Low)</option>
      </select>
    </div>
  );
}