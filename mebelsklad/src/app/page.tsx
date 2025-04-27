// src/app/page.tsx
import Link from "next/link";
import { Metadata } from "next";
import { jsonDataService } from "@/lib/api/jsonDataService";
import ProductCard from "@/components/shop/ProductCard/ProductCard";
import SetCard from "@/components/shop/SetCard/SetCard";
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

const advantages = [
  {
    image: "/images/advantages/1.svg",
    title: "экологичная мебель",
    text: "Наша мебель соответствует российским и европейским стандартам безопасности",
  },
  {
    image: "/images/advantages/2.svg",
    title: "широкий ассортимент",
    text: "Подберём мебель под любой интерьер",
  },
  {
    image: "/images/advantages/3.svg",
    title: "профессиональная сборка",
    text: "Наши специалисты собирают мебель быстро и аккуратно",
  },
  {
    image: "/images/advantages/4.svg",
    title: "доставка по узбекистану",
    text: "Доставим в любую точку Узбекистана в короткие сроки",
  },
];

export default async function Home() {
  const products = await jsonDataService.getAllProducts();
  const sets = await jsonDataService.getAllProductSets();
  const categories = await jsonDataService.getAllCategories();

  // No need to filter by type since the getAllProducts and getAllProductSets
  // already return the correct data types

  // Get top-level categories for furniture sets (Спальня, Детская, etc.)
  const setCategories = categories.filter((cat) =>
    sets.some((set) => set.categoryId === cat.id)
  );

  // Get product-specific categories (Кровати, Шкафы, etc.)
  const productCategories = categories.filter(
    (cat) =>
      cat.parentId &&
      !setCategories.some((sc) => sc.id === cat.id) &&
      products.some((product) => product.categoryId === cat.id)
  );

  // Get featured products (with discount or marked as featured)
  const featuredProducts = products
    .filter((p) => p.discount)
    .slice(0, 4);

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
                className="set-category"
              >
                <img
                  src={category.imageUrl || "/images/placeholder.jpg"}
                  alt={category.name}
                  className="set-category-image"
                />
                <h3 className="set-category-title">{category.name}</h3>
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
                className="item-category"
              >
                <img
                  src={category.imageUrl || "/images/placeholder.jpg"}
                  alt={category.name}
                  className="item-category-image"
                />
                <h3 className="item-category-title">{category.name}</h3>
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

        <section className="banner">
          <img src="./images/banner/banner-o-nas.png" alt="" />
        </section>

        <section className="advantages">
          {advantages.map((advantage, index) => (
            <div className="advantage" key={index}>
              <img
                src={advantage.image}
                alt={advantage.title}
                className="advantage-img"
              />
              <h4 className="advantage-title">{advantage.title}</h4>
              <p className="advantage-text">{advantage.text}</p>
            </div>
          ))}
        </section>
      </main>
    </>
  );
}