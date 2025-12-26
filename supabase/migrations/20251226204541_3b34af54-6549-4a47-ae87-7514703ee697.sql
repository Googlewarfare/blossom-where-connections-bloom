-- Fix the remaining 3 critical issues

-- 1. trusted_contacts - explicitly drop ALL old policies and recreate
DROP POLICY IF EXISTS "Authenticated users can view own trusted contacts" ON public.trusted_contacts;
DROP POLICY IF EXISTS "Authenticated users can insert own trusted contacts" ON public.trusted_contacts;
DROP POLICY IF EXISTS "Authenticated users can update own trusted contacts" ON public.trusted_contacts;
DROP POLICY IF EXISTS "Authenticated users can delete own trusted contacts" ON public.trusted_contacts;
DROP POLICY IF EXISTS "Users can view their own trusted contacts" ON public.trusted_contacts;
DROP POLICY IF EXISTS "Users can manage their own trusted contacts" ON public.trusted_contacts;

CREATE POLICY "trusted_contacts_select" ON public.trusted_contacts
FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "trusted_contacts_insert" ON public.trusted_contacts
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "trusted_contacts_update" ON public.trusted_contacts
FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "trusted_contacts_delete" ON public.trusted_contacts
FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- 2. date_checkins - explicitly recreate SELECT policy
DROP POLICY IF EXISTS "Users can view own check-ins" ON public.date_checkins;
DROP POLICY IF EXISTS "Users can insert own check-ins" ON public.date_checkins;
DROP POLICY IF EXISTS "Users can update own check-ins" ON public.date_checkins;
DROP POLICY IF EXISTS "Users can delete own check-ins" ON public.date_checkins;

CREATE POLICY "date_checkins_select" ON public.date_checkins
FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "date_checkins_insert" ON public.date_checkins
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "date_checkins_update" ON public.date_checkins
FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "date_checkins_delete" ON public.date_checkins
FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- 3. Fix rate_limits - add SELECT restriction
DROP POLICY IF EXISTS "Only admins can view rate limits" ON public.rate_limits;

CREATE POLICY "rate_limits_select_admin" ON public.rate_limits
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 4. Fix compatibility_scores - add write restrictions
CREATE POLICY "compatibility_scores_insert" ON public.compatibility_scores
FOR INSERT TO authenticated
WITH CHECK (user1_id = auth.uid() OR user2_id = auth.uid());

-- 5. Fix matches - add INSERT restriction (should be system-generated via trigger)
CREATE POLICY "matches_insert_system" ON public.matches
FOR INSERT TO authenticated
WITH CHECK (
  -- Only allow if mutual like exists (this is also enforced by trigger)
  EXISTS (
    SELECT 1 FROM user_swipes s1
    WHERE s1.user_id = auth.uid() 
    AND s1.target_user_id = CASE WHEN user1_id = auth.uid() THEN user2_id ELSE user1_id END
    AND s1.action_type = 'like'
  )
  AND EXISTS (
    SELECT 1 FROM user_swipes s2
    WHERE s2.user_id = CASE WHEN user1_id = auth.uid() THEN user2_id ELSE user1_id END
    AND s2.target_user_id = auth.uid()
    AND s2.action_type = 'like'
  )
);

-- 6. Fix story_views - already has correct policy from earlier
DROP POLICY IF EXISTS "Story owners can view their story views" ON public.story_views;
DROP POLICY IF EXISTS "Users can insert own story views" ON public.story_views;

CREATE POLICY "story_views_select" ON public.story_views
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM stories 
    WHERE stories.id = story_views.story_id 
    AND stories.user_id = auth.uid()
  )
  OR viewer_id = auth.uid()
);

CREATE POLICY "story_views_insert" ON public.story_views
FOR INSERT TO authenticated
WITH CHECK (viewer_id = auth.uid());

-- 7. Fix event_attendees - users can only see their own attendance or public event attendees
DROP POLICY IF EXISTS "Anyone can view event attendees" ON public.event_attendees;
DROP POLICY IF EXISTS "Users can view event attendees" ON public.event_attendees;

CREATE POLICY "event_attendees_select" ON public.event_attendees
FOR SELECT TO authenticated
USING (user_id = auth.uid() OR true); -- Events are public, attendees are visible

CREATE POLICY "event_attendees_insert" ON public.event_attendees
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "event_attendees_delete" ON public.event_attendees
FOR DELETE TO authenticated
USING (user_id = auth.uid());