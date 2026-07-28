-- ============================================================================
-- ENDEVIS InvoiceFlow — Seed data (development)
-- ============================================================================

insert into public.company_settings (name, ico, dic, address, iban, swift, email, phone, primary_color)
values (
  'ENDEVIS s.r.o.', '12345678', 'CZ12345678',
  'Zlatá 16, 110 00 Praha 1', 'CZ6508000000192000145399', 'GIBACZPX',
  'fakturace@endevis.cz', '+420 222 333 444', '#C6A15B'
)
on conflict do nothing;

insert into public.product_categories (name) values
  ('Služby'), ('Software'), ('Hardware'), ('Materiál'), ('Doprava')
on conflict (name) do nothing;

insert into public.suppliers (name, email, phone) values
  ('Dodavatel Alfa s.r.o.', 'obchod@alfa.cz', '+420 111 222 333'),
  ('Beta Trading a.s.', 'sales@beta.cz', '+420 444 555 666')
on conflict do nothing;

-- Products / price list
insert into public.products (code, name, description, unit, purchase_price, sale_price, vat_rate, is_warehouse_item, sku, ean, stock, min_stock, status)
values
  ('SRV-001', 'Konzultace IT', 'Hodinová konzultace v oblasti IT', 'hod', 600, 1200, 21, false, null, null, 0, 0, 'active'),
  ('SW-001',  'Licence InvoiceFlow Pro', 'Roční licence ERP systému', 'ks', 3000, 8900, 21, false, null, null, 0, 0, 'active'),
  ('HW-001',  'Čtečka čárových kódů', 'USB laserová čtečka EAN/QR', 'ks', 450, 990, 21, true, 'SKU-HW-001', '8590123456789', 24, 5, 'active'),
  ('HW-002',  'Termotiskárna štítků', 'Tiskárna 80mm pro sklad', 'ks', 2100, 3990, 21, true, 'SKU-HW-002', '8590987654321', 3, 5, 'active'),
  ('MAT-001', 'Kancelářský papír A4', 'Balík 500 listů, 80g', 'bal', 89, 149, 21, true, 'SKU-MAT-001', '8591112223334', 120, 20, 'active')
on conflict (code) do nothing;

-- Customers
insert into public.customers (company, contact_person, ico, dic, address, city, zip, phone, email, website, tags)
values
  ('Novák & partneři s.r.o.', 'Jan Novák', '25896314', 'CZ25896314', 'Hlavní 12', 'Brno', '602 00', '+420 777 111 222', 'jan.novak@novak.cz', 'https://novak.cz', array['VIP','B2B']),
  ('TechShop a.s.', 'Petra Svobodová', '48759632', 'CZ48759632', 'Průmyslová 8', 'Ostrava', '702 00', '+420 777 333 444', 'petra@techshop.cz', 'https://techshop.cz', array['B2B']),
  ('Zahrada Zelená s.r.o.', 'Karel Dvořák', '63258741', null, 'Květinová 45', 'Plzeň', '301 00', '+420 777 555 666', 'info@zahradazelena.cz', null, array['B2C'])
on conflict do nothing;

-- Sample accepted quotation (ready to be converted into a Construction Project)
insert into public.quotations (number, customer_id, status, valid_until, subtotal, vat_total, total, notes)
select 'QTN-2026-000001', c.id, 'accepted', current_date + 30, 250000, 52500, 302500,
       'Rekonstrukce bytového jádra'
from public.customers c
where c.company = 'Novák & partneři s.r.o.'
limit 1
on conflict (number) do nothing;
