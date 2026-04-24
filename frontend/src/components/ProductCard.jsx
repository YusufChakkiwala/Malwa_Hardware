import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getPricing, sanitizeUnit } from '../utils/pricing';

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const lowStock = Number(product.stock) <= 5;
  const pricing = getPricing(product);
  const unit = sanitizeUnit(product.unit);

  return (
    <article className="card group float-in overflow-hidden p-0 transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_34px_rgba(14,116,144,0.18)]">
      <div className="relative overflow-hidden">
        <img
          src={product.imageUrl || 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=900'}
          alt={product.name}
          className="h-52 w-full object-cover transition duration-500 group-hover:scale-[1.05]"
        />
        <span className="absolute left-3 top-3 rounded-full border border-white/90 bg-white/85 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-cyan-700">
          {product.category?.name || 'General'}
        </span>
      </div>

      <div className="space-y-3 p-5">
        <h3 className="line-clamp-1 text-lg font-extrabold text-slate-900">{product.name}</h3>
        <p className="line-clamp-2 text-sm text-slate-600">{product.description}</p>

        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="text-xl font-extrabold text-orange-600">Rs {pricing.effectivePrice.toFixed(2)}</span>
            {pricing.hasDiscount && (
              <p className="text-xs text-slate-500 line-through">Rs {pricing.price.toFixed(2)}</p>
            )}
          </div>
          <span
            className={`rounded-full border px-2 py-1 text-xs font-semibold ${
              lowStock ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'
            }`}
          >
            {lowStock ? `Low Stock (${product.stock} ${unit})` : `In Stock (${product.stock} ${unit})`}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={product.stock <= 0}
            onClick={() => addToCart(product, 1)}
          >
            Add to Cart
          </button>
          <Link to={`/products/${product.id}`} className="btn-secondary">
            Details
          </Link>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
