import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

export interface Store {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  phone?: string;
  address?: string;
  createdAt: string;
  ownerId?: string;
}

type StoreFormState = {
  name: string;
  description: string;
  imageUrl: string;
  phone: string;
  address: string;
};

export function StoresBackofficePage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingStoreId, setEditingStoreId] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [form, setForm] = useState<StoreFormState>({
    name: '',
    description: '',
    imageUrl: '',
    phone: '',
    address: '',
  });

  const loadStores = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.stores.listMine();
      setStores(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStores();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setEditingStoreId(null);
    setImageUploadError(null);
    setForm({
      name: '',
      description: '',
      imageUrl: '',
      phone: '',
      address: '',
    });
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
      }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      const friendly =
        msg === 'Internal server error' || msg === 'API request failed'
          ? 'Upload failed. Try a smaller image (under 2 MB) or try again later.'
          : msg;
      setImageUploadError(friendly);
    } finally {
      setImageUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setForm((prev) => ({ ...prev, imageUrl: '' }));
    setImageUploadError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      if (!form.name.trim()) {
        setError('Name is required');
        return;
      }

      if (editingStoreId) {
        await api.stores.update(editingStoreId, {
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          imageUrl: form.imageUrl.trim() || undefined,
          phone: form.phone.trim() || undefined,
          address: form.address.trim() || undefined,
        });
      } else {
        await api.stores.create({
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          imageUrl: form.imageUrl.trim() || undefined,
          phone: form.phone.trim() || undefined,
          address: form.address.trim() || undefined,
        });
      }

      await loadStores();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save store');
    }
  };

  const handleEditClick = (store: Store) => {
    setEditingStoreId(store.id);
    setForm({
      name: store.name,
      description: store.description || '',
      imageUrl: store.imageUrl || '',
      phone: store.phone || '',
      address: store.address || '',
    });
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '16px' }}>My Stores</h1>

      {error && (
        <p style={{ color: 'red', marginBottom: '12px' }}>
          {error}
        </p>
      )}

      <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Stores list */}
        <div style={{ flex: 1, minWidth: '280px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>Existing Stores</h2>
          {loading ? (
            <p>Loading stores...</p>
          ) : stores.length === 0 ? (
            <p>You have no stores yet.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {stores.map((store) => (
                <li
                  key={store.id}
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
                    <div style={{ fontWeight: 600 }}>{store.name}</div>
                    {store.address && (
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>{store.address}</div>
                    )}
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                      Created: {new Date(store.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => handleEditClick(store)}
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
                    <Link
                      to={`/backoffice/stores/${store.id}/products`}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '4px',
                        backgroundColor: '#2563eb',
                        color: 'white',
                        textDecoration: 'none',
                        fontSize: '12px',
                      }}
                    >
                      Products
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Store form */}
        <div style={{ flex: 1, minWidth: '320px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>
            {editingStoreId ? 'Edit Store' : 'Create Store'}
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
                Description
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
            <div>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>
                Store image
              </label>
              {form.imageUrl ? (
                <div style={{ marginBottom: '8px' }}>
                  <img
                    src={form.imageUrl}
                    alt="Store"
                    style={{
                      maxWidth: '220px',
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
                  {imageUploading ? 'Uploading…' : 'Click to upload a store image (JPEG, PNG, etc.)'}
                </label>
              )}
              {imageUploadError && (
                <p style={{ color: '#b91c1c', fontSize: '13px', marginTop: '4px' }}>{imageUploadError}</p>
              )}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '4px' }}>
                Phone
              </label>
              <input
                type="text"
                name="phone"
                value={form.phone}
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
                Address
              </label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #d1d5db',
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
                {editingStoreId ? 'Update Store' : 'Create Store'}
              </button>
              {editingStoreId && (
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

