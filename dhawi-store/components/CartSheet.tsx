'use client';

import { useRouter } from 'next/navigation';
import type { CartItem } from '@/lib/types';

interface Props {
  items: CartItem[];
  onClose: () => void;
  onUpdateQty: (productId: string, delta: number) => void;
  onRemove: (productId: string) => void;
  onClear: () => void;
}

export default function CartSheet({ items, onClose, onUpdateQty, onRemove, onClear }: Props) {
  const router = useRouter();
  const subtotal = items.reduce((s, i) => s + i.product.price * i.qty, 0);
  const vat = Math.round(subtotal * 0.15);
  const total = subtotal + vat;
  const count = items.reduce((s, i) => s + i.qty, 0);

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(10px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: '480px',
        background: '#08050F', borderTop: '1px solid rgba(201,168,76,0.22)',
        borderRadius: '24px 24px 0 0', padding: '20px 18px 40px', maxHeight: '82vh', overflowY: 'auto',
      }}>
        {/* handle */}
        <div style={{ width: 36, height: 4, background: 'rgba(255,255,255,0.10)', borderRadius: 2, margin: '0 auto 18px' }} />

        {/* header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#D4AF37' }}>🛒 السلة</div>
            <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.30)', marginTop: 2 }}>{count} منتج</div>
          </div>
          <button
            onClick={onClear}
            style={{ background: 'rgba(200,60,60,0.10)', border: '1px solid rgba(200,60,60,0.22)', color: 'rgba(200,100,100,0.70)', borderRadius: 8, padding: '4px 10px', fontSize: '0.70rem', cursor: 'pointer' }}
          >
            مسح الكل
          </button>
        </div>

        {/* items */}
        {items.length === 0
          ? <div style={{ textAlign: 'center', padding: '32px', color: 'rgba(255,255,255,0.22)', fontSize: '0.85rem' }}>السلة فارغة</div>
          : <div>
            {items.map((i) => (
              <div key={i.product.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: '1.6rem', flexShrink: 0 }}>{i.product.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#F0E6D0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{i.product.name}</div>
                  <div style={{ fontSize: '0.58rem', color: 'rgba(201,168,76,0.45)', marginTop: 2 }}>{i.product.season} · {i.product.gender}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <button onClick={() => onUpdateQty(i.product.id, -1)} style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: '#D4AF37', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                  <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '0.85rem', color: '#E8C870', minWidth: 16, textAlign: 'center' }}>{i.qty}</span>
                  <button onClick={() => onUpdateQty(i.product.id, 1)} style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: '#D4AF37', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                </div>
                <div style={{ minWidth: 58, textAlign: 'left', flexShrink: 0 }}>
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '0.85rem', fontWeight: 700, color: '#E8C870' }}>{i.product.price * i.qty}<span style={{ fontSize: '0.55rem', opacity: 0.6 }}> ر</span></div>
                  <button onClick={() => onRemove(i.product.id)} style={{ background: 'none', border: 'none', color: 'rgba(200,100,100,0.50)', cursor: 'pointer', fontSize: '0.65rem', padding: 0, marginTop: 2 }}>✕ حذف</button>
                </div>
              </div>
            ))}

            {/* totals */}
            <div style={{ borderTop: '1px solid rgba(201,168,76,0.15)', marginTop: 14, paddingTop: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>
                <span>المجموع</span><span style={{ fontFamily: "'IBM Plex Mono',monospace" }}>{subtotal} ر</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, fontSize: '0.68rem', color: 'rgba(255,255,255,0.25)' }}>
                <span>ضريبة القيمة المضافة 15%</span><span style={{ fontFamily: "'IBM Plex Mono',monospace" }}>{vat} ر</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16, background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.20)', borderRadius: 12, padding: '10px 14px' }}>
                <span style={{ fontSize: '0.78rem', color: 'rgba(201,168,76,0.70)' }}>الإجمالي شامل الضريبة</span>
                <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '1.25rem', fontWeight: 700, color: '#E8C870' }}>{total}<span style={{ fontSize: '0.62rem', opacity: 0.7 }}> ر</span></span>
              </div>
              <button
                onClick={() => { onClose(); router.push('/checkout'); }}
                style={{ width: '100%', padding: 14, background: 'linear-gradient(135deg,#C9A84C,#A07830)', border: 'none', borderRadius: 12, color: '#06040C', fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer' }}
              >
                إتمام الشراء ←
              </button>
              <button
                onClick={onClose}
                style={{ width: '100%', marginTop: 8, padding: '10px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 12, color: 'rgba(255,255,255,0.50)', fontSize: '0.80rem', cursor: 'pointer' }}
              >
                متابعة التسوق
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  );
}
