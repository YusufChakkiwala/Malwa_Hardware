import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminNav from '../../components/AdminNav';
import { deleteProduct, fetchProducts, updateProduct } from '../../services/productService';

function AdminProducts() {
  const [products, setProducts] = useState([]);

  const load = async () => {
    const response = await fetchProducts({ limit: 500 });
    setProducts(response.data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    await deleteProduct(id);
    await load();
  };

  const handleStockChange = async (id, stock) => {
    await updateProduct(id, { stock: Number(stock) });
    await load();
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[250px_1fr]">
      <AdminNav />

      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-3xl text-slate-900">Products & Stock</h1>
          <Link to="/admin/products/new" className="btn-primary">
            Add Product
          </Link>
        </div>

        <div className="surface-panel overflow-auto p-0">
          <table className="data-table">
            <thead>
              <tr>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2">Price</th>
                <th className="px-3 py-2">Discount</th>
                <th className="px-3 py-2">Unit</th>
                <th className="px-3 py-2">Stock</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-3 py-2">{product.name}</td>
                  <td className="px-3 py-2">{product.category?.name}</td>
                  <td className="px-3 py-2">Rs {Number(product.price).toFixed(2)}</td>
                  <td className="px-3 py-2">{product.discountPrice !== null ? `Rs ${Number(product.discountPrice).toFixed(2)}` : '-'}</td>
                  <td className="px-3 py-2">{product.unit || 'pcs'}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        defaultValue={product.stock}
                        className={`w-20 ${product.stock <= 5 ? 'border-red-500' : ''}`}
                        onBlur={(event) => handleStockChange(product.id, event.target.value)}
                      />
                      {product.stock <= 5 && <span className="text-xs text-red-600">Low Stock</span>}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <Link to={`/admin/products/${product.id}`} className="btn-secondary px-3 py-1 text-xs">
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(product.id)}
                        className="btn-danger px-3 py-1 text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default AdminProducts;
