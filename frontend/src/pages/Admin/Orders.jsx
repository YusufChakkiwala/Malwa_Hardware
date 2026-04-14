import { useEffect, useState } from 'react';
import AdminNav from '../../components/AdminNav';
import { fetchOrders, updateOrderStatus } from '../../services/orderService';

const statuses = ['pending', 'processing', 'completed', 'cancelled'];

function AdminOrders() {
  const [orders, setOrders] = useState([]);

  const load = async () => {
    const result = await fetchOrders();
    setOrders(result || []);
  };

  useEffect(() => {
    load();
  }, []);

  const changeStatus = async (id, status) => {
    await updateOrderStatus(id, status);
    await load();
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[250px_1fr]">
      <AdminNav />

      <div className="space-y-4">
        <h1 className="font-heading text-3xl text-slate-900">Orders</h1>

        <div className="space-y-3">
          {orders.map((order) => (
            <article key={order.id} className="surface-panel p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-600">Order #{order.id}</p>
                  <p className="text-lg font-semibold text-slate-900">{order.customerName}</p>
                  <p className="text-sm text-slate-500">
                    {order.phone} | { order.address } | {order.city}
                  </p>
                </div>

                <div>
                  <p className="text-xl font-semibold text-orange-600">Rs {Number(order.totalAmount).toFixed(2)}</p>
                  <select value={order.status} onChange={(event) => changeStatus(order.id, event.target.value)}>
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-3 space-y-1 text-sm text-slate-700">
                {order.items.map((item) => (
                  <p key={item.id}>
                    {item.product?.name || `Product #${item.productId}`} x {item.quantity}
                  </p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default AdminOrders;
