// Format price to currency
export function formatPrice(price: number): string {
  const formattedPrice = new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "UZS",
    maximumFractionDigits: 0,
  }).format(price);

  // Replace the standard currency symbol with "сум"
  return formattedPrice.replace("UZS", "сум");
}

// Generate a slug from a string
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with a single one
    .trim();
}

// Create a new ID for products, sets, etc.
export function generateId(prefix: string): string {
  const timestamp = Date.now().toString(36);
  const randomChars = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${prefix}${timestamp}${randomChars}`;
}

export function getProductsEnding(count: number) {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return "товаров найдено";
  }

  if (lastDigit === 1) {
    return "товар найден";
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return "товара найдено";
  }

  return "товаров найдено";
}
