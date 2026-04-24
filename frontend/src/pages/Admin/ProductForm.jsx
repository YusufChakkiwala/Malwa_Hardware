import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminNav from '../../components/AdminNav';
import {
  createCategory,
  createProduct,
  fetchCategories,
  fetchProductById,
  updateProduct
} from '../../services/productService';
import { uploadImage } from '../../services/uploadService';

function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = useMemo(() => Boolean(id), [id]);

  const [categories, setCategories] = useState([]);
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '' });
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    discountPrice: '',
    unit: 'pcs',
    categoryId: '',
    stock: '',
    imageUrl: ''
  });

  useEffect(() => {
    fetchCategories().then((result) => setCategories(result || []));

    if (isEdit) {
      fetchProductById(id).then((product) => {
        setForm({
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price,
          discountPrice: product.discountPrice ?? '',
          unit: product.unit || 'pcs',
          categoryId: product.categoryId,
          stock: product.stock,
          imageUrl: product.imageUrl || ''
        });
      });
    }
  }, [id, isEdit]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);

    try {
      const normalizedPrice = Number(form.price);
      const normalizedDiscountPrice = form.discountPrice === '' ? null : Number(form.discountPrice);
      if (normalizedDiscountPrice !== null && normalizedDiscountPrice > normalizedPrice) {
        setSubmitError('Discount price must be less than or equal to price.');
        setIsSubmitting(false);
        return;
      }

      let imageUrl = form.imageUrl;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const payload = {
        ...form,
        imageUrl: imageUrl || '',
        price: normalizedPrice,
        discountPrice: normalizedDiscountPrice,
        unit: String(form.unit || '').trim() || 'pcs',
        categoryId: Number(form.categoryId),
        ...(String(form.stock).trim() !== '' ? { stock: Number(form.stock) } : {})
      };

      if (isEdit) {
        await updateProduct(id, payload);
      } else {
        await createProduct(payload);
      }

      navigate('/admin/products');
    } catch (error) {
      setSubmitError(error?.response?.data?.message || 'Failed to save product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const createCategoryQuick = async (event) => {
    event.preventDefault();
    setCategoryError('');

    try {
      await createCategory(categoryForm);
      const result = await fetchCategories();
      setCategories(result || []);
      setCategoryForm({ name: '', slug: '' });
    } catch (error) {
      setCategoryError(error?.response?.data?.message || 'Failed to add category.');
    }
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[250px_1fr]">
      <AdminNav />

      <div className="space-y-6">
        <h1 className="font-heading text-3xl text-slate-900">{isEdit ? 'Edit Product' : 'Create Product'}</h1>

        <form onSubmit={onSubmit} className="surface-panel">
          <div className="grid gap-3 md:grid-cols-2">
            <input required value={form.name} onChange={(event) => handleChange('name', event.target.value)} placeholder="Name" />
            <input required value={form.slug} onChange={(event) => handleChange('slug', event.target.value)} placeholder="Slug" />
            <input required value={form.price} onChange={(event) => handleChange('price', event.target.value)} placeholder="Price" type="number" />
            <input value={form.discountPrice} onChange={(event) => handleChange('discountPrice', event.target.value)} placeholder="Discount Price (optional)" type="number" min="0" />
            <input required value={form.unit} onChange={(event) => handleChange('unit', event.target.value)} placeholder="Unit (pcs, kg, box...)" />
            <input value={form.stock} onChange={(event) => handleChange('stock', event.target.value)} placeholder="Stock (optional, default 0)" type="number" min="0" />
            <select required value={form.categoryId} onChange={(event) => handleChange('categoryId', event.target.value)}>
            <option value="">Select category</option>
             
            

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <textarea
            required
            rows={5}
            value={form.description}
            onChange={(event) => handleChange('description', event.target.value)}
            className="mt-3 w-full"
            placeholder="Description"
          />

          <input
            type="file"
            className="mt-3"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => setImageFile(event.target.files?.[0] || null)}
          />
          {imageFile && <p className="mt-2 text-xs text-slate-500">Selected image: {imageFile.name}</p>}
          {form.imageUrl && !imageFile && (
            <div className="mt-3">
              <p className="text-xs text-slate-500">Current image</p>
              <img src={form.imageUrl} alt={`${form.name || 'product'} preview`} className="mt-2 h-28 w-28 rounded object-cover" />
            </div>
          )}
          {submitError && <p className="mt-3 text-sm text-red-600">{submitError}</p>}

          <button type="submit" disabled={isSubmitting} className="btn-primary mt-4 disabled:opacity-70">
            {isSubmitting ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
        </form>

        <form onSubmit={createCategoryQuick} className="surface-panel">
          <h2 className="font-heading text-xl text-slate-900">Quick Add Category</h2>
          <div className="mt-2 grid gap-3 md:grid-cols-2">
            <input
              required
              value={categoryForm.name}
              onChange={(event) => setCategoryForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Category name"
            />
            <input
              required
              value={categoryForm.slug}
              onChange={(event) => setCategoryForm((prev) => ({ ...prev, slug: event.target.value }))}
              placeholder="Category slug"
            />
          </div>
          <button type="submit" className="btn-secondary mt-3">
            Add Category
          </button>
          {categoryError && <p className="mt-2 text-sm text-red-600">{categoryError}</p>}
        </form>
      </div>
    </section>
  );
}

export default ProductForm;
