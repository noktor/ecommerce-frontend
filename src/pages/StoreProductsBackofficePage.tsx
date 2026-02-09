import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, type Product } from '../services/api';

type ProductFormState = {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: string;
  imageUrl: string;
  thumbnailUrl: string;
  longDescription: string;
};

export function StoreProductsBackofficePage() {
  const { storeId } = useParams<{ storeId: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormState>({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    imageUrl: '',
    thumbnailUrl: '',
    longDescription: '',
  });

  const loadProducts = async () => {
    if (!storeId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await api.retailerProducts.list(storeId);
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setEditingProductId(null);
    setImageUploadError(null);
    setForm({
      name: '',
      description: '',
      price: '',
      stock: '',
      category: '',
      imageUrl: '',
      thumbnailUrl: '',
      longDescription: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeId) return;
    try {
      setError(null);
      if (!form.name.trim() || !form.description.trim() || !form.price.trim() || !form.stock.trim()) {
        setError('Name, description, price and stock are required');
        return;
      }

      const price = parseFloat(form.price);
      const stock = parseInt(form.stock, 10);
      if (Number.isNaN(price) || Number.isNaN(stock)) {
        setError('Price and stock must be valid numbers');
        return;
      }

      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price,
        stock,
        category: form.category.trim() || 'General',
        imageUrl: form.imageUrl.trim() || undefined,
        thumbnailUrl: form.thumbnailUrl.trim() || undefined,
        longDescription: form.longDescription.trim() || undefined,
      };

      if (editingProductId) {
        await api.retailerProducts.update(editingProductId, payload);
      } else {
        await api.retailerProducts.create(storeId, payload);
      }

      await loadProducts();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product');
    }
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !file.type.startsWith('image/')) {
      setImageUploadError('Please select an image file (e.g. JPEG, PNG)');
      return;
    }
    setImageUploadError(null);
    setImageUploading(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });
      const result = await api.uploads.uploadProductImage(dataUrl);
      setForm((prev) => ({
        ...prev,
        imageUrl: result.imageUrl,
        thumbnailUrl: result.thumbnailUrl,
      }));
    } catch (err) {
      setImageUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setImageUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setForm((prev) => ({ ...prev, imageUrl: '', thumbnailUrl: '' }));
    setImageUploadError(null);
  };

  const handleEditClick = (product: Product) => {
    setEditingProductId(product.id);
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      stock: String(product.stock),
      category: product.category,
      imageUrl: product.imageUrl || '',
      thumbnailUrl: product.thumbnailUrl || '',
      longDescription: product.longDescription || '',
    });
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0 }}>Products for Store {storeId}</h1>
        <Link
          to="/backoffice/stores"
          style={{
            padding: '6px 12px',
            borderRadius: '4px',
            border: '1px solid #d1d5db',
            backgroundColor: 'white',
            textDecoration: 'none',
            fontSize: '14px',
          }}
        >
          ← Back to Stores
        </Link>
      </div>

      {error && (
        <p style={{ color: 'red', marginBottom: '12px' }}>
          {error}
        </p>
      )}

      <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Products list */}
        <div style={{ flex: 1, minWidth: '320px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>Store Products</h2>
          {loading ? (
            <p>Loading products...</p>
          ) : products.length === 0 ? (
            <p>No products for this store yet.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {products.map((product) => (
                <li
                  key={product.id}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    padding: '12px',
                    marginBottom: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{product.name}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {product.category} · ${product.price.toFixed(2)} · Stock: {product.stock}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleEditClick(product)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '4px',
                      border: '1px solid #d1d5db',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    Edit
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Product form */}
        <div style={{ flex: 1, minWidth: '340px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>
            {editingProductId ? 'Edit Product' : 'Create Product'}
          </h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>
                Name*
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #d1d5db',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>
                Description*
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #d1d5db',
                  resize: 'vertical',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>
                  Price*
                </label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #d1d5db',
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>
                  Stock*
                </label>
                <input
                  type="number"
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #d1d5db',
                  }}
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>
                Category
              </label>
              <input
                type="text"
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="e.g. Electronics"
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #d1d5db',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>
                Product image
              </label>
              {form.imageUrl ? (
                <div style={{ marginBottom: '8px' }}>
                  <img
                    src={form.imageUrl}
                    alt="Product"
                    style={{
                      maxWidth: '200px',
                      maxHeight: '160px',
                      objectFit: 'contain',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                    }}
                  />
                  <div style={{ marginTop: '6px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <label
                      style={{
                        padding: '6px 12px',
                        borderRadius: '4px',
                        border: '1px solid #d1d5db',
                        backgroundColor: 'white',
                        cursor: 'pointer',
                        fontSize: '13px',
                      }}
                    >
                      Change image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        disabled={imageUploading}
                        style={{ display: 'none' }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '4px',
                        border: '1px solid #d1d5db',
                        backgroundColor: 'white',
                        cursor: 'pointer',
                        fontSize: '13px',
                      }}
                    >
                      Remove image
                    </button>
                  </div>
                </div>
              ) : (
                <label
                  style={{
                    display: 'block',
                    padding: '24px',
                    border: '2px dashed #d1d5db',
                    borderRadius: '6px',
                    textAlign: 'center',
                    cursor: imageUploading ? 'wait' : 'pointer',
                    backgroundColor: '#f9fafb',
                    color: '#6b7280',
                    fontSize: '14px',
                  }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    disabled={imageUploading}
                    style={{ display: 'none' }}
                  />
                  {imageUploading ? 'Uploading…' : 'Click to upload an image (JPEG, PNG, etc.)'}
                </label>
              )}
              {imageUploadError && (
                <p style={{ color: '#b91c1c', fontSize: '13px', marginTop: '4px' }}>{imageUploadError}</p>
              )}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>
                Long Description
              </label>
              <textarea
                name="longDescription"
                value={form.longDescription}
                onChange={handleChange}
                rows={4}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #d1d5db',
                  resize: 'vertical',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: '8px' }}>
              <button
                type="submit"
                style={{
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                {editingProductId ? 'Update Product' : 'Create Product'}
              </button>
              {editingProductId && (
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '4px',
                    border: '1px solid #d1d5db',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

