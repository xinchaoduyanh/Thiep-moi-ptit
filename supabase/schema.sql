create extension if not exists pgcrypto;

create table if not exists public.invites (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  salutation text not null default 'ban',
  guest_name text not null,
  private_wish text not null default '',
  facebook_url text not null default 'https://www.facebook.com/',
  note text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  invite_id uuid not null references public.invites(id) on delete cascade,
  sender_name text,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.invites add column if not exists salutation text not null default 'ban';

create index if not exists invites_slug_idx on public.invites(slug);
create index if not exists messages_invite_id_created_at_idx on public.messages(invite_id, created_at desc);

alter table public.invites enable row level security;
alter table public.messages enable row level security;

drop policy if exists "Public can read active invites" on public.invites;
create policy "Public can read active invites"
on public.invites
for select
using (is_active = true);

drop policy if exists "Temporary admin can create invites" on public.invites;
drop policy if exists "Temporary admin can delete invites" on public.invites;
drop policy if exists "Temporary admin can update invites" on public.invites;

drop policy if exists "Public can send messages to active invites" on public.messages;
create policy "Public can send messages to active invites"
on public.messages
for insert
with check (
  exists (
    select 1
    from public.invites
    where invites.id = messages.invite_id
      and invites.is_active = true
  )
);

drop policy if exists "Temporary admin can read messages" on public.messages;
drop policy if exists "Public can read no messages" on public.messages;
create policy "Public can read no messages"
on public.messages
for select
using (false);

insert into public.invites (slug, salutation, guest_name, private_wish, facebook_url, note)
values (
  'demo',
  'ban',
  'bạn thân mến',
  'Cảm ơn cậu đã đi cùng mình qua một chặng đường rất đặc biệt.
Ngày 23/05 tới, mình muốn cậu có mặt trong khung hình đẹp nhất của mình.
Sự xuất hiện của cậu sẽ làm ngày tốt nghiệp này trọn vẹn hơn nhiều.',
  'https://www.facebook.com/',
  'Thiệp demo để test giao diện trước khi tạo danh sách khách mời.'
)
on conflict (slug) do nothing;
