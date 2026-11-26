-- 066 (turon.one): Season 8 = the ninth TuronMUN conference (Seasons 1-7 + TuronMUN x CAMU).
-- Makes Season 8 current and updates the homepage "next season" card. Safe to re-run.
insert into public.seasons (number, name, is_current, archived_at) values
  (7, 'Season 7', false, '2026-10-04T17:49:11+00'),
  (8, 'Season 8', true, null)
on conflict (number) do update set name = excluded.name, is_current = excluded.is_current, archived_at = excluded.archived_at;

update public.site_content set value = value || jsonb_build_object(
  'badge_label', 'Next season', 'heading', 'Season 8',
  'subtitle', 'Our ninth conference. Dates and venue will be announced soon.',
  'apply_label', 'Apply'), updated_at = now()
where key = 'next_season';
