-- 063 (turon.one only): run after 000 → 062 on a fresh project.
-- Matches the live TuronMUN database's stricter policies and fixes a
-- mutable search_path flagged by the Supabase security advisor.
-- Migration 006 is skipped on fresh projects (see 000_base_tables.sql).
DROP POLICY IF EXISTS "Anyone can view matrix countries" ON public.matrix_countries;
DROP POLICY IF EXISTS "Users can insert their own data" ON public.users;
DROP POLICY IF EXISTS "Users can read their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
