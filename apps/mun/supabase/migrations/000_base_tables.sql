-- 000: base tables that the live TuronMUN database got from the older
-- scripts in supabase/archive/ (before numbered migrations existed).
-- Structure copied from the live schema on 2026-11-26 so a fresh project
-- (e.g. turon.one) can run 000 → 062 in order. Safe to re-run.
-- CHECK constraints are left to the later migrations that own them.

CREATE TABLE IF NOT EXISTS public.committees (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  name text NOT NULL,
  description text,
  topics text[],
  image_url text,
  chair text,
  co_chair text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  total_spots integer DEFAULT 20 NOT NULL,
  countries text[] DEFAULT '{}'::text[] NOT NULL
);

CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  email varchar(255) NOT NULL UNIQUE,
  password_hash varchar(255) DEFAULT 'supabase-auth' NOT NULL,
  role varchar(50) DEFAULT 'admin',
  full_name varchar(255),
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  last_login timestamptz,
  is_active boolean DEFAULT true,
  committee_id uuid REFERENCES public.committees(id) ON DELETE SET NULL,
  checked_in_at timestamptz,
  checked_in_by uuid REFERENCES public.admin_users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.applications (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  application_id text,
  full_name text,
  email text,
  telegram_username text,
  institution text,
  date_of_birth date,
  country text,
  phone text,
  experience text,
  previous_muns text,
  portfolio_link text,
  unique_delegate_trait text,
  issue_interest text,
  committee_preference1 text,
  committee_preference2 text,
  committee_preference3 text,
  fee_agreement boolean,
  discount_eligibility text,
  final_confirmation boolean,
  has_ielts boolean DEFAULT false,
  has_sat boolean DEFAULT false,
  photo_url text,
  ielts_certificate_url text,
  sat_certificate_url text,
  certificate_url text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  motivation text,
  dietary_restrictions text,
  emergency_contact_relation text,
  payment_amount integer,
  notes text,
  ielts_score double precision,
  sat_score integer,
  reviewed_at timestamptz,
  user_id uuid REFERENCES auth.users(id),
  payment_status text DEFAULT 'pending',
  payment_reference text,
  assigned_committee_id uuid REFERENCES public.committees(id) ON DELETE SET NULL,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  full_name text,
  email text,
  phone text,
  subject text,
  message text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  responded_at timestamptz,
  responded_by uuid REFERENCES public.admin_users(id) ON DELETE SET NULL,
  response_message text
);

CREATE TABLE IF NOT EXISTS public.resources (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  category text,
  title text NOT NULL,
  description text,
  file_url text,
  file_type text,
  committee_id uuid REFERENCES public.committees(id),
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.country_assignments (
  id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  application_id uuid REFERENCES public.applications(id) ON DELETE CASCADE,
  committee_id uuid REFERENCES public.committees(id) ON DELETE CASCADE,
  country text NOT NULL,
  country_name text,
  country_code text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  notified_at timestamptz,
  UNIQUE (application_id, committee_id)
);

-- Locked down until later migrations add policies.
ALTER TABLE public.committees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.country_assignments ENABLE ROW LEVEL SECURITY;

-- Trigger helper used by 054 (also from the pre-migration scripts).
CREATE OR REPLACE FUNCTION public.update_updated_at()
 RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Note: 006_fix_admin_users_deletion.sql fails on a fresh database (it refers
-- to resources.uploaded_by and an announcements table that never existed) and
-- was never fully applied on the live database either. Skip it.
