
import React, { useState } from 'react';
import { uploadProductImage } from '../services/productService';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export const AdminPage = () => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('Keychains');
  const [material, setMaterial] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleNameChange = (value) => {
    setName(value);
    setSlug(
      value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
    );
  };

  const handleImageSelect = (file) => {
    setMessage('');
    setImageUrl('');
    setImageFile(null);
    setImagePreview('');

    if (!file) return;

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
    ];

    if (!allowedTypes.includes(file.type)) {
      setIsError(true);
      setMessage('Choose a JPEG, PNG, WebP, or GIF image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setIsError(true);
      setMessage('The image must be 5 MB or smaller.');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setIsError(false);
  };

  const handleImageUpload = async () => {
    if (!imageFile) {
      setIsError(true);
      setMessage('Choose an image first.');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      const url = await uploadProductImage(imageFile);
      setImageUrl(url);
      setIsError(false);
      setMessage('Image uploaded successfully!');
    } catch (error) {
      setIsError(true);
      setMessage(
        error instanceof Error ? error.message : 'Image upload failed.'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleProductSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    if (!imageUrl) {
      setIsError(true);
      setMessage('Upload the product image before saving.');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug,
          category,
          material,
          price: Number(price),
          description,
          imageUrl,
          options: [],
          active: true,
          sortOrder: 0,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Could not create product.');
      }

      setIsError(false);
      setMessage('Product created successfully!');

      setName('');
      setSlug('');
      setCategory('Keychains');
      setMaterial('');
      setPrice('');
      setDescription('');
      setImageFile(null);
      setImagePreview('');
      setImageUrl('');

      // Clear the file input after a successful save.
      const fileInput = document.getElementById('product-image');
      if (fileInput) fileInput.value = '';
    } catch (error) {
      setIsError(true);
      setMessage(
        error instanceof Error ? error.message : 'Could not create product.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Header />

      <main
        className="wrap"
        style={{ minHeight: '60vh', padding: '40px 0' }}
      >
        <div
          className="panel"
          style={{ maxWidth: '720px', margin: '0 auto' }}
        >
          <h2>Owner Dashboard</h2>

          <p style={{ color: 'var(--muted)', marginTop: '8px' }}>
            Add a new handmade product to your shop.
          </p>

          <form onSubmit={handleProductSubmit} style={{ marginTop: '24px' }}>
            <label htmlFor="product-name">Product name</label>
            <input
              id="product-name"
              required
              maxLength={150}
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Crochet Cat Keychain"
            />

            <label htmlFor="product-slug">Product slug</label>
            <input
              id="product-slug"
              required
              maxLength={180}
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="crochet-cat-keychain"
            />

            <label htmlFor="product-category">Category</label>
            <select
              id="product-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Bouquets">Bouquets</option>
              <option value="Keychains">Keychains</option>
              <option value="Phone charms">Phone charms</option>
              <option value="Other">Other</option>
            </select>

            <label htmlFor="product-material">Material</label>
            <input
              id="product-material"
              required
              maxLength={100}
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              placeholder="e.g. Cotton yarn"
            />

            <label htmlFor="product-price">Price (₹)</label>
            <input
              id="product-price"
              required
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="299"
            />

            <label htmlFor="product-description">Description</label>
            <textarea
              id="product-description"
              required
              maxLength={2000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your handmade product..."
              rows={4}
            />

            <div style={{ marginTop: '20px' }}>
              <label htmlFor="product-image">Product photo</label>
              <input
                id="product-image"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(e) => handleImageSelect(e.target.files?.[0])}
              />

              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Product preview"
                  style={{
                    display: 'block',
                    width: '180px',
                    height: '180px',
                    objectFit: 'cover',
                    borderRadius: '12px',
                    marginTop: '12px',
                  }}
                />
              )}

              <button
                type="button"
                className="btn"
                onClick={handleImageUpload}
                disabled={!imageFile || uploading || saving}
                style={{ marginTop: '12px' }}
              >
                {uploading ? 'Uploading image...' : 'Upload image'}
              </button>

              {imageUrl && (
                <p style={{ color: 'var(--muted)', marginTop: '8px' }}>
                  Image uploaded and ready to save.
                </p>
              )}
            </div>

            {message && (
              <p
                role="status"
                style={{
                  marginTop: '16px',
                  color: isError ? '#dc2626' : '#15803d',
                }}
              >
                {message}
              </p>
            )}

            <button
              type="submit"
              className="btn"
              disabled={saving || uploading}
              style={{ marginTop: '20px', marginRight: '12px' }}
            >
              {saving ? 'Saving product...' : 'Save product'}
            </button>

            <Link to="/" className="btn">
              Back to Shop
            </Link>
          </form>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default AdminPage;
