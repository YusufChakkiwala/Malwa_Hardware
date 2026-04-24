export function sanitizeUnit(unit) {
  const normalized = String(unit || '').trim();
  return normalized || 'pcs';
}

export function normalizeAmount(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function normalizeDiscountPrice(price, discountPrice) {
  const parsedDiscount = Number(discountPrice);
  if (!Number.isFinite(parsedDiscount) || parsedDiscount < 0) {
    return null;
  }

  return parsedDiscount < price ? parsedDiscount : null;
}

export function getPricing(productOrItem) {
  const price = normalizeAmount(productOrItem?.price);
  const discountPrice = normalizeDiscountPrice(price, productOrItem?.discountPrice);

  return {
    price,
    discountPrice,
    effectivePrice: discountPrice ?? price,
    hasDiscount: discountPrice !== null
  };
}
