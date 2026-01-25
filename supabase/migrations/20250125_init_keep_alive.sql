-- Create a dedicated table for health checks to prevent Supabase pausing
create table if not exists public.health_check (
    id integer primary key,
    last_checked_at timestamptz default now()
);

-- Insert exactly one row for pinging
insert into public.health_check (id) 
values (1) 
on conflict (id) do nothing;

-- Enable RLS
alter table public.health_check enable row level security;

-- Allow anonymous read access (safe as it contains no user data)
create policy "Allow public read access" 
on public.health_check 
for select 
to anon, authenticated 
using (true);
