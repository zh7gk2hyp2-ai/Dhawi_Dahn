'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Product, CartItem } from '@/lib/types';
import PerfumeCard from '@/components/PerfumeCard';
import CartSheet from '@/components/CartSheet';

// ─────────────────────────────────────────────
// Mock catalogue — used when Supabase env vars
// are absent (local dev without a project yet).
// ─────────────────────────────────────────────
const MOCK_PRODUCTS: Product[] = [
  {
    id: 'layali_riyadh',
    name: 'ليالي الرياض',
    name_en: 'Layali Riyadh',
    icon: '🌙',
    description: 'عود كمبودي فاخر مع نفحات الورد الطائفي والمسك الأبيض. رحلة شرقية عميقة تأخذك إلى ليالي الرياض الساحرة.',
    season: 'شتاء',
    gender: 'للجنسين',
    stability: 'طويل الأمد',
    price: 185,
    stock_available: true,
    layer_top: 18,
    layer_heart: 52,
    layer_base: 30,
    notes_top: ['زعفران', 'برغموت'],
    notes_heart: ['ورد طائفي', 'عود كمبودي'],
    notes_base: ['مسك أبيض', 'أمبرجري'],
    concentration: 'EDP Intense',
    volume_ml: 50,
  },
  {
    id: 'sir_altaif',
    name: 'سر الطائف',
    name_en: 'Sir Al Taif',
    icon: '🌹',
    description: 'ورد طائفي أصيل مستخلص بالبخار مع قلب من العود الهندي الفاخر. تركيبة نسائية راقية.',
    season: 'ربيع',
    gender: 'نسائي',
    stability: 'متوسط',
    price: 145,
    stock_available: true,
    layer_top: 28,
    layer_heart: 45,
    layer_base: 27,
    notes_top: ['ليمون', 'ألدهايد'],
    notes_heart: ['ورد طائفي', 'عود هندي', 'زنبق'],
    notes_base: ['مسك', 'صندل'],
    concentration: 'EDP',
    volume_ml: 50,
  },
  {
    id: 'malaki_fakhir',
    name: 'الملكي الفاخر',
    name_en: 'Al Malaki Al Fakhir',
    icon: '👑',
    description: 'تركيبة ملكية من العود العماني والمر اليمني والعنبر الرمادي. حضور مهيب لا يُنسى.',
    season: 'شتاء',
    gender: 'رجالي',
    stability: 'ثقيل ودائم',
    price: 220,
    stock_available: true,
    layer_top: 12,
    layer_heart: 48,
    layer_base: 40,
    notes_top: ['توابل سوداء', 'كافور'],
    notes_heart: ['عود عماني', 'مر يمني'],
    notes_base: ['عنبر رمادي', 'بنكا'],
    concentration: 'Extrait',
    volume_ml: 30,
  },
  {
    id: 'oud_alaseel',
    name: 'عود الأصيل',
    name_en: 'Oud Al Aseel',
    icon: '🪵',
    description: 'عود خالص بنكهة تراثية عميقة من بلاد الرافدين. للعارفين بجوهر العطر الحقيقي.',
    season: 'مناسبات',
    gender: 'رجالي',
    stability: 'ثقيل ودائم',
    price: 260,
    stock_available: true,
    layer_top: 8,
    layer_heart: 35,
    layer_base: 57,
    notes_top: ['دخان خفيف'],
    notes_heart: ['عود رافديني'],
    notes_base: ['أرض', 'راتينج', 'مسك أسود'],
    concentration: 'Extrait',
    volume_ml: 30,
  },
  {
    id: 'noor_alsabah',
    name: 'نور الصباح',
    name_en: 'Noor Al Sabah',
    icon: '✨',
    description: 'انتعاش الصباح بالحمضيات والياسمين والمسك الخفيف. خفة مرحة للمرأة المعاصرة.',
    season: 'صيف',
    gender: 'نسائي',
    stability: 'خفيف',
    price: 120,
    stock_available: true,
    layer_top: 40,
    layer_heart: 42,
    layer_base: 18,
    notes_top: ['نارنج', 'ليمون', 'غريب فروت'],
    notes_heart: ['ياسمين', 'مورينغا'],
    notes_base: ['مسك أبيض', 'خشب الأرز'],
    concentration: 'EDP',
    volume_ml: 50,
  },
  {
    id: 'amber_royal',
    name: 'العنبر الملكي',
    name_en: 'Amber Royal',
    icon: '🍯',
    description: 'دفء العنبر الشرقي مع البخور الفاخر والمسك الثقيل. للأمسيات الاستثنائية.',
    season: 'خريف',
    gender: 'للجنسين',
    stability: 'طويل الأمد',
    price: 175,
    stock_available: true,
    layer_top: 15,
    layer_heart: 40,
    layer_base: 45,
    notes_top: ['قرفة', 'هيل'],
    notes_heart: ['عنبر', 'بخور لبنان'],
    notes_base: ['مسك ثقيل', 'فانيليا', 'صندل'],
    concentration: 'EDP Intense',
    volume_ml: 50,
  },
  {
    id: 'wardh_almalik',
    name: 'وردة الملك',
    name_en: 'Wardh Al Malik',
    icon: '🌸',
    description: 'ورد بلغاري وورد طائفي في تناغم مثالي مع العود الكمبودي الخالص.',
    season: 'ربيع',
    gender: 'نسائي',
    stability: 'متوسط',
    price: 195,
    stock_available: false,
    layer_top: 30,
    layer_heart: 50,
    layer_base: 20,
    notes_top: ['توت بري', 'ألدهايد وردي'],
    notes_heart: ['ورد بلغاري', 'ورد طائفي', 'عود كمبودي'],
    notes_base: ['مسك وردي', 'بودرة'],
    concentration: 'EDP',
    volume_ml: 50,
  },
  {
    id: 'layl_alsahra',
    name: 'ليل الصحراء',
    name_en: 'Layl Al Sahra',
    icon: '🌌',
    description: 'تجسيد عطري للصحراء ليلاً: رمال دافئة وأخشاب ندية وعود مُبخَّر.',
    season: 'كل المواسم',
    gender: 'رجالي',
    stability: 'طويل الأمد',
    price: 210,
    stock_available: true,
    layer_top: 10,
    layer_heart: 38,
    layer_base: 52,
    notes_top: ['عرعر', 'بهارات جافة'],
    notes_heart: ['عود مُبخَّر', 'خشب الغاف'],
    notes_base: ['رمل أبيض', 'مسك صحراوي', 'أمبرجري'],
    concentration: 'EDP Intense',
    volume_ml: 50,
  },
];

// ─────────────────────────────────────────────
// Fetch products from Supabase (or fall back to mock)
// ─────────────────────────────────────────────
async function fetchProducts(): Promise<Product[]> {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return MOCK_PRODUCTS;

  try {
    const { createBrowserClient } = await import('@/lib/supabase');
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: true });

    if (error || !data || data.length === 0) return MOCK_PRODUCTS;
    return data as Product[];
  } catch {
    return MOCK_PRODUCTS;
  }
}

// ─────────────────────────────────────────────
// Main catalogue page
// ─────────────────────────────────────────────
export default function StorePage() {
  const [products, setProducts]       = useState<Product[]>(MOCK_PRODUCTS);
  const [cartItems, setCartItems]     = useState<CartItem[]>([]);
  const [showCart, setShowCart]       = useState(false);
  const [search, setSearch]           = useState('');
  const [genderFilter, setGenderFilter] = useState('الكل');
  const [seasonFilter, setSeasonFilter] = useState('الكل');
  const [isLoading, setIsLoading]     = useState(false);

  // Load products on mount
  useEffect(() => {
    setIsLoading(true);
    fetchProducts()
      .then(setProducts)
      .finally(() => setIsLoading(false));
  }, []);

  // ─── Cart actions ───────────────────────────
  const addToCart = useCallback((product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      return existing
        ? prev.map((i) =>
            i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i
          )
        : [...prev, { product, qty: 1 }];
    });
  }, []);

  const updateQty = useCallback((productId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((i) =>
          i.product.id === productId
            ? { ...i, qty: i.qty + delta }
            : i
        )
        .filter((i) => i.qty > 0)
    );
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCartItems((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  // ─── Derived values ─────────────────────────
  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cartItems.reduce((s, i) => s + i.product.price * i.qty, 0);

  const seasons    = ['الكل', ...Array.from(new Set(products.map((p) => p.season)))];
  const genders    = ['الكل', 'رجالي', 'نسائي', 'للجنسين'];
  const cartSet    = new Set(cartItems.map((i) => i.product.id));

  const filtered = products.filter((p) => {
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      p.name.includes(q) ||
      p.name_en.toLowerCase().includes(q) ||
      p.description.includes(q);
    const matchGender = genderFilter === 'الكل' || p.gender === genderFilter;
    const matchSeason = seasonFilter === 'الكل' || p.season === seasonFilter;
    return matchSearch && matchGender && matchSeason;
  });

  return (
    <main className="min-h-screen bg-obsidian text-cream font-body" dir="rtl">
      {/* ── Sticky Header ──────────────────────── */}
      <header className="sticky top-0 z-50 glass border-b border-gold/[0.12]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-[72px] flex items-center justify-between">
          {/* Brand */}
          <div className="flex flex-col">
            <span className="font-display italic text-2xl text-gold leading-none tracking-wide">
              Atelier Dhawi
            </span>
            <span className="font-mono text-[9px] text-gold/40 uppercase tracking-[0.45em] mt-0.5">
              Private Oud Collection
            </span>
          </div>

          {/* Nav + Cart */}
          <div className="flex items-center gap-3">
            {/* Gold rule decoration */}
            <div className="hidden sm:block w-px h-6 bg-gold/20" />

            {/* Cart button */}
            <button
              onClick={() => setShowCart(true)}
              className="relative flex items-center gap-2 px-4 py-2 rounded-md
                         border border-gold/25 bg-gold/[0.07]
                         text-gold text-sm font-body font-semibold
                         hover:border-gold/50 hover:bg-gold/[0.12]
                         transition-all duration-200"
              aria-label={`السلة — ${cartCount} منتج`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="w-5 h-5"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.836l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                />
              </svg>
              <span>
                {cartCount > 0
                  ? `${cartCount} · ${cartTotal.toLocaleString('ar-SA')} ر`
                  : 'السلة'}
              </span>

              {/* Badge */}
              {cartCount > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full
                             bg-gold text-obsidian text-[10px] font-black
                             flex items-center justify-center leading-none"
                  aria-live="polite"
                >
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero section ──────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-10 text-center">
        {/* Decorative label */}
        <p className="font-mono text-[10px] text-gold/40 uppercase tracking-[0.55em] mb-4">
          — Collection Exclusive —
        </p>

        {/* Arabic heading */}
        <h1 className="font-display text-4xl sm:text-5xl text-cream mb-3 leading-tight">
          كوليكشن{' '}
          <span className="text-gold-gradient italic">ضاوي</span>
        </h1>

        {/* Tagline */}
        <p className="text-sm text-cream/45 font-body max-w-md mx-auto leading-relaxed">
          تركيبات عطرية فاخرة من أجود مواد العود العربي والشرقي —
          لكل لحظة حكاية.
        </p>

        {/* Thin gold rule */}
        <div className="divider-gold mt-8 max-w-xs mx-auto" />
      </section>

      {/* ── Filters ───────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-8">
        {/* Search */}
        <div className="relative mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="absolute top-1/2 -translate-y-1/2 right-4 w-4 h-4 text-gold/40 pointer-events-none"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث عن عطر..."
            className="input-dark pr-11 text-sm"
            aria-label="البحث في المنتجات"
          />
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2 items-center">
          {/* Gender filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {genders.map((g) => (
              <button
                key={g}
                onClick={() => setGenderFilter(g)}
                className={`
                  px-3 py-1 rounded-full text-xs font-body border transition-all duration-200
                  ${genderFilter === g
                    ? 'border-gold/60 bg-gold/12 text-gold font-semibold'
                    : 'border-cream/10 bg-transparent text-cream/40 hover:border-cream/25 hover:text-cream/60'
                  }
                `}
              >
                {g}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-4 bg-cream/10 mx-1" />

          {/* Season filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {seasons.map((s) => (
              <button
                key={s}
                onClick={() => setSeasonFilter(s)}
                className={`
                  px-3 py-1 rounded-full text-xs font-mono border transition-all duration-200
                  ${seasonFilter === s
                    ? 'border-gold/50 bg-gold/10 text-gold/90'
                    : 'border-cream/10 bg-transparent text-cream/30 hover:border-cream/20 hover:text-cream/50'
                  }
                `}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Product grid ──────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        {isLoading ? (
          // Skeleton grid
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="skeleton rounded-lg h-80"
                style={{ animationDelay: `${idx * 0.08}s` }}
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <span className="text-5xl opacity-30">🕯</span>
            <p className="text-cream/30 font-body text-sm">
              لا توجد منتجات مطابقة لبحثك
            </p>
            <button
              onClick={() => { setSearch(''); setGenderFilter('الكل'); setSeasonFilter('الكل'); }}
              className="text-gold/60 text-xs font-mono hover:text-gold transition-colors"
            >
              مسح الفلاتر
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filtered.map((product, idx) => (
              <div
                key={product.id}
                className="page-enter"
                style={{ animationDelay: `${idx * 0.06}s` }}
              >
                <PerfumeCard
                  product={product}
                  cartItems={cartItems}
                  onAdd={addToCart}
                />
              </div>
            ))}
          </div>
        )}

        {/* Results count */}
        {!isLoading && filtered.length > 0 && (
          <p className="text-center mt-8 font-mono text-[10px] text-cream/20 uppercase tracking-widest">
            {filtered.length} تركيبة عطرية
          </p>
        )}
      </section>

      {/* ── Cart sheet ────────────────────────── */}
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
