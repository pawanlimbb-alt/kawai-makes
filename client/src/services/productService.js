


export async function fetchProducts() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch('/api/products', {
      credentials: 'include',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error('Failed to fetch products');
    }

    const data = await res.json();

    // An empty database should mean an empty product list.
    return Array.isArray(data.products) ? data.products : [];
  } catch (err) {
    console.error('Could not fetch products:', err);
    return [];
  }
}


export async function uploadProductImage(file) {
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch('/api/uploads/image', {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || 'Failed to upload product image.');
  }

  if (!data.imageUrl) {
    throw new Error('Upload succeeded, but no image URL was returned.');
  }

  return data.imageUrl;
}
