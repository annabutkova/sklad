// src/app/admin/dashboard/page.tsx
import Link from 'next/link';
import { jsonDataService } from '@/lib/api/jsonDataService';

export default async function AdminDashboard() {
  const products = await jsonDataService.getAllProducts();
  const sets = await jsonDataService.getAllProductSets();
  const categories = await jsonDataService.getAllCategories();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Products</h2>
          <p className="text-3xl font-bold">{products.length}</p>
          <Link
            href="/admin/products"
            className="mt-4 inline-block text-blue-600 hover:underline"
          >
            Manage Products →
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Product Sets</h2>
          <p className="text-3xl font-bold">{sets.length}</p>
          <Link
            href="/admin/sets"
            className="mt-4 inline-block text-blue-600 hover:underline"
          >
            Manage Sets →
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Categories</h2>
          <p className="text-3xl font-bold">{categories.length}</p>
          <Link
            href="/admin/categories"
            className="mt-4 inline-block text-blue-600 hover:underline"
          >
            Manage Categories →
          </Link>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="space-y-2">
          <Link 
            href="/admin/products/new" 
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add New Product
          </Link>
          <Link 
            href="/admin/sets/new" 
            className="ml-4 inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Create New Set
          </Link>
          <Link 
            href="/admin/categories/new" 
            className="ml-4 inline-block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            Add New Category
          </Link>
        </div>
      </div>
    </div>
  );
}