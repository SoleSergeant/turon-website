-- turon.one: trigger functions only ever run as triggers, so nobody needs to call
-- them through the API (/rest/v1/rpc/trg_*). Postgres doesn't check EXECUTE when a
-- trigger fires, so this changes nothing for the site. Clears the Supabase advisor
-- warnings "Public/Signed-in users can execute SECURITY DEFINER function" for trg_*.
do $$
declare f regprocedure;
begin
  for f in
    select p.oid::regprocedure
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.prorettype = 'trigger'::regtype
  loop
    execute format('revoke execute on function %s from public, anon, authenticated', f);
  end loop;
end $$;
