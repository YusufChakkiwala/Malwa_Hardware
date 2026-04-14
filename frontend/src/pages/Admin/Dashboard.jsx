import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminNav from '../../components/AdminNav';
import { fetchProducts } from '../../services/productService';
import { fetchOrders } from '../../services/orderService';
import { fetchQueries } from '../../services/chatService';
import { isAdminAuthenticated, loginAdmin, logoutAdmin } from '../../services/auth';

function Dashboard() {
  const navigate = useNavigate();
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [metrics, setMetrics] = useState({ products: 0, orders: 0, lowStock: 0, queries: 0 });
  const [storeSettings, setStoreSettings] = useState(() => {
    const saved = localStorage.getItem('store_settings');
    if (!saved) return { storeName: 'Malwa Hardware', contact: '7891338352' };
    try {
      return JSON.parse(saved);
    } catch {
      return { storeName: 'Malwa Hardware', contact: '7891338352' };
    }
  });

  const authenticated = useMemo(() => isAdminAuthenticated(), []);

  useEffect(() => {
    if (!authenticated) return;

    Promise.all([fetchProducts({ limit: 300 }), fetchOrders(), fetchQueries()])
      .then(([productsResponse, ordersResponse, queriesResponse]) => {
        const products = productsResponse.data || [];
        setMetrics({
          products: products.length,
          orders: ordersResponse.length,
          lowStock: products.filter((product) => product.stock <= 5).length,
          queries: queriesResponse.length
        });
      })
      .catch(() => {
        setMetrics({ products: 0, orders: 0, lowStock: 0, queries: 0 });
      });
  }, [authenticated]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setAuthError('');

    try {
      await loginAdmin(authForm.username, authForm.password);
      navigate('/admin/products');
    } catch (error) {
      setAuthError(error?.response?.data?.message || 'Login failed. Please check username/password.');
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin');
    window.location.reload();
  };

  const saveSettings = (event) => {
    event.preventDefault();
    localStorage.setItem('store_settings', JSON.stringify(storeSettings));
  };

  if (!authenticated) {
    return (
      <section className="surface-panel mx-auto max-w-md">
        <h1 className="font-heading text-3xl text-slate-900">Admin Login</h1>
        <form className="mt-4 space-y-3" onSubmit={handleLogin}>
          <input
            required
            value={authForm.username}
            onChange={(event) => setAuthForm((prev) => ({ ...prev, username: event.target.value }))}
            placeholder="Username"
          />
          <input
            required
            type="password"
            value={authForm.password}
            onChange={(event) => setAuthForm((prev) => ({ ...prev, password: event.target.value }))}
            placeholder="Password"
          />
          <button type="submit" className="btn-primary w-full">
            Login
          </button>
          {authError && <p className="text-sm text-red-600">{authError}</p>}
        </form>
      </section>
    );
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[250px_1fr]">
      <AdminNav />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-4xl text-slate-900">Dashboard</h1>
          <button type="button" onClick={handleLogout} className="btn-secondary">
            Logout
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <article className="surface-soft">
            <p className="text-sm text-slate-600">Total Products</p>
            <p className="mt-2 text-3xl font-bold text-orange-600">{metrics.products}</p>
          </article>
          <article className="surface-soft">
            <p className="text-sm text-slate-600">Total Orders</p>
            <p className="mt-2 text-3xl font-bold text-cyan-700">{metrics.orders}</p>
          </article>
          <article className="surface-soft">
            <p className="text-sm text-slate-600">Low Stock</p>
            <p className="mt-2 text-3xl font-bold text-red-600">{metrics.lowStock}</p>
          </article>
          <article className="surface-soft">
            <p className="text-sm text-slate-600">Queries</p>
            <p className="mt-2 text-3xl font-bold text-indigo-700">{metrics.queries}</p>
          </article>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Link to="/admin/products" className="surface-soft text-sm text-slate-700 hover:border-orange-300">
            Manage Products & Stock
          </Link>
          <Link to="/admin/orders" className="surface-soft text-sm text-slate-700 hover:border-orange-300">
            Manage Orders
          </Link>
          <Link to="/admin/chats" className="surface-soft text-sm text-slate-700 hover:border-orange-300">
            Live Chats
          </Link>
        </div>

        <form onSubmit={saveSettings} className="surface-panel">
          <h2 className="font-heading text-2xl text-slate-900">Settings</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <input
              value={storeSettings.storeName}
              onChange={(event) => setStoreSettings((prev) => ({ ...prev, storeName: event.target.value }))}
              placeholder="Store Name"
            />
            <input
              value={storeSettings.contact}
              onChange={(event) => setStoreSettings((prev) => ({ ...prev, contact: event.target.value }))}
              placeholder="Contact"
            />
          </div>
          <button type="submit" className="btn-primary mt-3">
            Save Settings
          </button>
        </form>
      </div>
    </section>
  );
}

export default Dashboard;
