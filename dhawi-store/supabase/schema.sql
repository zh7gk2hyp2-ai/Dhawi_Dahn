-- ═══════════════════════════════════════════
-- Atelier Dhawi — Supabase Schema
-- ═══════════════════════════════════════════

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── Products ─────────────────────────────
create table products (
  id               text primary key,
  name             text not null,
  name_en          text,
  icon             text default '🧴',
  description      text,
  season           text,
  gender           text,
  stability        text,
  price            numeric(10,2) not null check (price > 0),
  stock_available  boolean default true,
  layer_top        smallint default 20 check (layer_top between 0 and 100),
  layer_heart      smallint default 50 check (layer_heart between 0 and 100),
  layer_base       smallint default 30 check (layer_base between 0 and 100),
  notes_top        text,     -- comma-separated Arabic ingredient names
  notes_heart      text,
  notes_base       text,
  volume_ml        smallint,
  concentration    text,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

-- ─── Orders ───────────────────────────────
create type order_status as enum (
  'pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'
);

create table orders (
  id                   uuid primary key default uuid_generate_v4(),
  customer_name        text not null,
  customer_phone       text not null,
  customer_address     text not null,
  customer_city        text,
  customer_postal_code text,
  subtotal             numeric(10,2) not null,
  vat                  numeric(10,2) not null,
  total                numeric(10,2) not null,
  status               order_status not null default 'pending',
  payment_id           text,          -- Moyasar payment ID
  payment_method       text,
  tracking_number      text,          -- Aramex tracking number
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

-- ─── Order Items ──────────────────────────
create table order_items (
  id          uuid primary key default uuid_generate_v4(),
  order_id    uuid not null references orders(id) on delete cascade,
  product_id  text not null references products(id),
  qty         smallint not null check (qty > 0),
  unit_price  numeric(10,2) not null,
  subtotal    numeric(10,2) generated always as (qty * unit_price) stored
);

-- ─── Indexes ──────────────────────────────
create index orders_status_idx on orders(status);
create index orders_created_idx on orders(created_at desc);
create index order_items_order_idx on order_items(order_id);

-- ─── Auto-update updated_at ───────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger products_updated_at before update on products
  for each row execute function set_updated_at();
create trigger orders_updated_at before update on orders
  for each row execute function set_updated_at();

-- ─── Row Level Security ───────────────────
alter table products    enable row level security;
alter table orders      enable row level security;
alter table order_items enable row level security;

-- Products: public read, admin write
create policy "Public read products"
  on products for select using (true);

-- Orders: insert open (new orders), read own (by phone — simple version)
create policy "Anyone can create order"
  on orders for insert with check (true);

-- Service role bypasses RLS for admin dashboard and webhooks.
-- Use createAdminClient() (service key) for server-side order reads.

-- ─── Seed data (8 sample products) ───────
insert into products (
  id, name, name_en, icon, description, season, gender, stability,
  concentration, volume_ml, price,
  layer_top, layer_heart, layer_base,
  notes_top, notes_heart, notes_base,
  featured
) values
  (
    'layali_riyadh', 'ليالي الرياض', 'Layali Riyadh', '🌙',
    'عود كمبودي فاخر مع نفحات الورد الطائفي والمسك الأبيض. رحلة شرقية عميقة.',
    'شتاء', 'للجنسين', 'طويل الأمد', 'EDP Intense', 50, 185,
    18, 52, 30, 'زعفران,برغموت', 'ورد طائفي,عود كمبودي', 'مسك أبيض,أمبرجري', true
  ),
  (
    'sir_altaif', 'سر الطائف', 'Sir Al Taif', '🌹',
    'ورد طائفي أصيل مستخلص بالبخار مع قلب من العود الهندي الفاخر.',
    'ربيع', 'نسائي', 'متوسط', 'EDP', 50, 145,
    28, 45, 27, 'ليمون,ألدهايد', 'ورد طائفي,عود هندي', 'مسك,صندل', true
  ),
  (
    'malaki_fakhir', 'الملكي الفاخر', 'Al Malaki Al Fakhir', '👑',
    'تركيبة ملكية من العود العماني والمر اليمني والعنبر الرمادي.',
    'شتاء', 'رجالي', 'ثقيل ودائم', 'Extrait', 30, 220,
    12, 48, 40, 'توابل سوداء,كافور', 'عود عماني,مر يمني', 'عنبر رمادي,بنكا', true
  ),
  (
    'oud_alaseel', 'عود الأصيل', 'Oud Al Aseel', '🪵',
    'عود خالص بنكهة تراثية عميقة من بلاد الرافدين.',
    'مناسبات', 'رجالي', 'ثقيل ودائم', 'Extrait', 30, 260,
    8, 35, 57, 'دخان خفيف', 'عود رافديني', 'أرض,راتينج,مسك أسود', false
  ),
  (
    'noor_alsabah', 'نور الصباح', 'Noor Al Sabah', '✨',
    'انتعاش الصباح بالحمضيات والياسمين والمسك الخفيف.',
    'صيف', 'نسائي', 'خفيف', 'EDP', 50, 120,
    40, 42, 18, 'نارنج,ليمون,غريب فروت', 'ياسمين,مورينغا', 'مسك أبيض,خشب الأرز', false
  ),
  (
    'amber_royal', 'العنبر الملكي', 'Amber Royal', '🍯',
    'دفء العنبر الشرقي مع البخور الفاخر والمسك الثقيل.',
    'خريف', 'للجنسين', 'طويل الأمد', 'EDP Intense', 50, 175,
    15, 40, 45, 'قرفة,هيل', 'عنبر,بخور لبنان', 'مسك ثقيل,فانيليا,صندل', false
  ),
  (
    'wardh_almalik', 'وردة الملك', 'Wardh Al Malik', '🌸',
    'ورد بلغاري وورد طائفي في تناغم مثالي مع العود الكمبودي الخالص.',
    'ربيع', 'نسائي', 'متوسط', 'EDP', 50, 195,
    30, 50, 20, 'توت بري,ألدهايد وردي', 'ورد بلغاري,ورد طائفي', 'مسك وردي,بودرة', false
  ),
  (
    'layl_alsahra', 'ليل الصحراء', 'Layl Al Sahra', '🌌',
    'تجسيد عطري للصحراء ليلاً: رمال دافئة وأخشاب ندية وعود مُبخَّر.',
    'كل المواسم', 'رجالي', 'طويل الأمد', 'EDP Intense', 50, 210,
    10, 38, 52, 'عرعر,بهارات جافة', 'عود مُبخَّر,خشب الغاف', 'رمل أبيض,مسك صحراوي,أمبرجري', false
  )
on conflict (id) do update set
  name        = excluded.name,
  description = excluded.description,
  price       = excluded.price,
  updated_at  = now();

-- ─── Views (convenience) ──────────────────

-- Sales summary per product
create or replace view product_sales_summary as
select
  p.id, p.name, p.name_en, p.price,
  coalesce(sum(oi.qty), 0)       as total_units_sold,
  coalesce(sum(oi.subtotal), 0)  as total_revenue_sar,
  count(distinct oi.order_id)    as order_count
from products p
left join order_items oi on oi.product_id = p.id
left join orders      o  on o.id = oi.order_id and o.status not in ('cancelled','refunded')
group by p.id, p.name, p.name_en, p.price
order by total_revenue_sar desc;

-- Order overview with totals
create or replace view order_overview as
select
  o.id, o.customer_name, o.customer_phone, o.customer_city,
  o.status, o.total, o.payment_method, o.tracking_number,
  count(oi.id)  as item_types,
  sum(oi.qty)   as total_qty,
  o.created_at
from orders o
left join order_items oi on oi.order_id = o.id
group by o.id
order by o.created_at desc;
