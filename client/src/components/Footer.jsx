import React from 'react';
import { CONFIG } from '../data/config';

export const Footer = () => {
  return (
    <footer id="info">
      <div className="wrap">
        <div>
          <h3>kawai.makes</h3>
          <p>
            Knots and purls by bb. Handled by{' '}
            <a
              href="https://www.instagram.com/baishali.bb"
              target="_blank"
              rel="noopener noreferrer"
            >
              @baishali.bb
            </a>
            .
          </p>
          <p style={{ marginTop: '10px' }}>
            <a
              href={`https://www.instagram.com/${CONFIG.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Follow @{CONFIG.instagram} on Instagram
            </a>
          </p>
        </div>
        <div>
          <h3>Before you order</h3>
          <ul>
            <li>No exchange, refund, cancellation or return.</li>
            <li>Payment by UPI.</li>
            <li>Cash on delivery is available for Dibrugarh only.</li>
            <li>Colours may look slightly different on your screen.</li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
