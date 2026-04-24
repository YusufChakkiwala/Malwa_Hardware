import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartWidget from './components/CartWidget';
import ChatWidget from './components/ChatWidget';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import About from './pages/About';
import Contact from './pages/Contact';
import FAQPage from './pages/FAQPage';
import OrderHistory from './pages/OrderHistory';
import Dashboard from './pages/Admin/Dashboard';
import AdminProducts from './pages/Admin/Products';
import ProductForm from './pages/Admin/ProductForm';
import AdminOrders from './pages/Admin/Orders';
import AdminChats from './pages/Admin/Chats';
import AdminQueries from './pages/Admin/Queries';
import AdminFAQ from './pages/AdminFAQ';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import { isAdminAuthenticated } from './services/auth';
import { useUserAuth } from './context/UserAuthContext';

function RequireAdmin({ children }) {
  if (!isAdminAuthenticated()) {
    return <Navigate to="/admin" replace />;
  }
  return children;
}

function RequireUser({ children }) {
  const { currentUser, loading } = useUserAuth();
  if (loading) {
    return <p className="text-sm text-slate-600">Loading account...</p>;
  }
  if (!currentUser) {
    return <Navigate to="/auth" replace state={{ from: '/profile' }} />;
  }
  return children;
}

function App() {
  return (
    <div className="relative min-h-screen text-slate-900">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-20 top-28 h-80 w-80 rounded-full bg-cyan-200/45 blur-3xl" />
        <div className="absolute right-0 top-20 h-72 w-72 rounded-full bg-amber-200/45 blur-3xl" />
        <div className="absolute bottom-10 left-1/3 h-64 w-64 rounded-full bg-emerald-200/35 blur-3xl" />
      </div>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pb-10 pt-8 md:px-6 md:pt-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route
            path="/orders/history"
            element={
              <RequireUser>
                <OrderHistory />
              </RequireUser>
            }
          />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/login" element={<Auth />} />
          <Route
            path="/profile"
            element={
              <RequireUser>
                <Profile />
              </RequireUser>
            }
          />

          <Route path="/admin" element={<Dashboard />} />
          <Route
            path="/admin/products"
            element={
              <RequireAdmin>
                <AdminProducts />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/products/new"
            element={
              <RequireAdmin>
                <ProductForm />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/products/:id"
            element={
              <RequireAdmin>
                <ProductForm />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <RequireAdmin>
                <AdminOrders />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/chats"
            element={
              <RequireAdmin>
                <AdminChats />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/queries"
            element={
              <RequireAdmin>
                <AdminQueries />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/faqs"
            element={
              <RequireAdmin>
                <AdminFAQ />
              </RequireAdmin>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <CartWidget />
      <ChatWidget />
      <Footer />
    </div>
  );
}

export default App;
