// src/app/page.tsx
import Link from "next/link";
import { Metadata } from "next";
import { jsonDataService } from "@/lib/api/jsonDataService";
import ProductCard from "@/components/shop/ProductCard/ProductCard";
import SetCard from "@/components/shop/SetCard";
import HomeSlider from "@/components/home/HomeSlider";

export const metadata: Metadata = {
  title: "Мебель Склад | Готовая мебель из России",
  description: "Качественная мебель из России по выгодным ценам в Узбекистане",
};

// Slider data
const sliderData = [
  {
    image: "/images/slider/slide-1.jpg",
    title: "Элегантная Мебель для Вашего Дома",
    subtitle: "Найдите идеальную мебель для создания комфорта и стиля",
    buttonText: "Посмотреть Каталог",
    buttonLink: "/catalog",
  },
  {
    image: "/images/slider/slide-1.jpg",
    title: "Спальные Гарнитуры",
    subtitle: "Создайте спальню своей мечты с нашими комплектами мебели",
    buttonText: "Перейти к Коллекциям",
    buttonLink: "/catalog?category=spalnya",
  },
  {
    image: "/images/slider/slide-1.jpg",
    title: "Специальные Предложения",
    subtitle: "Не упустите шанс приобрести качественную мебель со скидкой",
    buttonText: "Смотреть Акции",
    buttonLink: "/catalog",
  },
];

export default async function Home() {
  const products = await jsonDataService.getAllProducts();
  const sets = await jsonDataService.getAllProductSets();
  const categories = await jsonDataService.getAllCategories();

  // Verify that the type fields are properly set
  const productsWithType = products.filter(p => p.type === 'product');
  const setsWithType = sets.filter(s => s.type === 'set');

  // Get top-level categories for furniture sets (Спальня, Детская, etc.)
  const setCategories = categories.filter(cat =>
    setsWithType.some(set => set.categoryId === cat.id)
  );

  // Get product-specific categories (Кровати, Шкафы, etc.)
  const productCategories = categories.filter(cat =>
    cat.parentId &&
    !setCategories.some(sc => sc.id === cat.id) &&
    productsWithType.some(product => product.categoryId === cat.id)
  );

  // Get featured products (with discount or marked as featured)
  const featuredProducts = productsWithType.filter(p => p.discount).slice(0, 4);

  return (
    <>
      <HomeSlider slides={sliderData} />

      <main className="main">
        {/* Categories of Sets (Bedrooms, Child rooms) */}
        <section className="products-section">
          <h2 className="products-header">Готовые комплекты</h2>


          <div className="set-wrapper">
            {setCategories.map((category) => (
              <Link
                key={category.id}
                href={`/catalog?category=${category.slug}`}
                className="group relative h-48 rounded-lg overflow-hidden"
              >
                <img
                  src={category.imageUrl || "/images/placeholder.jpg"}
                  alt={category.name}
                  className=" "
                />
                <div className="absolute   ">
                  <h3 className="text-xl font-bold text-white">
                    {category.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Product-specific Categories (Beds, Wardrobes) */}
        <section className="products-section">
          <h2 className="products-header">Предметы мебели</h2>

          <div className="items-wrapper">
            {productCategories.map((category) => (
              <Link
                key={category.id}
                href={`/catalog?category=${category.slug}`}
                className="group relative h-40 rounded-lg overflow-hidden"
              >
                <img
                  src={category.imageUrl || "/images/placeholder.jpg"}
                  alt={category.name}
                  className=" "
                />
                <div className="absolute   ">
                  <h3 className="text-lg font-bold text-white">
                    {category.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured products */}
        <section className="products-section">
          <h2 className="products-header">Популярные модели</h2>

          <div className="products-wrapper">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}