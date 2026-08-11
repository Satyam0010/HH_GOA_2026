create table if not exists public.share_records (
  share_id text primary key check (share_id ~ '^[a-f0-9]{32}$'),
  image_url text not null check (image_url ~ '^https://res\.cloudinary\.com/'),
  created_at timestamptz not null default now()
);

alter table public.share_records enable row level security;

-- Browser roles cannot read or write shares. The Vercel function uses the
-- server-only service role, which bypasses RLS and only performs INSERT/SELECT.
revoke all on table public.share_records from anon, authenticated;
grant select, insert on table public.share_records to service_role;
