import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { fetchProducts } from '../services/productService';

function Home() {
  const [products, setProducts] = useState([]);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    fetchProducts({ limit: 6 }).then((response) => setProducts(response.data || [])).catch(() => setProducts([]));
  }, []);

  useEffect(() => {
    if (!products.length) return undefined;
    const timer = setInterval(() => setSlide((prev) => (prev + 1) % products.length), 3200);
    return () => clearInterval(timer);
  }, [products]);

  const featured = useMemo(() => products.slice(0, 4), [products]);
  const current = products[slide];

  return (
    <section className="space-y-10">
      <div className="glass-highlight relative overflow-hidden rounded-[28px] p-8 md:p-10">
        <div className="pointer-events-none absolute -right-24 -top-20 h-72 w-72 rounded-full bg-orange-200/65 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-cyan-200/65 blur-3xl" />

        {current && (
          <div className="relative grid items-center gap-8 md:grid-cols-2">
            <div className="float-in">
              <p className="chip mb-4">Premium Industrial Supplies</p>
              <h1 className="page-title">{current.name}</h1>
              <p className="mt-4 max-w-xl text-slate-600">{current.description}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/products" className="btn-primary">
                  Shop Now
                </Link>
                <Link to="/contact" className="btn-secondary">
                  Request Query
                </Link>
              </div>

              <div className="mt-6 flex items-center gap-3">
                {products.slice(0, 4).map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSlide(index)}
                    className={`h-2.5 rounded-full transition-all ${
                      index === slide ? 'w-8 bg-orange-500' : 'w-2.5 bg-slate-300 hover:bg-cyan-400'
                    }`}
                    aria-label={`View featured product ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            <img
              src={current.imageUrl || 'https://images.unsplash.com/photo-1581147036304-cf7f5f7c3edb?w=1200'}
              alt={current.name}
              className="h-72 w-full rounded-3xl border border-white/90 object-cover shadow-industrial"
            />
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <article className="surface-soft">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-cyan-700">Fast Fulfillment</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">Same-day dispatch for in-stock orders.</p>
        </article>
        <article className="surface-soft">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-cyan-700">Verified Quality</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">Trusted brands and reliable industrial standards.</p>
        </article>
        <article className="surface-soft">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-cyan-700">Live Owner Support</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">Quick help via chat for product matching.</p>
        </article>
      </div>

      <div>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-heading text-3xl text-slate-900">Featured Products</h2>
            <p className="mt-1 text-sm text-slate-600">Top picks curated for contractors and retail counters.</p>
          </div>
          <Link to="/products" className="btn-secondary text-xs">
            View Full Catalog
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      <div className="surface-panel">
        <h3 className="font-heading text-2xl text-slate-900">About Malwa Hardware</h3>
        <p className="mt-2 text-sm text-slate-600">
          Reliable local hardware store serving contractors, shops, and households with quality products, fast order
          processing, and direct owner support.
        </p>
      </div>
    </section>
  );
}

export default Home;
