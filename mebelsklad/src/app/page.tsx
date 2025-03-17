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

  // Get top-level categories
  const mainCategories = categories.filter((cat) => !cat.parentId);

  // Get featured products (with discount or marked as featured)
  const featuredProducts = products.filter((p) => p.discount).slice(0, 4);

  return (
    <>
      <HomeSlider slides={sliderData} />
      
      <main className="main">
        {/* Featured products */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Популярные товары</h2>
            <Link href="/catalog" className="text-blue-600 hover:underline">
              Все товары →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Collections */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Наши коллекции</h2>
            <Link href="/sets" className="text-blue-600 hover:underline">
              Все коллекции →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sets.slice(0, 2).map((set) => (
              <SetCard key={set.id} set={set} allProducts={products} />
            ))}
          </div>
        </section>

        {/* Categories */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Категории</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mainCategories.map((category) => (
              <Link
                key={category.id}
                href={`/catalog?category=${category.slug}`}
                className="group relative h-48 rounded-lg overflow-hidden"
              >
                <img
                  src={category.imageUrl || "/images/placeholder.jpg"}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                  <h3 className="text-xl font-bold text-white">
                    {category.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
