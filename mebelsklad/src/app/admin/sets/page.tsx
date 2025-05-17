// src/app/admin/sets/page.tsx
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils/format";
import { Product, ProductSet } from "@/types";
import { categoriesApi, productsApi, setsApi } from "@/lib/api/serverApi";

// Helper function to calculate set price from items
const calculateSetPrice = (set: ProductSet, products: Product[]) => {
  return set.items.reduce((sum: number, item: { productId: string; defaultQuantity: number; }) => {
    const product = products.find((p: { id: string; }) => p.id === item.productId);
    if (!product) return sum;

    const productPrice = product.discount
      ? product.price - product.discount
      : product.price;

    return sum + (productPrice * item.defaultQuantity);
  }, 0);
};

export default async function AdminSetsPage() {
  const sets = await setsApi.getAllSets();
  const categories = await categoriesApi.getAllCategories();
  const products = await productsApi.getAllProducts();

  // Create a map of category IDs to names for easy lookup
  const categoryMap = categories.reduce((map, category) => {
    map[category.id] = category.name;
    return map;
  }, {} as Record<string, string>);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Product Sets</h1>
        <Link
          href="/admin/sets/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add New Set
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Set
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Category
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Price
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Items
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sets.map((set) => {
              // Calculate the total price of the set based on its items
              const totalPrice = calculateSetPrice(set, products);

              return (
                <tr key={set.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <Image
                          className="h-10 w-10 rounded object-cover"
                          src={set.images[0].url}
                          alt={set.name}
                          width={40}
                          height={40}
                        />
                        <div className="h-10 w-10 rounded bg-gray-200"></div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {set.name}
                        </div>
                        <div className="text-sm text-gray-500">{set.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {set.categoryIds.map((id) => categoryMap[id] || "Unknown").join(", ")}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatPrice(totalPrice)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {set.items.length} items
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <Link
                      href={`/admin/sets/${set.id}`}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/admin/sets/duplicate/${set.id}`}
                      className="text-green-600 hover:text-green-900 mr-4"
                    >
                      Duplicate
                    </Link>
                    <button className="text-red-600 hover:text-red-900">
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}