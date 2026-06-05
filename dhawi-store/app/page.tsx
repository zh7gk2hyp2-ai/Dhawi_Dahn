'use client';

import { useState } from 'react';
import type { Product, CartItem } from '@/lib/types';
import PerfumeCard from '@/components/PerfumeCard';
import CartSheet from '@/components/CartSheet';

// ── Mock products (replace with Supabase fetch) ──────────────────────────────
const MOCK_PRODUCTS: Product[] = [
  { id: 'layali_riyadh', name: 'ليالي الرياض', name_en: 'Layali Riyadh', icon: '🌙', description: 'عود كمبودي فاخر مع نفحات الورد والمسك الأبيض', season: 'شتاء', gender: 'للجنسين', stability: 'طويل الأمد', price: 185, stock_available: true, layer_top: 18, layer_heart: 52, layer_base: 30 },
  { id: 'sir_altaif', name: 'سر الطائف', name_en: 'Sir Al Taif', icon: '🌹', description: 'ورد طائفي أصيل مع قلب من العود الهندي', season: 'ربيع', gender: 'نسائي', stability: 'متوسط', price: 145, stock_available: true, layer_top: 28, layer_heart: 45, layer_base: 27 },
  { id: 'malaki_fakhir', name: 'الملكي الفاخر', name_en: 'Al Malaki Al Fakhir', icon: '❄️', description: 'تركيبة ملكية من العود والمر والعنبر', season: 'شتاء', gender: 'رجالي', stability: 'ثقيل ودائم', price: 220, stock_available: true, layer_top: 12, layer_heart: 48, layer_base: 40 },
  { id: 'oud_alaseel', name: 'عود الأصيل', name_en: 'Oud Al Aseel', icon: '🟤', description: 'عود خالص بنكهة تراثية عميقة', season: 'مناسبات', gender: 'رجالي', stability: 'ثقيل ودائم', price: 260, stock_available: true, layer_top: 8, layer_heart: 35, layer_base: 57 },
  { id: 'noor_alsabah', name: 'نور الصباح', name_en: 'Noor Al Sabah', icon: '✨', description: 'انتعاش الصباح بالحمضيات والياسمين والمسك الخفيف', season: 'صيف', gender: 'نسائي', stability: 'خفيف', price: 120, stock_available: true, layer_top: 40, layer_heart: 42, layer_base: 18 },
  { id: 'amber_royal', name: 'العنبر الملكي', name_en: 'Amber Royal', icon: '🍯', description: 'دفء العنبر مع البخور الشرقي والمسك الثقيل', season: 'خريف', gender: 'للجنسين', stability: 'طويل الأمد', price: 175, stock_available: true, layer_top: 15, layer_heart: 40, layer_base: 45 },
];

export default function StorePage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('الكل');

  const addToCart = (product: Product) => {
    setCartItems((prev) => {
      const ex = prev.find((i) => i.product.id === product.id);
      return ex
        ? prev.map((i) => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i)
        : [...prev, { product, qty: 1 }];
    });
  };

  const updateQty = (productId: string, delta: number) => {
    setCartItems((prev) =>
      prev.map((i) => i.product.id === productId ? { ...i, qty: Math.max(1, i.qty + delta) } : i)
    );
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cartItems.reduce((s, i) => s + i.product.price * i.qty, 0);

  const filtered = MOCK_PRODUCTS.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.name.includes(q) || p.description.includes(q);
    const matchGender = genderFilter === 'الكل' || p.gender === genderFilter;
    return matchSearch && matchGender;
  });

  return (
    <main style={{ minHeight: '100vh', background: '#06040C', direction: 'rtl', fontFamily: "'Alexandria',sans-serif", color: '#EDE0C8' }}>
      {/* header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(6,4,12,0.92)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(201,168,76,0.12)', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', fontSize: '1.4rem', color: '#E8C870', lineHeight: 1 }}>Atelier Dhawi</div>
          <div style={{ fontSize: '0.45rem', letterSpacing: '0.5em', color: 'rgba(201,168,76,0.40)', textTransform: 'uppercase' }}>Private Oud Collection</div>
        </div>
        <button
          onClick={() => setShowCart(true)}
          style={{ position: 'relative', background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: 12, padding: '8px 16px', color: '#E8C870', cursor: 'pointer', fontSize: '0.80rem', fontWeight: 700 }}
        >
          🛒 {cartCount > 0 ? `${cartCount} · ${cartTotal} ر` : 'السلة'}
          {cartCount > 0 && (
            <span style={{ position: 'absolute', top: -6, right: -6, background: '#C9A84C', color: '#06040C', borderRadius: '50%', width: 18, height: 18, fontSize: '0.58rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>
              {cartCount}
            </span>
          )}
        </button>
      </header>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '20px 16px' }}>
        {/* hero */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: '0.55rem', color: 'rgba(201,168,76,0.40)', letterSpacing: '0.6em', textTransform: 'uppercase', fontFamily: "'Cormorant Garamond',serif", fontStyle: 'italic', marginBottom: 6 }}>
            Collection Exclusive
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F0E6D0', marginBottom: 6 }}>كوليكشن ضاوي</h1>
          <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.6 }}>
            تركيبات عطرية فاخرة من أجود مواد العود العربي والشرقي
          </p>
        </div>

        {/* search + filter */}
        <div style={{ marginBottom: 16 }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 ابحث عن عطر..."
            style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 12, color: '#EDE0C8', fontSize: '0.82rem', outline: 'none', marginBottom: 8, boxSizing: 'border-box' }}
          />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['الكل', 'رجالي', 'نسائي', 'للجنسين'].map((g) => (
              <button key={g} onClick={() => setGenderFilter(g)} style={{ padding: '4px 12px', borderRadius: 20, border: `1px solid ${genderFilter === g ? 'rgba(201,168,76,0.6)' : 'rgba(255,255,255,0.10)'}`, background: genderFilter === g ? 'rgba(201,168,76,0.12)' : 'rgba(255,255,255,0.03)', color: genderFilter === g ? '#E8C870' : 'rgba(255,255,255,0.40)', fontSize: '0.70rem', cursor: 'pointer', fontWeight: genderFilter === g ? 700 : 400 }}>
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* product grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {filtered.map((product) => (
            <PerfumeCard key={product.id} product={product} cartItems={cartItems} onAdd={addToCart} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.25)', fontSize: '0.85rem' }}>
            لا توجد منتجات مطابقة
          </div>
        )}
      </div>

      {/* cart sheet */}
      {showCart && (
        <CartSheet
          items={cartItems}
          onClose={() => setShowCart(false)}
          onUpdateQty={updateQty}
          onRemove={removeFromCart}
          onClear={() => setCartItems([])}
        />
      )}
    </main>
  );
}
