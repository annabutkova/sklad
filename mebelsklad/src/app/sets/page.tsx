// src/app/sets/page.tsx
import { Metadata } from "next";
import Link from "next/link";
import SetCard from "@/components/shop/SetCard/SetCard";
import { setsApi } from "@/lib/api/mongoApi";

export const metadata: Metadata = {
  title: "Furniture Collections | Furniture Shop",
  description: "Browse our curated furniture collections and sets",
};

export default async function SetsPage() {
  const sets = await setsApi.getAllSets();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Furniture Collections</h1>

      {/* Breadcrumbs */}
      <nav className="mb-8">
        <ol className="flex text-sm">
          <li className="flex items-center">
            <Link href="/" className="text-gray-500 hover:text-gray-900">
              Home
            </Link>
            <svg
              className="mx-2 h-5 w-5 text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </li>
          <li className="text-gray-900 font-medium">Collections</li>
        </ol>
      </nav>

      {sets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sets.map((set) => (
            <SetCard key={set.id} set={set} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">No collections found</h2>
          <p className="text-gray-600">Check back later for new collections.</p>
        </div>
      )}
    </div>
  );
}
