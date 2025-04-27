// src/app/admin/categories/page.tsx
import Link from 'next/link';
import { jsonDataService } from '@/lib/api/jsonDataService';
import { Category } from '@/types';

// Helper function to render a category with indentation based on depth
function CategoryRow({
  category,
  depth = 0,
  categoryMap
}: {
  category: any;
  depth?: number;
  categoryMap: Record<string, string>;
}) {
  return (
    <>
      <tr>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div style={{ marginLeft: `${depth * 1.5}rem` }} className="flex items-center">
              {depth > 0 && <span className="mr-2">└─</span>}
              <div className="text-sm font-medium text-gray-900">{category.name}</div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-500">{category.id}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-500">{category.parentId ? categoryMap[category.parentId] : 'None'}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          <Link
            href={`/admin/categories/${category.id}`}
            className="text-blue-600 hover:text-blue-900 mr-4"
          >
            Edit
          </Link>
          <button className="text-red-600 hover:text-red-900">
            Delete
          </button>
        </td>
      </tr>
      {category.children && category.children.length > 0 && (
        category.children.map((child: Category) => (
          <CategoryRow
            key={child.id}
            category={child}
            depth={depth + 1}
            categoryMap={categoryMap}
          />
        ))
      )}
    </>
  );
}

export default async function AdminCategoriesPage() {
  const flatCategories = await jsonDataService.getAllCategories();
  const categories = await jsonDataService.getCategoryTree();

  // Create a map of category IDs to names for easy lookup
  const categoryMap = flatCategories.reduce((map, category) => {
    map[category.id] = category.name;
    return map;
  }, {} as Record<string, string>);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Link
          href="/admin/categories/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add New Category
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Parent
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map(category => (
              <CategoryRow
                key={category.id}
                category={category}
                categoryMap={categoryMap}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}