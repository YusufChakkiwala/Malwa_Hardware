import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const DELIVERY_GOAL = 5000;

function CartWidget() {
  const { itemCount, subtotal } = useCart();
  const progress = Math.min((subtotal / DELIVERY_GOAL) * 100, 100);
  const remaining = Math.max(DELIVERY_GOAL - subtotal, 0);

  return (
    <Link
      to="/cart"
      className="fixed bottom-5 left-5 z-30 w-56 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm shadow-industrial backdrop-blur hover:-translate-y-0.5"
    >
      <p className="font-extrabold text-slate-900">Cart: {itemCount} items</p>
      <p className="mt-1 text-xs text-slate-600">Subtotal Rs {subtotal.toFixed(2)}</p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
        <span className="block h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500" style={{ width: `${progress}%` }} />
      </div>
      <p className="mt-1 text-[11px] font-semibold text-cyan-700">
        {remaining > 0 ? `Add Rs ${remaining.toFixed(0)} for priority delivery` : 'Priority delivery unlocked'}
      </p>
    </Link>
  );
}

export default CartWidget;
