import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { sanitizeUnit } from '../utils/pricing';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=900';

function Cart() {
  const { items, subtotal, updateQuantity, removeFromCart } = useCart();

  return (
    <section className="space-y-6">
      <div>
        <h1 className="page-title">Your Cart</h1>
        <p className="page-subtitle">Review selected items, adjust quantity, and continue to checkout.</p>
      </div>

      {!items.length && <p className="text-slate-600">Cart is empty.</p>}

      {items.map((item) => (
        <article key={item.id} className="card flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <img
              src={item.imageUrl || FALLBACK_IMAGE}
              alt={item.name}
              className="h-20 w-20 rounded-xl border border-slate-200 object-cover"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = FALLBACK_IMAGE;
              }}
            />
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{item.name}</h3>
              <p className="text-sm text-slate-600">
                Rs {item.price.toFixed(2)} / {sanitizeUnit(item.unit)}
              </p>
              {item.discountPrice !== null && (
                <p className="text-xs text-slate-500 line-through">
                  Original: Rs {Number(item.originalPrice).toFixed(2)} / {sanitizeUnit(item.unit)}
                </p>
              )}
              <p className="text-xs text-slate-500">Available: {item.stock} {sanitizeUnit(item.unit)} (max allowed)</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={item.stock}
              value={item.quantity}
              onChange={(event) => updateQuantity(item.id, Number(event.target.value))}
              className="w-20"
            />
            <p className="text-xs text-slate-600">
              {item.quantity} {sanitizeUnit(item.unit)}
            </p>
            <button
              type="button"
              onClick={() => removeFromCart(item.id)}
              className="btn-danger"
            >
              Remove
            </button>
          </div>
          <p className="text-sm font-semibold text-slate-700">Line total: Rs {(item.quantity * item.price).toFixed(2)}</p>
        </article>
      ))}

      <div className="surface-panel">
        <p className="text-2xl font-semibold text-slate-900">Subtotal: Rs {subtotal.toFixed(2)}</p>
        <Link to="/checkout" className="btn-primary mt-4">
          Proceed to Checkout
        </Link>
      </div>
    </section>
  );
}

export default Cart;
