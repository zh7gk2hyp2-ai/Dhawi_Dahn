'use client';

import { useState, useEffect } from 'react';
import type { CartItem } from '@/lib/types';

// In production: read cart from localStorage or context/Zustand store
function getStoredCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem('dhawi_cart') || '[]'); } catch { return []; }
}

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [form, setForm] = useState({ name: '', phone: '', city: 'الرياض', address: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { setCart(getStoredCart()); }, []);

  const subtotal = cart.reduce((s, i) => s + i.product.price * i.qty, 0);
  const vat = Math.round(subtotal * 0.15);
  const total = subtotal + vat;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address) { setError('يرجى ملء جميع الحقول'); return; }
    setLoading(true);
    setError('');

    try {
      // 1. Create order in Supabase
      // const { data: order } = await supabase.from('orders').insert({...}).select().single();

      // 2. Initiate Moyasar payment
      // const payment = await fetch('/api/pay', { method:'POST', body: JSON.stringify({ amount: total, orderId: order.id }) });
      // const { transaction_url } = await payment.json();
      // window.location.href = transaction_url;

      // Placeholder — remove when Moyasar is wired up:
      alert(`سيتم توجيهك لبوابة الدفع — المبلغ: ${total} ريال (شامل VAT)`);
    } catch {
      setError('حدث خطأ، يرجى المحاولة مجدداً');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', background: '#06040C', direction: 'rtl', fontFamily: "'Alexandria',sans-serif", color: '#EDE0C8', padding: '20px 16px' }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <a href="/" style={{ color: 'rgba(201,168,76,0.60)', textDecoration: 'none', fontSize: '0.85rem' }}>← العودة</a>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: '1.2rem', color: '#E8C870' }}>إتمام الطلب</div>
        </div>

        {/* order summary */}
        <div style={{ background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.14)', borderRadius: 16, padding: '14px 16px', marginBottom: 20 }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(201,168,76,0.60)', marginBottom: 10 }}>ملخص الطلب</div>
          {cart.map((i) => (
            <div key={i.product.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.78rem' }}>
              <span>{i.product.icon} {i.product.name} × {i.qty}</span>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", color: '#E8C870' }}>{i.product.price * i.qty} ر</span>
            </div>
          ))}
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(201,168,76,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>
              <span>المجموع</span><span>{subtotal} ر</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)', marginBottom: 8 }}>
              <span>VAT 15%</span><span>{vat} ر</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: '#E8C870' }}>
              <span>الإجمالي</span>
              <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '1.1rem' }}>{total} ر</span>
            </div>
          </div>
        </div>

        {/* customer form */}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
            {[
              { key: 'name', label: 'الاسم الكامل', placeholder: 'محمد الأحمدي', type: 'text' },
              { key: 'phone', label: 'رقم الجوال', placeholder: '05XXXXXXXX', type: 'tel' },
              { key: 'city', label: 'المدينة', placeholder: 'الرياض', type: 'text' },
              { key: 'address', label: 'العنوان التفصيلي', placeholder: 'الحي، الشارع، رقم المبنى', type: 'text' },
            ].map(({ key, label, placeholder, type }) => (
              <div key={key}>
                <div style={{ fontSize: '0.62rem', color: 'rgba(201,168,76,0.55)', marginBottom: 5, fontWeight: 600 }}>{label}</div>
                <input
                  type={type}
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  style={{ width: '100%', padding: '11px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 10, color: '#EDE0C8', fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            ))}
          </div>

          {error && <div style={{ background: 'rgba(200,60,60,0.10)', border: '1px solid rgba(200,60,60,0.25)', borderRadius: 10, padding: '10px 14px', fontSize: '0.72rem', color: '#e08080', marginBottom: 14 }}>{error}</div>}

          {/* payment methods */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 14px', marginBottom: 14 }}>
            <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>طرق الدفع المتاحة</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['مدى', 'Apple Pay', 'Visa', 'Mastercard'].map((m) => (
                <span key={m} style={{ fontSize: '0.60rem', padding: '3px 10px', borderRadius: 8, background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.18)', color: 'rgba(201,168,76,0.55)' }}>{m}</span>
              ))}
            </div>
            <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.20)', marginTop: 8 }}>معالجة الدفع بواسطة Moyasar · آمن ومشفر</div>
          </div>

          <button
            type="submit"
            disabled={loading || cart.length === 0}
            style={{ width: '100%', padding: 16, background: 'linear-gradient(135deg,#C9A84C,#A07830)', border: 'none', borderRadius: 14, color: '#06040C', fontWeight: 800, fontSize: '0.92rem', cursor: loading ? 'wait' : 'pointer', opacity: cart.length === 0 ? 0.4 : 1 }}
          >
            {loading ? '⏳ جاري التوجيه...' : `💳 ادفع ${total} ريال`}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: '0.55rem', color: 'rgba(255,255,255,0.18)' }}>
          الدفع مشفر ومحمي · شحن عبر Aramex خلال 3-5 أيام عمل
        </div>
      </div>
    </main>
  );
}
