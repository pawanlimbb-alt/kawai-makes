import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { IMAGES } from '../data/images';
import { formatCurrency } from '../utils/formatters';

export const ProductModal = () => {
  const { selectedProduct, closeProduct, addToCart } = useCart();
  const [selectedOptions, setSelectedOptions] = useState({});
  const [note, setNote] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (selectedProduct) {
      const initialOptions = {};
      selectedProduct.options?.forEach((opt, idx) => {
        initialOptions[idx] = opt.choices[0] || '';
      });
      setSelectedOptions(initialOptions);
      setNote('');
      setQuantity(1);
    }
  }, [selectedProduct]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedProduct) {
        closeProduct();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedProduct, closeProduct]);

  if (!selectedProduct) return null;

  const handleOptionChange = (index, value) => {
    setSelectedOptions((prev) => ({ ...prev, [index]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const optsString = selectedProduct.options
      ?.map((opt, idx) => `${opt.label}: ${selectedOptions[idx] || opt.choices[0]}`)
      .join(', ');

    addToCart({
      id: selectedProduct.id,
      name: selectedProduct.name,
      price: selectedProduct.price,
      img: selectedProduct.img,
      qty: quantity,
      opts: optsString,
      note: note.trim()
    });

    closeProduct();
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeProduct();
      }}
    >
      <div className="modal-card" role="dialog" aria-labelledby="pdName">
        <form className="dlg" onSubmit={handleSubmit}>
          <div className="head">
            <h2 id="pdName">{selectedProduct.name}</h2>
            <button
              className="x"
              type="button"
              onClick={closeProduct}
              aria-label="Close"
            >
              &times;
            </button>
          </div>

          <div className="pd">
            <img src={IMAGES[selectedProduct.img]} alt={selectedProduct.name} />
            <div>
              <p className="price" style={{ fontSize: '1.3rem' }}>
                {formatCurrency(selectedProduct.price)}
              </p>
              <p style={{ margin: '6px 0 14px', color: 'var(--muted)' }}>
                {selectedProduct.desc}
              </p>

              {selectedProduct.options?.map((opt, idx) => (
                <div className="field" key={idx}>
                  <label htmlFor={`opt-${idx}`}>{opt.label}</label>
                  <select
                    id={`opt-${idx}`}
                    value={selectedOptions[idx] || opt.choices[0]}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                  >
                    {opt.choices.map((choice) => (
                      <option key={choice} value={choice}>
                        {choice}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="field" style={{ marginTop: '14px' }}>
            <label htmlFor="pnote">Customisation note (optional)</label>
            <textarea
              id="pnote"
              style={{ minHeight: '70px' }}
              placeholder="Different colours, a name or initial, a ribbon shade..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div
            style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}
          >
            <div className="qty" style={{ margin: 0 }}>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span>{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            <button className="btn" type="submit" style={{ flex: 1 }}>
              Add to bag
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
