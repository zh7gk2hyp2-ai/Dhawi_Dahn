'use client';

import { useState, useEffect, useCallback, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { CartItem } from '@/lib/types';
import { calculateTotal, formatSAR, sarToHalala } from '@/lib/moyasar';

// ─────────────────────────────────────────────
// Checkout — 3-step flow:
//   1. summary  — review cart items + totals
//   2. info     — customer delivery info
//   3. payment  — Moyasar payment widget
// ─────────────────────────────────────────────

type Step = 'summary' | 'info' | 'payment';

interface CustomerInfo {
  name: string;
  phone: string;
  city: string;
  address: string;
  email: string;
}

const CITIES = [
  'الرياض', 'جدة', 'مكة المكرمة', 'المدينة المنورة',
  'الدمام', 'الخبر', 'الظهران', 'الطائف',
  'تبوك', 'أبها', 'بريدة', 'حائل',
  'جازان', 'نجران', 'سكاكا', 'عرعر',
];

// Load cart persisted by the store page
function getStoredCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem('dhawi_cart') || localStorage.getItem('dhawi_cart');
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart]           = useState<CartItem[]>([]);
  const [step, setStep]           = useState<Step>('summary');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg]   = useState<string | null>(null);
  const [customer, setCustomer]   = useState<CustomerInfo>({
    name: '', phone: '', city: 'الرياض', address: '', email: '',
  });

  useEffect(() => { setCart(getStoredCart()); }, []);

  // ─── Totals ────────────────────────────────
  const subtotalRaw = cart.reduce((s, i) => s + i.product.price * i.qty, 0);
  const { subtotal, vat, total } = calculateTotal(subtotalRaw);
  const itemCount  = cart.reduce((s, i) => s + i.qty, 0);

  // ─── Validation ────────────────────────────
  function validateCustomer(): string | null {
    if (!customer.name.trim())
      return 'يرجى إدخال الاسم الكامل';
    if (!/^(\+966|0)[5]\d{8}$/.test(customer.phone.replace(/\s/g, '')))
      return 'رقم الجوال يجب أن يكون سعودياً صحيحاً (مثال: 0512345678)';
    if (!customer.city)
      return 'يرجى اختيار المدينة';
    if (!customer.address.trim() || customer.address.trim().length < 10)
      return 'يرجى إدخال عنوان كامل (10 أحرف على الأقل)';
    if (customer.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email))
      return 'البريد الإلكتروني غير صحيح';
    return null;
  }

  // ─── Submit → Moyasar ──────────────────────
  const handlePayment = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const err = validateCustomer();
    if (err)              { setErrorMsg(err); return; }
    if (cart.length === 0){ setErrorMsg('السلة فارغة'); return; }

    setIsSubmitting(true);
    try {
      // ── PRODUCTION FLOW ──────────────────────────────────────────────────
      // Step 1: Create a pending order via Server Action or API Route:
      //
      //   const res = await fetch('/api/orders', {
      //     method: 'POST',
      //     headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify({ customer, items: cart, subtotal, vat, total }),
      //   });
      //   const { orderId } = await res.json();
      //
      // Step 2: Initiate Moyasar payment (server-side via lib/moyasar.ts):
      //
      //   import { createPayment, sarToHalala } from '@/lib/moyasar';
      //   const payment = await createPayment({
      //     amountSAR: total,
      //     description: `أتيلييه ضاوي — طلب ${itemCount} منتجات`,
      //     successUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?order=${orderId}`,
      //     errorUrl:   `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/error?order=${orderId}`,
      //     source: { type: 'creditcard' },   // overridden by Moyasar.js widget client-side
      //     metadata: { order_id: orderId, customer_phone: customer.phone },
      //   });
      //
      // Step 3: Redirect to Moyasar hosted page:
      //   window.location.href = payment.source.transaction_url!;
      //
      // ── MOYASAR.JS INLINE WIDGET ALTERNATIVE ─────────────────────────────
      // Instead of redirect, mount the widget on the payment step:
      //
      //   Moyasar.init({
      //     element: '.moyasar-form',
      //     amount: sarToHalala(total),          // Halala
      //     currency: 'SAR',
      //     description: `أتيلييه ضاوي — طلب #${orderId}`,
      //     publishable_api_key: process.env.NEXT_PUBLIC_MOYASAR_PK,
      //     callback_url: `${window.location.origin}/checkout/success`,
      //     methods: ['creditcard', 'mada', 'applepay', 'stcpay'],
      //     on_completed: async (payment) => {
      //       await fetch('/api/payment/verify', {
      //         method: 'POST',
      //         body: JSON.stringify({ payment_id: payment.id, order_id: orderId }),
      //       });
      //     },
      //   });
      // ─────────────────────────────────────────────────────────────────────

      // Scaffold: simulate async processing then advance to payment step
      await new Promise((r) => setTimeout(r, 900));
      setStep('payment');
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'حدث خطأ أثناء معالجة الطلب. يرجى المحاولة مجدداً.'
      );
    } finally {
      setIsSubmitting(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer, cart, total, itemCount]);

  // ─── Empty cart guard ──────────────────────
  if (cart.length === 0 && step === 'summary') {
    return (
      <main className="min-h-screen bg-obsidian text-cream font-body flex flex-col items-center justify-center px-4" dir="rtl">
        <div className="text-center space-y-4 max-w-sm">
          <span className="text-6xl opacity-25 block" role="img" aria-label="سلة فارغة">🛒</span>
          <h1 className="font-display text-2xl text-cream/70">السلة فارغة</h1>
          <p className="text-sm text-cream/40">
            لم تُضف أي منتجات بعد. تصفح مجموعتنا الحصرية.
          </p>
          <button onClick={() => router.push('/')} className="btn-gold-solid mt-4">
            العودة للمتجر
          </button>
        </div>
      </main>
    );
  }

  const steps: Step[] = ['summary', 'info', 'payment'];

  return (
    <main className="min-h-screen bg-obsidian text-cream font-body" dir="rtl">

      {/* ── Sticky Header ──────────────────────── */}
      <header className="sticky top-0 z-40 glass border-b border-gold/[0.12]">
        <div className="max-w-2xl mx-auto px-4 h-[64px] flex items-center justify-between">
          {/* Back button */}
          <button
            onClick={() => step === 'summary' ? router.push('/') : setStep(steps[steps.indexOf(step) - 1])}
            className="flex items-center gap-2 text-gold/55 hover:text-gold transition-colors text-sm font-body"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 rotate-180" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            {step === 'summary' ? 'متابعة التسوق' : 'رجوع'}
          </button>

          <span className="font-display italic text-lg text-gold">Atelier Dhawi</span>

          {/* Step pills */}
          <div className="flex items-center gap-1.5">
            {steps.map((s, idx) => (
              <span
                key={s}
                className={`w-5 h-5 rounded-full border font-mono text-[10px] flex items-center justify-center transition-all duration-300 ${
                  step === s
                    ? 'border-gold bg-gold/20 text-gold'
                    : steps.indexOf(step) > idx
                      ? 'border-gold/40 bg-gold/8 text-gold/50'
                      : 'border-cream/10 text-cream/20'
                }`}
              >
                {idx + 1}
              </span>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* ─────────────────── STEP 1: SUMMARY ─── */}
        {step === 'summary' && (
          <section className="space-y-5 page-enter">
            <h1 className="font-display text-3xl text-cream text-center">مراجعة الطلب</h1>

            {/* Items */}
            <div className="card-dark rounded-xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gold/10">
                <h2 className="font-body text-xs text-cream/50 font-semibold uppercase tracking-wide">
                  المنتجات · {itemCount} قطعة
                </h2>
              </div>
              <div className="divide-y divide-gold/[0.07]">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-4 px-5 py-4">
                    <span className="text-3xl leading-none flex-shrink-0">{item.product.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-sm text-cream font-semibold leading-snug">{item.product.name}</p>
                      <p className="font-mono text-[10px] text-gold/45 mt-0.5 uppercase tracking-wide">
                        {item.product.name_en} · {item.product.season}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-start">
                      <p className="font-mono text-sm text-gold font-semibold">
                        {(item.product.price * item.qty).toLocaleString('ar-SA')}
                        <span className="text-[9px] text-gold/50 mr-0.5">ر</span>
                      </p>
                      <p className="font-body text-[11px] text-cream/30 mt-0.5">
                        {item.product.price.toLocaleString('ar-SA')} × {item.qty}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="card-dark rounded-xl px-5 py-4 space-y-3">
              <div className="flex justify-between text-sm text-cream/50">
                <span className="font-body">المجموع قبل الضريبة</span>
                <span className="font-mono">{formatSAR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-cream/35">
                <span className="font-body">ضريبة القيمة المضافة (15٪)</span>
                <span className="font-mono">{formatSAR(vat)}</span>
              </div>
              <div className="flex justify-between text-sm text-cream/30">
                <span className="font-body">رسوم الشحن (Aramex)</span>
                <span className="font-mono text-green-400/65">مجاني</span>
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
              <div className="flex justify-between items-baseline">
                <span className="font-body text-base text-cream/75 font-semibold">الإجمالي شامل الضريبة</span>
                <span className="font-mono text-2xl text-gold font-bold">{formatSAR(total)}</span>
              </div>
            </div>

            <button onClick={() => setStep('info')} className="btn-gold-solid w-full py-4 text-base rounded-xl">
              المتابعة لإدخال بيانات التوصيل
            </button>
          </section>
        )}

        {/* ─────────────────── STEP 2: INFO ─────── */}
        {step === 'info' && (
          <section className="space-y-5 page-enter">
            <h1 className="font-display text-3xl text-cream text-center">بيانات التوصيل</h1>

            <form onSubmit={handlePayment} className="space-y-4" noValidate>
              {/* Full name */}
              <div>
                <label htmlFor="f-name" className="block font-body text-xs text-cream/50 mb-1.5 font-medium">
                  الاسم الكامل <span className="text-gold/60">*</span>
                </label>
                <input
                  id="f-name" type="text" required autoComplete="name" dir="rtl"
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  placeholder="محمد بن عبدالله الأحمدي"
                  className="input-dark"
                />
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="f-phone" className="block font-body text-xs text-cream/50 mb-1.5 font-medium">
                  رقم الجوال <span className="text-gold/60">*</span>
                </label>
                <input
                  id="f-phone" type="tel" required autoComplete="tel" dir="ltr" inputMode="tel"
                  value={customer.phone}
                  onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                  placeholder="0512345678"
                  className="input-dark font-mono tracking-wide"
                />
                <p className="mt-1 font-mono text-[10px] text-cream/20">
                  مثال: 0512345678 أو +966512345678
                </p>
              </div>

              {/* Email (optional) */}
              <div>
                <label htmlFor="f-email" className="block font-body text-xs text-cream/50 mb-1.5 font-medium">
                  البريد الإلكتروني{' '}
                  <span className="text-cream/22 text-[10px]">(اختياري — لإرسال إيصال)</span>
                </label>
                <input
                  id="f-email" type="email" autoComplete="email" dir="ltr"
                  value={customer.email}
                  onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                  placeholder="example@email.com"
                  className="input-dark font-mono"
                />
              </div>

              {/* City */}
              <div>
                <label htmlFor="f-city" className="block font-body text-xs text-cream/50 mb-1.5 font-medium">
                  المدينة <span className="text-gold/60">*</span>
                </label>
                <select
                  id="f-city" dir="rtl"
                  value={customer.city}
                  onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                  className="input-dark appearance-none"
                >
                  {CITIES.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* Address */}
              <div>
                <label htmlFor="f-address" className="block font-body text-xs text-cream/50 mb-1.5 font-medium">
                  العنوان التفصيلي <span className="text-gold/60">*</span>
                </label>
                <textarea
                  id="f-address" required rows={3} dir="rtl"
                  value={customer.address}
                  onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                  placeholder="الحي، الشارع، رقم المبنى أو الشقة..."
                  className="input-dark resize-none"
                />
              </div>

              {/* Mini total */}
              <div className="rounded-lg border border-gold/15 bg-gold/[0.04] px-4 py-3 flex justify-between items-center">
                <span className="font-body text-xs text-cream/45">الإجمالي ({itemCount} قطعة)</span>
                <span className="font-mono text-lg text-gold font-bold">{formatSAR(total)}</span>
              </div>

              {/* Error */}
              {errorMsg && (
                <div role="alert" className="rounded-lg border border-red-500/30 bg-red-500/8 px-4 py-3 text-sm text-red-300 font-body">
                  {errorMsg}
                </div>
              )}

              <button type="submit" disabled={isSubmitting} className="btn-gold-solid w-full py-4 text-base rounded-xl">
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    جاري معالجة الطلب...
                  </span>
                ) : 'الانتقال للدفع'}
              </button>
            </form>
          </section>
        )}

        {/* ─────────────────── STEP 3: PAYMENT ─── */}
        {step === 'payment' && (
          <section className="space-y-6 page-enter">
            <div className="text-center">
              <h1 className="font-display text-3xl text-cream mb-1">الدفع الآمن</h1>
              <p className="text-sm text-cream/35 font-body">
                مدعوم بـ Moyasar · بطاقة ائتمانية، مدى، Apple Pay، STC Pay
              </p>
            </div>

            {/* Moyasar widget container
                ════════════════════════
                Production setup:
                1. Add to layout.tsx <head>:
                   <script src="https://cdn.moyasar.com/mpf/1.14.0/moyasar.js" />
                   <link href="https://cdn.moyasar.com/mpf/1.14.0/moyasar.css" rel="stylesheet" />

                2. In a useEffect after mount:
                   (window as any).Moyasar?.init({
                     element:             '.moyasar-form',
                     amount:              sarToHalala(total),
                     currency:            'SAR',
                     description:         `أتيلييه ضاوي — ${itemCount} منتجات`,
                     publishable_api_key: process.env.NEXT_PUBLIC_MOYASAR_PK,
                     callback_url:        `${window.location.origin}/checkout/success`,
                     methods:             ['creditcard', 'mada', 'applepay', 'stcpay'],
                     on_completed:        (payment: MoyasarPaymentResponse) =>
                       fetch('/api/payment/verify', {
                         method: 'POST',
                         headers: { 'Content-Type': 'application/json' },
                         body: JSON.stringify({
                           payment_id: payment.id,
                           order_id:   sessionStorage.getItem('dhawi_order_id'),
                         }),
                       }),
                   });
            */}
            <div className="card-dark rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-gold/10">
                <p className="font-body text-xs text-cream/45 mb-3">طرق الدفع المتاحة</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'بطاقة ائتمانية', icon: '💳' },
                    { label: 'مدى',             icon: '🏧' },
                    { label: 'Apple Pay',        icon: '' },
                    { label: 'STC Pay',          icon: '📱' },
                  ].map((m) => (
                    <div key={m.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gold/20 bg-gold/5 text-xs font-body text-cream/55">
                      <span role="img" aria-hidden="true">{m.icon}</span>
                      {m.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Moyasar.js mounts here */}
              <div className="px-5 py-10">
                <div className="moyasar-form min-h-[160px] flex items-center justify-center" aria-label="نموذج الدفع — Moyasar">
                  <div className="text-center space-y-3">
                    <div className="w-10 h-10 rounded-full border-2 border-gold/25 border-t-gold animate-spin mx-auto" />
                    <p className="font-mono text-[11px] text-gold/40 uppercase tracking-wider">
                      Loading Moyasar...
                    </p>
                    <p className="font-body text-xs text-cream/22 max-w-xs">
                      في البيئة الحية سيظهر هنا نموذج الدفع الآمن من موياسر
                    </p>
                  </div>
                </div>
              </div>

              {/* Amount */}
              <div className="mx-5 mb-5 rounded-lg border border-gold/15 bg-gold/[0.05] px-4 py-3 flex justify-between items-center">
                <div>
                  <span className="font-body text-xs text-cream/45 block">المبلغ المستحق</span>
                  <span className="font-mono text-[10px] text-cream/25">
                    {sarToHalala(total).toLocaleString()} هللة
                  </span>
                </div>
                <span className="font-mono text-2xl text-gold font-bold">{formatSAR(total)}</span>
              </div>
            </div>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-5 opacity-35">
              {[
                { icon: '🔒', text: 'SSL 256-bit' },
                { icon: '🛡', text: 'PCI DSS' },
                { icon: '🇸🇦', text: 'موياسر السعودية' },
              ].map((b) => (
                <div key={b.text} className="flex items-center gap-1 text-[10px] font-mono text-cream/60">
                  <span aria-hidden="true">{b.icon}</span>
                  {b.text}
                </div>
              ))}
            </div>

            <p className="text-center font-body text-xs text-cream/20">
              الشحن عبر Aramex خلال 3–5 أيام عمل داخل المملكة
            </p>

            <button onClick={() => setStep('info')} className="w-full text-center font-body text-xs text-cream/25 hover:text-cream/45 transition-colors py-1">
              تعديل بيانات التوصيل
            </button>
          </section>
        )}

        {/* Footer */}
        <div className="text-center pb-4">
          <p className="font-mono text-[9px] text-cream/12 uppercase tracking-widest">
            Atelier Dhawi · جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </main>
  );
}
