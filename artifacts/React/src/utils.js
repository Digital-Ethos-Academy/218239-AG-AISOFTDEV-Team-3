// Utility functions for the app (simplified to avoid JSX issues)

export const formatPrice = (priceInCents) => {
  if (!priceInCents && priceInCents !== 0) return '$0.00';
  return `$${(priceInCents / 100).toFixed(2)}`;
};

export const isLowStock = (stock, reorderPoint = 10) => {
  const stockNum = parseInt(stock);
  return stockNum > 0 && stockNum <= reorderPoint;
};

export const isOutOfStock = (stock) => {
  const stockNum = parseInt(stock);
  return stockNum <= 0;
};

export const isAlertItem = (product) => {
  return isOutOfStock(product.stock) || isLowStock(product.stock);
};

// Simple category function without JSX
export const getCategoryName = (category) => {
  switch (category?.toLowerCase()) {
    case 'electronics':
      return 'Electronics';
    case 'apparel':
      return 'Apparel';
    case 'wellness':
      return 'Wellness';
    case 'furniture':
      return 'Furniture';
    default:
      return 'Other';
  }
};
