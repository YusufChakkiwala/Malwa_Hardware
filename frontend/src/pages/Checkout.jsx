import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { createOrder } from '../services/orderService';
import { useUserAuth } from '../context/UserAuthContext';

const EMPTY_FORM = { customerName: '', phone: '', address: '', city: '' };

function buildProfileCustomerName(currentUser, profile) {
  const explicit = String(profile?.displayName || '').trim();
  if (explicit) return explicit;

  const combined = `${String(profile?.firstName || '').trim()} ${String(profile?.lastName || '').trim()}`.trim();
  if (combined) return combined;

  return String(currentUser?.displayName || currentUser?.email || '')
    .split('@')[0]
    .trim();
}

function parseSavedCheckoutForm(raw) {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return {};
    }
    return {
      customerName: String(parsed.customerName || '').trim(),
      phone: String(parsed.phone || '').trim(),
      address: String(parsed.address || '').trim(),
      city: String(parsed.city || '').trim()
    };
  } catch {
    return {};
  }
}

function preferNonEmpty(primary, fallback = '') {
  const first = String(primary || '').trim();
  if (first) return first;
  return String(fallback || '').trim();
}

function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const { currentUser, profile } = useUserAuth();
  const storageKey = useMemo(
    () => `checkout_details_${currentUser?.uid || 'guest'}`,
    [currentUser?.uid]
  );
  const profileDefaults = useMemo(
    () => ({
      customerName: buildProfileCustomerName(currentUser, profile),
      phone: String(profile?.phoneNumber || '').trim(),
      address: String(profile?.address || '').trim(),
      city: String(profile?.city || '').trim()
    }),
    [currentUser, profile]
  );
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const lastStorageKeyRef = useRef(storageKey);

  useEffect(() => {
    const saved = parseSavedCheckoutForm(localStorage.getItem(storageKey));
    const merged = {
      customerName: preferNonEmpty(saved.customerName, profileDefaults.customerName),
      phone: preferNonEmpty(saved.phone, profileDefaults.phone),
      address: preferNonEmpty(saved.address, profileDefaults.address),
      city: preferNonEmpty(saved.city, profileDefaults.city)
    };
    setForm((previous) => ({
      ...(lastStorageKeyRef.current === storageKey
        ? {
            customerName: previous.customerName || merged.customerName,
            phone: previous.phone || merged.phone,
            address: previous.address || merged.address,
            city: previous.city || merged.city
          }
        : merged)
    }));
    lastStorageKeyRef.current = storageKey;
  }, [storageKey, profileDefaults]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(form));
  }, [form, storageKey]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSubmitting(true);
    try {
      await createOrder({
        customerUid: currentUser?.uid || undefined,
        ...form,
        items: items.map((item) => ({ productId: item.id, quantity: item.quantity }))
      });
      clearCart();
      navigate('/products');
    } finally {
      setSubmitting(false);
    }
  };

  if (!items.length) {
    return <p className="text-slate-600">Add items to cart before checkout.</p>;
  }

  return (
    <section className="grid gap-8 md:grid-cols-2">
      <form onSubmit={handleSubmit} className="surface-panel">
        <h1 className="font-heading text-3xl text-slate-900">Checkout</h1>
        <p className="mt-2 text-sm text-slate-600">Enter delivery details to place your order.</p>
        <div className="mt-4 space-y-3">
          <input required value={form.customerName} onChange={(event) => handleChange('customerName', event.target.value)} placeholder="Customer name" />
          <input required value={form.phone} onChange={(event) => handleChange('phone', event.target.value)} placeholder="Phone" />
          <input required value={form.address} onChange={(event) => handleChange('address', event.target.value)} placeholder="Address" />
          <input required value={form.city} onChange={(event) => handleChange('city', event.target.value)} placeholder="City" />
        </div>
        <button type="submit" className="btn-primary mt-5">
          {submitting ? 'Placing Order...' : 'Confirm Order'}
        </button>
      </form>

      <div className="surface-panel">
        <h2 className="font-heading text-2xl text-slate-900">Order Summary</h2>
        <div className="mt-3 space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
              <span>
                {item.name} x {item.quantity}
              </span>
              <span>Rs {(item.quantity * item.price).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <p className="mt-5 text-xl font-semibold text-orange-600">Total: Rs {subtotal.toFixed(2)}</p>
      </div>
    </section>
  );
}

export default Checkout;
