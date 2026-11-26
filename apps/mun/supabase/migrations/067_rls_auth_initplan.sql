-- 067: RLS performance (Supabase advisor "auth_rls_initplan").
-- Wrap auth.uid() / auth.jwt() in (select ...) so Postgres evaluates them
-- once per statement instead of once per row. Logic is unchanged; ALTER POLICY
-- keeps each policy's roles and command. storage.objects policies are left
-- alone (owned by the storage role, not flagged by the advisor).

alter policy "Users can read own admin record" on public.admin_users
  using ((email)::text = ((select auth.jwt()) ->> 'email'));

alter policy "Signed-in users can apply" on public.applications
  with check ((user_id = (select auth.uid())) or is_active_admin());

alter policy "Users can read own application" on public.applications
  using ((user_id = (select auth.uid()))
         or (email = ((select auth.jwt()) ->> 'email'))
         or is_active_admin());

alter policy "Delegates can read their committee announcements" on public.committee_announcements
  using (exists (
    select 1 from public.applications
    where applications.user_id = (select auth.uid())
      and applications.assigned_committee_id = committee_announcements.committee_id));

alter policy "Delegates can read own assignment" on public.country_assignments
  using ((application_id in (
            select applications.id from public.applications
            where applications.user_id = (select auth.uid())
               or applications.email = ((select auth.jwt()) ->> 'email')))
         or is_active_admin());

alter policy "Judges write their own votes" on public.debate_pair_votes
  using (can_see_debate_event() and judge_id = (select auth.uid()))
  with check (can_see_debate_event() and judge_id = (select auth.uid()));

alter policy "Debaters create their registration" on public.debate_registrations
  with check (user_id = (select auth.uid()) and status = 'pending' and admin_notes is null);

alter policy "Debaters edit a pending registration" on public.debate_registrations
  using (user_id = (select auth.uid()) and status = 'pending')
  with check (user_id = (select auth.uid()) and status = 'pending');

alter policy "Debaters read their registration" on public.debate_registrations
  using (user_id = (select auth.uid()));

alter policy "Judges write their own scores" on public.debate_scores
  using (can_see_debate_event() and judge_id = (select auth.uid()))
  with check (can_see_debate_event() and judge_id = (select auth.uid()));

alter policy "Read own participations" on public.participations
  using (user_id = (select auth.uid()));

alter policy "Delegates can manage own papers" on public.position_papers
  using (application_id in (
           select applications.id from public.applications
           where applications.user_id = (select auth.uid())
              or applications.email = ((select auth.jwt()) ->> 'email')))
  with check (application_id in (
           select applications.id from public.applications
           where applications.user_id = (select auth.uid())
              or applications.email = ((select auth.jwt()) ->> 'email')));

alter policy "Users manage own row" on public.users
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

alter policy "Signed-in users can volunteer" on public.volunteer_applications
  with check ((user_id = (select auth.uid())) or is_active_admin());

alter policy "Users can read own volunteer application" on public.volunteer_applications
  using ((user_id = (select auth.uid()))
         or (email = ((select auth.jwt()) ->> 'email'))
         or is_active_admin());
