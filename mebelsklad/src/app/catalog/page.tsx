// src/app/catalog/page.tsx
import { Suspense } from "react";
import { jsonDataService } from "@/lib/api/jsonDataService";
import { Category, Product, ProductSet } from "@/types";
import ProductCard from "@/components/shop/ProductCard/ProductCard";
import CategorySidebar from "@/components/shop/CategorySidebar/CategorySidebar";
import SortSelector from "@/components/shop/SortSelector/SortSelector";
import SetCard from "@/components/shop/SetCard/SetCard";
import "./catalog.scss";
import { getProductsEnding } from "@/lib/utils/format";

interface CatalogPageProps {
  searchParams: {
    category?: string;
    sort?: string;
    type?: string; // Parameter to filter by type (products/sets)
  };
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  // Create a local copy of the search params
  const params = { ...(await searchParams) };
  const categorySlug = params.category;

  const sortOption = params.sort || "name-asc";
  const contentType = params.type || "all"; // 'all', 'products', or 'sets'

  const categories = await jsonDataService.getAllCategories();
  const categoryTree = await jsonDataService.getCategoryTree();
  const allProducts = await jsonDataService.getAllProducts();
  const allSets = await jsonDataService.getAllProductSets();

  // No need to filter by type property anymore - we'll use the API functions
  // that already return the correct data types

  let products: Product[] = [];
  let sets: ProductSet[] = [];
  let activeCategory: Category | null = null;

  if (categorySlug) {
    // Find the selected category
    activeCategory = categories.find((c) => c.slug === categorySlug) || null;

    if (activeCategory) {
      // Check if this category has any sets
      const categorySets = allSets.filter(
        (set) => set.categoryIds.includes(activeCategory!.id)
      );

      // Check if this category has any individual products
      const categoryProducts = allProducts.filter(
        (product) => product.categoryIds && activeCategory && product.categoryIds.includes(activeCategory.id)
      );

      // Determine what content to show based on available items and content type filter
      if (
        contentType === "products" ||
        (contentType === "all" && categoryProducts.length > 0)
      ) {
        products = categoryProducts;
      }

      if (
        contentType === "sets" ||
        (contentType === "all" && categorySets.length > 0)
      ) {
        sets = categorySets;
      }

      // If the category only has sets and no type is specified, show only sets
      if (
        contentType === "all" &&
        categorySets.length > 0 &&
        categoryProducts.length === 0
      ) {
        // This is a "sets-only" category (like bedroom)
        sets = categorySets;
        products = []; // Clear products to show only sets
      }
    } else {
      // Category not found - get all products and sets based on content type
      if (contentType === "all" || contentType === "products") {
        products = allProducts;
      }
      if (contentType === "all" || contentType === "sets") {
        sets = allSets;
      }
    }
  } else {
    // No category selected - get all products and sets based on content type
    if (contentType === "all" || contentType === "products") {
      products = allProducts;
    }
    if (contentType === "all" || contentType === "sets") {
      sets = allSets;
    }
  }

  // Sort products
  const sortProducts = (products: Product[], sortOption: string) => {
    switch (sortOption) {
      case "name-asc":
        return [...products].sort((a, b) => a.name.localeCompare(b.name));
      case "name-desc":
        return [...products].sort((a, b) => b.name.localeCompare(a.name));
      case "price-asc":
        return [...products].sort((a, b) => {
          const aPrice = a.discount ? a.price - a.discount : a.price;
          const bPrice = b.discount ? b.price - b.discount : b.price;
          return aPrice - bPrice;
        });
      case "price-desc":
        return [...products].sort((a, b) => {
          const aPrice = a.discount ? a.price - a.discount : a.price;
          const bPrice = b.discount ? b.price - b.discount : b.price;
          return bPrice - aPrice;
        });
      default:
        return products;
    }
  };

  // Sort product sets
  const sortSets = (sets: ProductSet[], sortOption: string) => {
    switch (sortOption) {
      case "name-asc":
        return [...sets].sort((a, b) => a.name.localeCompare(b.name));
      case "name-desc":
        return [...sets].sort((a, b) => b.name.localeCompare(a.name));
      case "price-asc":
        return [...sets].sort((a, b) => {
          // Calculate total price for set A
          const aTotalPrice = a.items.reduce((sum, item) => {
            const product = allProducts.find((p) => p.id === item.productId);
            if (!product) return sum;
            const productPrice = product.discount
              ? product.price - product.discount
              : product.price;
            return sum + productPrice * item.defaultQuantity;
          }, 0);

          // Calculate total price for set B
          const bTotalPrice = b.items.reduce((sum, item) => {
            const product = allProducts.find((p) => p.id === item.productId);
            if (!product) return sum;
            const productPrice = product.discount
              ? product.price - product.discount
              : product.price;
            return sum + productPrice * item.defaultQuantity;
          }, 0);

          return aTotalPrice - bTotalPrice;
        });
      case "price-desc":
        return [...sets].sort((a, b) => {
          // Calculate total price for set A
          const aTotalPrice = a.items.reduce((sum, item) => {
            const product = allProducts.find((p) => p.id === item.productId);
            if (!product) return sum;
            const productPrice = product.discount
              ? product.price - product.discount
              : product.price;
            return sum + productPrice * item.defaultQuantity;
          }, 0);

          // Calculate total price for set B
          const bTotalPrice = b.items.reduce((sum, item) => {
            const product = allProducts.find((p) => p.id === item.productId);
            if (!product) return sum;
            const productPrice = product.discount
              ? product.price - product.discount
              : product.price;
            return sum + productPrice * item.defaultQuantity;
          }, 0);

          return bTotalPrice - aTotalPrice;
        });
      default:
        return sets;
    }
  };

  const sortedProducts = sortProducts(products, sortOption);
  const sortedSets = sortSets(sets, sortOption);

  // Calculate total items count
  const totalItems = sortedProducts.length + sortedSets.length;

  // Flag to determine if we're only showing sets
  const showingSetsOnly = sortedProducts.length === 0 && sortedSets.length > 0;

  return (
    <main className="main">
      <div className="catalog-page-wrapper">
        {/* Category sidebar */}
        <div className="catalog-page-sidebar">
          <Suspense fallback={<div>Загружаем категории...</div>}>
            <CategorySidebar
              categories={categoryTree}
              activeCategory={activeCategory ? activeCategory.id : null}
            />
          </Suspense>
        </div>

        {/* Product grid */}
        <div className="catalog-page-grid">
          <h1 className="page-header">
            {activeCategory ? activeCategory.name : "Каталог"}
          </h1>
          {/* Sort and filter options */}
          <div className="catalog-page-sorting">
            <span className="catalog-page-found-count">
              {totalItems} {getProductsEnding(totalItems)}
            </span>
            <div className="flex items-center gap-4">
              {/* Content type filter - only show if this category has both types */}
              {activeCategory &&
                allProducts.some(
                  (p) => p.categoryIds?.includes(activeCategory?.id)
                ) &&
                allSets.some((s) => s.categoryIds.includes(activeCategory?.id)) && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Show:</span>
                    <select
                      className="border rounded-md p-1 text-sm"
                      defaultValue={contentType}
                      onChange={(e) => {
                        const url = new URL(window.location.href);
                        url.searchParams.set("type", e.target.value);
                        window.location.href = url.toString();
                      }}
                    >
                      <option value="all">All Items</option>
                      <option value="sets">Collections Only</option>
                      <option value="products">Products Only</option>
                    </select>
                  </div>
                )}
              <SortSelector currentSort={sortOption} />
            </div>
          </div>

          {/* Empty state */}
          {totalItems === 0 && (
            <div className="catalog-page-no-result">
              <h2 className="catalog-page-no-result-header">
                Ничего не найдено
              </h2>
              <p className="catalog-page-no-result-text">
                Попробуйте изменить параметры поиска или выберите другую
                категорию
              </p>
            </div>
          )}

          {/* Product sets section */}
          {sortedSets.length > 0 && (
            <div className="catalog-page-result">
              {!showingSetsOnly && (
                <h2 className="catalog-page-result-category">
                  Комплекты мебели
                </h2>
              )}
              <div className="products-wrapper">
                {sortedSets.map((set) => (
                  <SetCard key={set.id} set={set} allProducts={allProducts} />
                ))}
              </div>
            </div>
          )}

          {/* Individual products section */}
          {sortedProducts.length > 0 && (
            <div className="catalog-page-result">
              {sortedSets.length > 0 && (
                <h2 className="catalog-page-result-category">
                  Предметы мебели
                </h2>
              )}
              <div className="products-wrapper">
                {sortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}