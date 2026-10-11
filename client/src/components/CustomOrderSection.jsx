import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

export const CustomOrderSection = () => {
  const { addToCart, openBag } = useCart();
  const [type, setType] = useState('Bouquet');
  const [details, setDetails] = useState('');
  const [colors, setColors] = useState('');
  const [neededBy, setNeededBy] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const det = details.trim();
    const col = colors.trim();
    const by = neededBy;

    const note = [
      det,
      col ? `Colours: ${col}` : '',
      by ? `Needed by: ${by}` : ''
    ]
      .filter(Boolean)
      .join(' | ');

    addToCart({
      id: 'custom',
      name: `Custom ${type.toLowerCase()}`,
      price: null,
      img: null,
      qty: 1,
      opts: 'Custom request',
      note
    });

    // Reset form
    setType('Bouquet');
    setDetails('');
    setColors('');
    setNeededBy('');

    openBag();
  };

  return (
    <section className="section custom" id="custom">
      <div className="wrap">
        <div>
          <h2>Want something that is only yours?</h2>
          <p className="sub" style={{ color: 'var(--ink)', opacity: 0.8 }}>
            Tell us what you have in mind: a bouquet in your friend's favourite
            colours, a keychain shaped like your pet, a phone charm with your initials.
          </p>
          <ol className="steps">
            <li>
              <b>1</b>
              <span>Fill in the request and add it to your bag.</span>
            </li>
            <li>
              <b>2</b>
              <span>Send the order on Instagram with any reference photos.</span>
            </li>
            <li>
              <b>3</b>
              <span>We confirm the price, you pay by UPI, and we start making.</span>
            </li>
          </ol>
        </div>

        <form className="panel" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="cType">What would you like?</label>
            <select
              id="cType"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="Bouquet">Bouquet</option>
              <option value="Keychain">Keychain</option>
              <option value="Phone charm">Phone charm</option>
              <option value="Something else">Something else</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="cDetails">Describe your idea</label>
            <textarea
              id="cDetails"
              required
              placeholder="Example: 5 pink pipe cleaner tulips with a cream wrap and a white ribbon"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </div>

          <div className="two">
            <div className="field">
              <label htmlFor="cColors">Colours</label>
              <input
                type="text"
                id="cColors"
                placeholder="Pink, cream, mint"
                value={colors}
                onChange={(e) => setColors(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="cDate">Needed by</label>
              <input
                type="date"
                id="cDate"
                value={neededBy}
                onChange={(e) => setNeededBy(e.target.value)}
              />
            </div>
          </div>

          <p className="hint" style={{ margin: '-4px 0 14px' }}>
            Custom prices depend on size and detail. We will confirm the final
            price before you pay.
          </p>
          <button className="btn" type="submit">
            Add custom request to bag
          </button>
        </form>
      </div>
    </section>
  );
};

export default CustomOrderSection;
