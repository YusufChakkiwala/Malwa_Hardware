import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchOrderHistory } from '../services/orderService';
import { useUserAuth } from '../context/UserAuthContext';

function OrderHistory() {
  const { currentUser } = useUserAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentUser?.uid) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    fetchOrderHistory(currentUser.uid)
      .then((data) => {
        setOrders(data || []);
      })
      .catch((requestError) => {
        setError(requestError?.response?.data?.message || 'Unable to load your order history.');
      })
      .finally(() => setLoading(false));
  }, [currentUser?.uid]);

  if (loading) {
    return <p className="text-sm text-slate-600">Loading your orders...</p>;
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-3xl text-slate-900">Order History</h1>
        <Link to="/products" className="btn-secondary">
          Continue Shopping
        </Link>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {!error && orders.length === 0 && (
        <div className="surface-panel">
          <p className="text-slate-700">You have not placed any orders yet.</p>
        </div>
      )}

      {!error && orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((order) => (
            <article key={order.id} className="surface-panel">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-lg font-semibold text-slate-900">Order #{order.id}</p>
                <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs uppercase text-cyan-700">
                  {order.status}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Placed on {new Date(order.createdAt || Date.now()).toLocaleString()}
              </p>
              <p className="mt-3 text-sm text-slate-600">
                {order.customerName} | {order.phone}
              </p>
              <p className="text-sm text-slate-600">
                {order.address}, {order.city}
              </p>

              <div className="mt-4 space-y-2">
                {(order.items || []).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                  >
                    <span>
                      {item.product?.name || `Product #${item.productId}`} x {item.quantity}
                    </span>
                    <span>Rs {Number(item.priceAtPurchase * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-right text-lg font-semibold text-orange-600">
                Total: Rs {Number(order.totalAmount || 0).toFixed(2)}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default OrderHistory;
