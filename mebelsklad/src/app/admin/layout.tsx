// src/app/admin/layout.tsx
import { ReactNode } from 'react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white">
        <div className="p-4">
          <h1 className="text-xl font-bold">Admin Panel</h1>
        </div>
        <nav className="mt-6">
          <ul>
            <li>
              <Link
                href="/admin/dashboard"
                className="block py-2.5 px-4 hover:bg-gray-700"
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                href="/admin/products"
                className="block py-2.5 px-4 hover:bg-gray-700"
              >
                Products
              </Link>
            </li>
            <li>
              <Link
                href="/admin/sets"
                className="block py-2.5 px-4 hover:bg-gray-700"
              >
                Product Sets
              </Link>
            </li>
            <li>
              <Link
                href="/admin/categories"
                className="block py-2.5 px-4 hover:bg-gray-700"
              >
                Categories
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 bg-gray-100">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <Link href="/" className="text-blue-600 hover:underline">
              View Shop
            </Link>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}