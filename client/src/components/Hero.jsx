import React from 'react';
import { IMAGES } from '../data/images';

export const Hero = () => {
  return (
    <section className="hero">
      <div className="wrap">
        <div>
          <h1>Tiny handmade things, knotted and purled by hand</h1>
          <p className="lead">
            Pipe cleaner bouquets, crochet keychains and beaded phone charms, made
            one at a time in India. Pick a ready piece or ask for your own colours.
          </p>
          <div className="cta">
            <a className="btn" href="#shop">Shop the collection</a>
            <a className="btn ghost" href="#custom">Order a custom piece</a>
          </div>
          <ul className="facts">
            <li>Made to order</li>
            <li>Custom colours welcome</li>
            <li>UPI payment</li>
            <li>COD in Dibrugarh</li>
          </ul>
        </div>
        <div className="hang" aria-hidden="true">
          <div className="tag">
            <div className="ring"></div>
            <div className="chain"></div>
            <figure>
              <img src={IMAGES.cat} alt="cat keychain" />
              <figcaption>cat keychain</figcaption>
            </figure>
          </div>
          <div className="tag">
            <div className="ring"></div>
            <div className="chain"></div>
            <figure>
              <img src={IMAGES.rose} alt="rose bouquet" />
              <figcaption>rose bouquet</figcaption>
            </figure>
          </div>
          <div className="tag">
            <div className="ring"></div>
            <div className="chain"></div>
            <figure>
              <img src={IMAGES.ele} alt="little elephant" />
              <figcaption>little elephant</figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
