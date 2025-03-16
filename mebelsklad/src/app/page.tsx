import Link from 'next/link';
import Image from 'next/image';
import { jsonDataService } from '@/lib/api/jsonDataService';
import ProductCard from '@/components/shop/ProductCard/ProductCard';
import SetCard from '@/components/shop/SetCard';

export default async function Home() {
  const products = await jsonDataService.getAllProducts();
  const sets = await jsonDataService.getAllProductSets();
  const categories = await jsonDataService.getAllCategories();
  
  // Get top-level categories
  const mainCategories = categories.filter(cat => !cat.parentId);
  
  return (
    <main className="container mx-auto px-4 py-8">
      {/* Hero section */}
      <section className="relative h-96 rounded-lg overflow-hidden mb-12">
        <Image
          src="/images/hero.jpg"
          alt="Elegant furniture for your home"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center text-center p-6">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Элегантная Мебель для Вашего Дома
          </h1>
          <p className="text-xl text-white mb-6 max-w-2xl">
            Найдите идеальную мебель для создания комфорта и стиля
          </p>
          <Link
            href="/catalog"
            className="bg-white text-gray-900 px-6 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors"
          >
            Посмотреть Каталог
          </Link>
        </div>
      </section>
      
      {/* Featured products */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Популярные товары</h2>
          <Link href="/catalog" className="text-blue-600 hover:underline">
            Все товары →
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.slice(0, 4).map(product => (
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
          {sets.slice(0, 2).map(set => (
            <SetCard key={set.id} set={set} />
          ))}
        </div>
      </section>
      
      {/* Categories */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Категории</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mainCategories.map(category => (
            <Link 
              key={category.id}
              href={`/catalog?category=${category.slug}`}
              className="group relative h-48 rounded-lg overflow-hidden"
            >
              <Image
                src={category.imageUrl || '/images/placeholder.jpg'}
                alt={category.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                <h3 className="text-xl font-bold text-white">{category.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}