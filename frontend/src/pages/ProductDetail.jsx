import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import  ProductGallery from '../components/ProductGallery';
import { useCart } from '../context/CartContext';
import { fetchProductById } from '../services/productService';

function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProductById(id).then(setProduct).catch(() => setProduct(null));
  }, [id]);

  if (!product) {
    return <p className="text-slate-600">Product not found.</p>;
  }

  return (
    <section className="grid gap-8 md:grid-cols-2">
      <ProductGallery imageUrl={product.imageUrl} name={product.name} />

      <div className="surface-panel">
        <p className="chip mb-3">Product Detail</p>
        <h1 className="font-heading text-4xl text-slate-900">{product.name}</h1>
        <p className="mt-3 text-sm text-slate-600">{product.description}</p>
        <p className="mt-4 text-3xl font-bold text-orange-600">Rs {Number(product.price).toFixed(2)}</p>
        <p className={`mt-2 text-sm font-semibold ${product.stock <= 5 ? 'text-red-600' : 'text-emerald-700'}`}>
          {product.stock <= 5 ? `Low Stock (${product.stock})` : `In Stock (${product.stock})`}
        </p>

        <div className="mt-6 flex items-center gap-3">
          <input
            type="number"
            min={1}
            max={product.stock}
            value={quantity}
            onChange={(event) => setQuantity(Number(event.target.value))}
            className="w-20"
          />
          <button
            type="button"
            onClick={() => addToCart(product, quantity)}
            className="btn-primary"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </section>
  );
}

export default ProductDetail;
