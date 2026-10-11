import React from 'react';
import { IMAGES } from '../data/images';
import { formatCurrency } from '../utils/formatters';

export const ProductCard = ({ product, onSelect }) => {
  return (
    <button
      className="prod"
      onClick={() => onSelect(product)}
      aria-label={`${product.name}, ${formatCurrency(product.price)}. Choose options`}
    >
      <div className="ph">
        <img
          src={product.imageUrl || IMAGES[product.img] || product.img}
          alt={product.name}
          loading="lazy"
        />
        <span className="mat">{product.mat}</span>
      </div>
      <h3>{product.name}</h3>
      <div className="row">
        <span className="price">{formatCurrency(product.price)}</span>
        <span className="add">Choose options</span>
      </div>
    </button>
  );
};

export default ProductCard;
