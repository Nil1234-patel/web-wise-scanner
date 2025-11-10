-- Create profiles table for user information
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  full_name text,
  created_at timestamp with time zone not null default now(),
  primary key (id)
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Create policies
create policy "Users can view their own profile" 
on public.profiles 
for select 
using (auth.uid() = id);

create policy "Users can insert their own profile" 
on public.profiles 
for insert 
with check (auth.uid() = id);

create policy "Users can update their own profile" 
on public.profiles 
for update 
using (auth.uid() = id);

-- Create function to handle new user registration
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

-- Trigger to automatically create profile on user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create scan_history table to store URL scan results
create table public.scan_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  url text not null,
  scan_type text not null check (scan_type in ('malware', 'vulnerability', 'legal')),
  safety_score integer not null check (safety_score >= 0 and safety_score <= 100),
  analysis_result jsonb,
  created_at timestamp with time zone not null default now()
);

-- Enable RLS for scan_history
alter table public.scan_history enable row level security;

-- Policies for scan_history
create policy "Users can view their own scan history" 
on public.scan_history 
for select 
using (auth.uid() = user_id);

create policy "Users can insert their own scans" 
on public.scan_history 
for insert 
with check (auth.uid() = user_id);

-- Create index for better performance
create index idx_scan_history_user_id on public.scan_history(user_id);
create index idx_scan_history_created_at on public.scan_history(created_at desc);