import React, { useState, useEffect } from 'react';
import { CATEGORIES } from '../data/config';
import { ProductCard } from './ProductCard';
import { useCart } from '../context/CartContext';
import { fetchProducts } from '../services/productService';

export const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const { openProduct } = useCart();

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const prods = await fetchProducts();
        if (isMounted) {
          setProducts(prods);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredProducts = products.filter(
    (p) => activeCategory === 'All' || p.cat === activeCategory || p.category === activeCategory
  );

  return (
    <section className="section" id="shop">
      <div className="wrap">
        <h2>The shop</h2>
        <p className="sub">
          Tap any piece to choose colours and add a note. Every item is made after
          you order, so please allow a few days.
        </p>

        <div className="chips" role="group" aria-label="Filter products">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`chip ${cat === activeCategory ? 'active' : ''}`}
              aria-pressed={cat === activeCategory}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="empty">Loading collection...</p>
        ) : (
          <div className="grid">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={openProduct}
                />
              ))
            ) : (
              <p className="empty">Nothing here yet. Check back soon.</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default Shop;
