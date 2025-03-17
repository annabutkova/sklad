// src/components/layout/Header.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import "./Header.scss";
import contactData from "@/data/contactData";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <header className="header">
      <div className="header-wrapper">
        <Link href="/" className="header-logo"></Link>

        <Link href="/catalog" className="header-catalog-btn">
          Каталог
        </Link>

        <div className="header-search">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Поиск товаров"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button">
              Найти
            </button>
          </form>
        </div>

        <div className="header-contacts">
          <Link
            href={contactData.socialMedia.telegram}
            className="header-tg-btn"
          ></Link>

          <div className="header-info">
            <span className="header-worktime">
              {contactData.info.workDays} {contactData.info.workTime}
            </span>
            <a href={contactData.phoneNumbers.link} className="header-phone">
              {contactData.phoneNumbers.text}
            </a>
          </div>
        </div>

        {/* Cart and Mobile Menu Button */}
        <Link href="/cart" className="cart-button">
          {totalItems > 0 && (
            <span className="cart-button-quantity">{totalItems}</span>
          )}
          Корзина
        </Link>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-gray-600 focus:outline-none ml-4"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden py-4 border-t">
          {/* Search Bar - Mobile */}
          <form onSubmit={handleSearch} className="relative mb-4">
            <input
              type="text"
              placeholder="Search for products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2 px-4 pr-10 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="absolute inset-y-0 right-0 px-3 flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 text-gray-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </button>
          </form>

          <nav className="flex flex-col space-y-4">
            <Link
              href="/"
              className={`${
                isActive("/") ? "text-blue-600 font-medium" : "text-gray-600"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/catalog"
              className={`${
                isActive("/catalog")
                  ? "text-blue-600 font-medium"
                  : "text-gray-600"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Catalog
            </Link>
            <Link
              href="/sets"
              className={`${
                isActive("/sets")
                  ? "text-blue-600 font-medium"
                  : "text-gray-600"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Collections
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
