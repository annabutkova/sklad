// src/components/shop/SortSelector.tsx
"use client";

import { useRouter } from "next/navigation";
import "./SortSelector.scss";

interface SortSelectorProps {
  currentSort: string;
}

export default function SortSelector({ currentSort }: SortSelectorProps) {
  const router = useRouter();

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const url = new URL(window.location.href);
    url.searchParams.set("sort", value);
    router.push(url.toString());
  };

  return (
    <div className="sorting-wrapper">
      <span className="sorting-header">Отсортировать</span>
      <select
        className="sorting-select"
        defaultValue={currentSort}
        onChange={handleSortChange}
      >
        <option value="name-asc" className="sorting-option">
          по имени (А-Я)
        </option>
        <option value="name-desc" className="sorting-option">
          по имени (Я-А)
        </option>
        <option value="price-asc" className="sorting-option">
          сначала дешевле
        </option>
        <option value="price-desc" className="sorting-option">
          сначала дороже
        </option>
      </select>
    </div>
  );
}
