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

-- ─── Seed data (6 sample products) ───────
insert into products (id, name, name_en, icon, description, season, gender, stability, price, layer_top, layer_heart, layer_base) values
  ('layali_riyadh', 'ليالي الرياض', 'Layali Riyadh', '🌙', 'عود كمبودي فاخر مع نفحات الورد والمسك الأبيض', 'شتاء', 'للجنسين', 'طويل الأمد', 185, 18, 52, 30),
  ('sir_altaif',    'سر الطائف',    'Sir Al Taif',    '🌹', 'ورد طائفي أصيل مع قلب من العود الهندي',          'ربيع',  'نسائي',    'متوسط',      145, 28, 45, 27),
  ('malaki_fakhir', 'الملكي الفاخر','Al Malaki',      '❄️', 'تركيبة ملكية من العود والمر والعنبر',            'شتاء',  'رجالي',    'ثقيل ودائم', 220, 12, 48, 40),
  ('oud_alaseel',   'عود الأصيل',   'Oud Al Aseel',   '🟤', 'عود خالص بنكهة تراثية عميقة',                   'مناسبات','رجالي',   'ثقيل ودائم', 260, 8,  35, 57),
  ('noor_alsabah',  'نور الصباح',   'Noor Al Sabah',  '✨', 'انتعاش الصباح بالحمضيات والياسمين والمسك',       'صيف',   'نسائي',    'خفيف',       120, 40, 42, 18),
  ('amber_royal',   'العنبر الملكي','Amber Royal',    '🍯', 'دفء العنبر مع البخور الشرقي والمسك الثقيل',      'خريف',  'للجنسين',  'طويل الأمد', 175, 15, 40, 45);
