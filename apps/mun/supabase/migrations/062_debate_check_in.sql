-- 062_debate_check_in.sql
-- Check-in at the door for Turon Debate (Admin → Turon Debate → Event day →
-- Check-in), the same way as TuronMUN's check-in:
--   • debate_registrations.checked_in_at / checked_in_by for debaters
--   • admin_users.checked_in_at (already there, migration 028) for judges
-- set_check_in() gains 'debater' and accepts judges, so the registration desk
-- needs no UPDATE rights on the tables.
-- record_debate_history() now counts a check-in as attended (so certificates
-- work for people who came but whose team wasn't scored).

ALTER TABLE public.debate_registrations
  ADD COLUMN IF NOT EXISTS checked_in_at timestamptz,
  ADD COLUMN IF NOT EXISTS checked_in_by uuid REFERENCES public.admin_users(id) ON DELETE SET NULL;

-- The door desk (registration / logistics) sees team labels on the list.
DROP POLICY IF EXISTS "Staff read debate teams" ON public.debate_teams;
CREATE POLICY "Staff read debate teams" ON public.debate_teams FOR SELECT USING (public.is_active_admin());

CREATE OR REPLACE FUNCTION public.set_check_in(p_kind text, p_id uuid, p_checked boolean)
RETURNS timestamptz LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_admin uuid;
  v_at    timestamptz := CASE WHEN p_checked THEN now() ELSE NULL END;
BEGIN
  IF NOT public.is_active_admin() THEN
    RAISE EXCEPTION 'Not allowed' USING ERRCODE = '42501';
  END IF;
  SELECT id INTO v_admin FROM public.admin_users WHERE email = auth.jwt() ->> 'email';

  IF p_kind = 'delegate' THEN
    UPDATE public.applications
      SET checked_in_at = v_at, checked_in_by = CASE WHEN p_checked THEN v_admin END
      WHERE id = p_id;
  ELSIF p_kind = 'chair' THEN
    UPDATE public.admin_users
      SET checked_in_at = v_at, checked_in_by = CASE WHEN p_checked THEN v_admin END
      WHERE id = p_id AND role IN ('chair', 'co_chair', 'judge');
  ELSIF p_kind = 'debater' THEN
    UPDATE public.debate_registrations
      SET checked_in_at = v_at, checked_in_by = CASE WHEN p_checked THEN v_admin END
      WHERE id = p_id AND status = 'approved';
  ELSE
    RAISE EXCEPTION 'Unknown kind %', p_kind;
  END IF;
  RETURN v_at;
END;
$$;
REVOKE ALL ON FUNCTION public.set_check_in(text, uuid, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_check_in(text, uuid, boolean) TO authenticated;

CREATE OR REPLACE FUNCTION public.record_debate_history(p_event text, p_awards jsonb DEFAULT '{}'::jsonb)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_n integer := 0;
  v_k integer;
BEGIN
  IF NOT public.is_academic_staff() THEN
    RAISE EXCEPTION 'Only the SG or Academics can save debate history' USING ERRCODE = '42501';
  END IF;
  IF nullif(trim(p_event), '') IS NULL THEN
    RAISE EXCEPTION 'Event name is required';
  END IF;

  INSERT INTO public.participations (user_id, email, full_name, event, role, committee, award, attended)
  SELECT DISTINCT ON (lower(r.email))
         r.user_id, lower(r.email), r.full_name, trim(p_event), 'debater',
         CASE WHEN t.id IS NOT NULL THEN
           'Team ' || t.label || coalesce(' · ' || nullif(trim(t.name), ''), '') || coalesce(' (' || nullif(trim(t.position), '') || ')', '')
         END,
         nullif(trim(p_awards ->> r.id::text), ''),
         -- Attended = checked in, or their team was scored, or they were in a judged one-on-one.
         CASE WHEN r.checked_in_at IS NOT NULL
                OR EXISTS (SELECT 1 FROM public.debate_scores s WHERE s.team_id = r.team_id)
                OR EXISTS (SELECT 1 FROM public.debate_pairings p JOIN public.debate_pair_votes v ON v.pairing_id = p.id
                            WHERE r.id IN (p.a_id, p.b_id))
              THEN true END
    FROM public.debate_registrations r
    LEFT JOIN public.debate_teams t ON t.id = r.team_id
   WHERE r.status = 'approved'
   ORDER BY lower(r.email), r.created_at DESC
  ON CONFLICT (email, event, role) DO UPDATE
    SET user_id = EXCLUDED.user_id, full_name = EXCLUDED.full_name, committee = EXCLUDED.committee,
        award = EXCLUDED.award, attended = EXCLUDED.attended;
  GET DIAGNOSTICS v_k = ROW_COUNT; v_n := v_n + v_k;

  INSERT INTO public.participations (user_id, email, full_name, event, role, attended)
  SELECT au.id, lower(u.email), coalesce(nullif(trim(u.full_name), ''), u.email), trim(p_event), 'judge',
         CASE WHEN u.checked_in_at IS NOT NULL
                OR EXISTS (SELECT 1 FROM public.debate_scores s WHERE s.judge_id = au.id)
                OR EXISTS (SELECT 1 FROM public.debate_pair_votes v WHERE v.judge_id = au.id)
              THEN true END
    FROM public.admin_users u
    LEFT JOIN auth.users au ON lower(au.email) = lower(u.email)
   WHERE u.role = 'judge' AND u.is_active AND u.email IS NOT NULL
  ON CONFLICT (email, event, role) DO UPDATE
    SET user_id = EXCLUDED.user_id, full_name = EXCLUDED.full_name, attended = EXCLUDED.attended;
  GET DIAGNOSTICS v_k = ROW_COUNT; v_n := v_n + v_k;

  PERFORM public.log_activity('debate_history_saved', 'participation', trim(p_event),
    format('Saved %s to participation history (%s rows)', trim(p_event), v_n));
  RETURN v_n;
END;
$$;
REVOKE ALL ON FUNCTION public.record_debate_history(text, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_debate_history(text, jsonb) TO authenticated;

NOTIFY pgrst, 'reload schema';
