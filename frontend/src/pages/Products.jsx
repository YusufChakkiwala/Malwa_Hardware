import { useEffect, useMemo, useState } from 'react';
import ProductCard from '../components/ProductCard';
import { fetchProducts } from '../services/productService';

function sortProducts(items, sortBy) {
  const copy = [...items];
  if (sortBy === 'price_low') {
    return copy.sort((a, b) => Number(a.price) - Number(b.price));
  }
  if (sortBy === 'price_high') {
    return copy.sort((a, b) => Number(b.price) - Number(a.price));
  }
  if (sortBy === 'name_asc') {
    return copy.sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
  }
  return copy;
}

function Products() {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [loading, setLoading] = useState(false);

  const loadProducts = async (overrides = {}) => {
    setLoading(true);
    try {
      const response = await fetchProducts({ q: query, category, limit: 48, ...overrides });
      setProducts(response.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const categories = useMemo(() => {
    const map = new Map();
    products.forEach((item) => {
      if (item.category?.slug) {
        map.set(item.category.slug, item.category.name);
      }
    });
    return Array.from(map.entries());
  }, [products]);

  const sortedProducts = useMemo(() => sortProducts(products, sortBy), [products, sortBy]);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="page-title">Product Catalog</h1>
        <p className="page-subtitle">Search, filter, and compare supplies quickly for better ordering decisions.</p>
      </div>

      <div className="surface-panel space-y-3">
        <div className="grid gap-3 md:grid-cols-[1fr_220px_200px_120px]">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products..."
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                loadProducts();
              }
            }}
          />

          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">All Categories</option>
            
            {categories.map(([slug, name]) => (
              <option key={slug} value={slug}>
                {name}
              </option>
            ))}
          </select>

          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="featured">Sort: Featured</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="name_asc">Name: A-Z</option>
          </select>

          <button type="button" onClick={() => loadProducts()} className="btn-primary">
            {loading ? 'Loading...' : 'Apply'}
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <p className="font-semibold text-slate-600">{loading ? 'Loading products...' : `${sortedProducts.length} products found`}</p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setCategory('');
              setSortBy('featured');
              loadProducts({ q: '', category: '' });
            }}
            className="font-semibold text-cyan-700 hover:underline"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sortedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {!loading && sortedProducts.length === 0 && <p className="text-sm text-slate-500">No products found for your filters.</p>}
    </section>
  );
}

export default Products;
