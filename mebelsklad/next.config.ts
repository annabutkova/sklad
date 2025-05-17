// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Сохраняем динамическую компиляцию для админки
  typescript: {
    // Игнорируем ошибки типизации при сборке
    ignoreBuildErrors: true,
  },
  eslint: {
    // Игнорируем ошибки ESLint при сборке
    ignoreDuringBuilds: true,
  },
  // Устанавливаем максимальный размер страницы
  experimental: {
    largePageDataBytes: 128 * 1000, // 128KB
  }
}

module.exports = nextConfig;