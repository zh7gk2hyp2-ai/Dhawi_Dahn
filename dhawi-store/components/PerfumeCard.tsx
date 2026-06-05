'use client';

import { useState } from 'react';
import type { Product, CartItem } from '@/lib/types';
import LayerBalance from './LayerBalance';

interface Props {
  product: Product;
  cartItems: CartItem[];
  onAdd: (product: Product) => void;
}

export default function PerfumeCard({ product, cartItems, onAdd }: Props) {
  const [hovered, setHovered] = useState(false);
  const inCart = cartItems.find((i) => i.product.id === product.id);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onAdd(product)}
      style={{
        cursor: 'pointer',
        background: 'linear-gradient(145deg,#0E0B18,#06040C,#1E1830)',
        border: '1.5px solid rgba(201,168,76,0.18)',
        borderRadius: '20px',
        overflow: 'hidden',
        transform: hovered
          ? 'perspective(640px) rotateY(8deg) rotateX(-4deg) translateY(-6px)'
          : 'none',
        boxShadow: hovered
          ? '16px 12px 40px rgba(0,0,0,0.75), 0 0 20px rgba(201,168,76,0.15)'
          : '0 4px 20px rgba(0,0,0,0.5)',
        transition: 'transform 0.38s cubic-bezier(0.22,1,0.36,1), box-shadow 0.38s ease',
        userSelect: 'none',
        position: 'relative',
      }}
    >
      {/* top shimmer bar */}
      <div style={{
        height: '5px',
        background: 'linear-gradient(90deg,rgba(201,168,76,0.0),rgba(201,168,76,0.5),rgba(201,168,76,0.0))',
      }} />

      {/* season badge */}
      <div style={{
        position: 'absolute', top: '12px', right: '10px',
        fontSize: '0.52rem', padding: '2px 8px', borderRadius: '20px',
        background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.25)',
        color: 'rgba(201,168,76,0.70)',
      }}>
        {product.season}
      </div>

      <div style={{ padding: '14px 12px 12px', textAlign: 'center' }}>
        {/* icon */}
        <div style={{ fontSize: '2.4rem', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.6))', marginBottom: '6px', marginTop: '6px' }}>
          {product.icon}
        </div>

        {/* brand label */}
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: '0.38rem', color: 'rgba(201,168,76,0.40)', letterSpacing: '0.35em', textTransform: 'uppercase', marginBottom: '3px' }}>
          ATELIER DHAWI
        </div>

        {/* name */}
        <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#F0E6D0', letterSpacing: '-0.01em', lineHeight: 1.25, marginBottom: '8px' }}>
          {product.name}
        </div>

        {/* layer balance */}
        <div style={{ marginBottom: '8px' }}>
          <LayerBalance
            top={product.layer_top}
            heart={product.layer_heart}
            base={product.layer_base}
            showLabels={false}
          />
        </div>

        {/* gender · stability */}
        <div style={{ fontSize: '0.48rem', color: 'rgba(255,255,255,0.22)', marginBottom: '10px', direction: 'ltr' }}>
          {product.gender} · {product.stability}
        </div>

        {/* price + add button */}
        <div style={{ borderTop: '1px solid rgba(201,168,76,0.12)', paddingTop: '10px' }}>
          <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '1.2rem', fontWeight: 700, background: 'linear-gradient(135deg,#E8C870,#A07830)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '6px' }}>
            {product.price}
            <span style={{ fontSize: '0.60rem', opacity: 0.7 }}> ر</span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onAdd(product); }}
            style={{
              width: '100%', padding: '7px 4px', borderRadius: '20px', cursor: 'pointer',
              fontSize: '0.68rem', fontWeight: 700,
              background: inCart ? 'rgba(201,168,76,0.22)' : 'rgba(201,168,76,0.10)',
              border: `1px solid ${inCart ? 'rgba(201,168,76,0.55)' : 'rgba(201,168,76,0.22)'}`,
              color: inCart ? '#E8C870' : 'rgba(201,168,76,0.65)',
            }}
          >
            {inCart ? `✓ في السلة (${inCart.qty})` : '+ أضف للسلة'}
          </button>
        </div>
      </div>
    </div>
  );
}
