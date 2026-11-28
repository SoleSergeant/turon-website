-- Copy TuronMUN accounts (logins + profiles) from the old turonmun project
-- (ref ylqgyxibakupzxbvwgvf, Tokyo) into turon-one (ref acqfxuvnhmmgblkmcpnh).
--
-- Where to run: Supabase dashboard → project **turon-one** → SQL Editor.
-- Before running: replace PASTE_OLD_CONNECTION_STRING_HERE (one place, below) with the
--   old project's "Session pooler" connection string, with its database password filled in:
--   turonmun project → Connect → Session pooler → the postgresql://postgres.ylqgyxibakupzxbvwgvf:…@…pooler.supabase.com:5432/postgres URI.
--   Don't save the query with the password in it, and don't paste it anywhere else.
--
-- What it does:
--   * reads the old database in READ ONLY mode (it cannot change turonmun);
--   * copies auth.users (same ids, same password hashes: email users keep their password),
--     auth.identities (Google / email logins) and public.users (name + email profile);
--   * skips anyone who already exists in turon-one (same id or same email), so it is safe to run again;
--   * blanks old one-time tokens (confirmation / reset links from the old site stop working, as they should);
--   * does everything in one transaction: if anything fails, nothing is copied;
--   * removes the dblink extension again at the end.
-- Not copied: applications, participations, debate/volunteer registrations, admin roles, sessions.

create extension if not exists dblink with schema extensions;

select extensions.dblink_connect('old', 'PASTE_OLD_CONNECTION_STRING_HERE');
select extensions.dblink_exec('old', 'set default_transaction_read_only = on');

begin;

-- 1. logins
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at,
  confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at,
  email_change_token_new, email_change, email_change_sent_at, last_sign_in_at,
  raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at,
  phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at,
  email_change_token_current, email_change_confirm_status, banned_until,
  reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous
)
select
  o.instance_id, o.id, o.aud, o.role, o.email, o.encrypted_password, o.email_confirmed_at, o.invited_at,
  '', null, '', null,
  '', '', null, o.last_sign_in_at,
  o.raw_app_meta_data, o.raw_user_meta_data, o.is_super_admin, o.created_at, o.updated_at,
  o.phone, o.phone_confirmed_at, '', '', null,
  '', 0, o.banned_until,
  '', null, o.is_sso_user, null, o.is_anonymous
from extensions.dblink('old', $q$
  select instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at,
         last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at,
         phone, phone_confirmed_at, banned_until, is_sso_user, is_anonymous
  from auth.users where deleted_at is null
$q$) as o (
  instance_id uuid, id uuid, aud varchar, role varchar, email varchar, encrypted_password varchar,
  email_confirmed_at timestamptz, invited_at timestamptz, last_sign_in_at timestamptz,
  raw_app_meta_data jsonb, raw_user_meta_data jsonb, is_super_admin boolean,
  created_at timestamptz, updated_at timestamptz, phone text, phone_confirmed_at timestamptz,
  banned_until timestamptz, is_sso_user boolean, is_anonymous boolean
)
where not exists (select 1 from auth.users u where u.id = o.id)
  and (o.email is null or not exists (select 1 from auth.users u where lower(u.email) = lower(o.email)))
  and (o.phone is null or not exists (select 1 from auth.users u where u.phone = o.phone));

-- 2. how each account signs in (email, Google)
insert into auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
select i.id, i.provider_id, i.user_id, i.identity_data, i.provider, i.last_sign_in_at, i.created_at, i.updated_at
from extensions.dblink('old', $q$
  select id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
  from auth.identities
$q$) as i (id uuid, provider_id text, user_id uuid, identity_data jsonb, provider text,
           last_sign_in_at timestamptz, created_at timestamptz, updated_at timestamptz)
where exists (select 1 from auth.users u where u.id = i.user_id)
on conflict do nothing;

-- 3. profiles (name + email)
insert into public.users (id, email, full_name, created_at, updated_at)
select p.id, p.email, p.full_name, p.created_at, p.updated_at
from extensions.dblink('old', $q$
  select id, email, full_name, created_at, updated_at from public.users
$q$) as p (id uuid, email text, full_name text, created_at timestamptz, updated_at timestamptz)
where exists (select 1 from auth.users u where u.id = p.id)
on conflict do nothing;

commit;

select extensions.dblink_disconnect('old');
drop extension if exists dblink;

-- result: expect about 721 accounts, 733 identities (534 Google + 199 email) and 261 profiles
select (select count(*) from auth.users) as accounts,
       (select count(*) from auth.identities where provider = 'google') as google_logins,
       (select count(*) from auth.identities where provider = 'email') as email_logins,
       (select count(*) from public.users) as profiles;
