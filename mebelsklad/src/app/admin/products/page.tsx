// src/app/admin/products/page.tsx
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils/format";
import { categoriesApi, productsApi } from "@/lib/api/mongoApi";

export default async function AdminProductsPage() {
  const products = await productsApi.getAllProducts();
  const categories = await categoriesApi.getAllCategories();

  // Create a map of category IDs to names for easy lookup
  const categoryMap = categories.reduce((map, category) => {
    map[category.id] = category.name;
    return map;
  }, {} as Record<string, string>);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link
          href="/admin/products/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add New Product
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
                Product
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
                Status
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
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      {product.images && product.images.length > 0 ? (
                        <Image
                          className="h-10 w-10 rounded object-cover"
                          src={product.images[0].url}
                          alt={product.name}
                          width={100}
                          height={80}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-gray-200"></div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {product.name}
                      </div>
                      <div className="text-sm text-gray-500">{product.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {product.categoryIds.map((id) => categoryMap[id] || "Unknown").join(", ")}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {product.discount ? (
                    <div>
                      <div className="text-sm text-gray-500 line-through">
                        {formatPrice(product.price)}
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatPrice(product.price - product.discount)}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-900">
                      {formatPrice(product.price)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.inStock
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                      }`}
                  >
                    {product.inStock ? "In Stock" : "Out of Stock"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/admin/products/duplicate/${product.id}`}
                    className="text-green-600 hover:text-green-900 mr-4"
                  >
                    Duplicate
                  </Link>
                  <button className="text-red-600 hover:text-red-900">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
