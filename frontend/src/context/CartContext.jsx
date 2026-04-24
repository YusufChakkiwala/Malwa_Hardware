import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getPricing, sanitizeUnit } from '../utils/pricing';

const CartContext = createContext(null);

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
let backendOrigin = 'http://localhost:5000';

try {
  backendOrigin = new URL(apiBaseUrl).origin;
} catch {
  backendOrigin = 'http://localhost:5000';
}

function resolveImageUrl(imageUrl) {
  if (!imageUrl) {
    return '';
  }

  if (/^https?:\/\//i.test(imageUrl)) {
    return imageUrl;
  }

  if (/^[a-zA-Z]:\\/.test(imageUrl)) {
    return '';
  }

  const normalizedPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
  return `${backendOrigin}${normalizedPath}`;
}

function normalizeCartItem(item) {
  const originalPrice = Number.isFinite(Number(item.originalPrice))
    ? Number(item.originalPrice)
    : Number(item.price) || 0;
  const pricing = getPricing({
    price: originalPrice,
    discountPrice: item.discountPrice
  });
  const storedPrice = Number(item.price);
  const effectivePrice = Number.isFinite(storedPrice) && storedPrice >= 0 ? storedPrice : pricing.effectivePrice;

  return {
    ...item,
    price: effectivePrice,
    originalPrice,
    discountPrice: pricing.discountPrice,
    unit: sanitizeUnit(item.unit),
    stock: Number.isFinite(Number(item.stock)) ? Number(item.stock) : 0,
    quantity: Number.isFinite(Number(item.quantity)) && Number(item.quantity) > 0 ? Number(item.quantity) : 1,
    imageUrl: resolveImageUrl(item.imageUrl)
  };
}

function safeParse(jsonValue, fallback = []) {
  try {
    const parsed = JSON.parse(jsonValue);
    return Array.isArray(parsed) ? parsed.map(normalizeCartItem) : fallback;
  } catch {
    return fallback;
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => safeParse(localStorage.getItem('cart_items')));

  useEffect(() => {
    localStorage.setItem('cart_items', JSON.stringify(items));
  }, [items]);

  const addToCart = (product, quantity = 1) => {
    setItems((prev) => {
      const pricing = getPricing(product);
      const resolvedUnit = sanitizeUnit(product.unit);
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? {
                ...item,
                imageUrl: item.imageUrl || resolveImageUrl(product.imageUrl),
                price: pricing.effectivePrice,
                originalPrice: pricing.price,
                discountPrice: pricing.discountPrice,
                unit: resolvedUnit,
                quantity: Math.min(item.quantity + quantity, product.stock)
              }
            : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: pricing.effectivePrice,
          originalPrice: pricing.price,
          discountPrice: pricing.discountPrice,
          unit: resolvedUnit,
          imageUrl: resolveImageUrl(product.imageUrl),
          stock: product.stock,
          quantity: Math.min(quantity, product.stock)
        }
      ];
    });
  };

  const updateQuantity = (id, quantity) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: Math.max(1, Math.min(Number(quantity), item.stock || 9999))
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => setItems([]);

  const totals = useMemo(() => {
    const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
    const subtotal = items.reduce((acc, item) => acc + item.quantity * item.price, 0);
    return { itemCount, subtotal };
  }, [items]);

  const value = {
    items,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    ...totals
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
