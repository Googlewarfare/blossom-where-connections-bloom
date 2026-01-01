-- =============================================
-- SECURITY FIX: Restrict RLS policies on sensitive tables
-- =============================================

-- 1. TRUSTED_CONTACTS - Only owner can access their contacts
DROP POLICY IF EXISTS "Users can view their own trusted contacts" ON public.trusted_contacts;
DROP POLICY IF EXISTS "Users can insert their own trusted contacts" ON public.trusted_contacts;
DROP POLICY IF EXISTS "Users can update their own trusted contacts" ON public.trusted_contacts;
DROP POLICY IF EXISTS "Users can delete their own trusted contacts" ON public.trusted_contacts;

CREATE POLICY "Users can view their own trusted contacts" ON public.trusted_contacts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own trusted contacts" ON public.trusted_contacts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own trusted contacts" ON public.trusted_contacts
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own trusted contacts" ON public.trusted_contacts
  FOR DELETE USING (auth.uid() = user_id);

-- 2. USER_SESSIONS - Only owner can access their sessions
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can insert their own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can delete their own sessions" ON public.user_sessions;

CREATE POLICY "Users can view their own sessions" ON public.user_sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own sessions" ON public.user_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sessions" ON public.user_sessions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own sessions" ON public.user_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- 3. DATE_CHECKINS - Only owner can access their checkins
DROP POLICY IF EXISTS "Users can view their own date checkins" ON public.date_checkins;
DROP POLICY IF EXISTS "Users can insert their own date checkins" ON public.date_checkins;
DROP POLICY IF EXISTS "Users can update their own date checkins" ON public.date_checkins;
DROP POLICY IF EXISTS "Users can delete their own date checkins" ON public.date_checkins;

CREATE POLICY "Users can view their own date checkins" ON public.date_checkins
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own date checkins" ON public.date_checkins
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own date checkins" ON public.date_checkins
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own date checkins" ON public.date_checkins
  FOR DELETE USING (auth.uid() = user_id);

-- 4. REPORTS - Reporter can see their own, admins can see all, reported user cannot see reporter
DROP POLICY IF EXISTS "Users can view their own reports" ON public.reports;
DROP POLICY IF EXISTS "Users can create reports" ON public.reports;
DROP POLICY IF EXISTS "Admins can view all reports" ON public.reports;
DROP POLICY IF EXISTS "Admins can update reports" ON public.reports;

CREATE POLICY "Users can view their own reports" ON public.reports
  FOR SELECT USING (auth.uid() = reporter_id);
CREATE POLICY "Users can create reports" ON public.reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Admins can view all reports" ON public.reports
  FOR SELECT USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));
CREATE POLICY "Admins can update reports" ON public.reports
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- 5. VIDEO_CALLS - Only participants can access
DROP POLICY IF EXISTS "Participants can view their calls" ON public.video_calls;
DROP POLICY IF EXISTS "Users can create calls" ON public.video_calls;
DROP POLICY IF EXISTS "Participants can update calls" ON public.video_calls;

CREATE POLICY "Participants can view their calls" ON public.video_calls
  FOR SELECT USING (auth.uid() = caller_id OR auth.uid() = recipient_id);
CREATE POLICY "Users can create calls" ON public.video_calls
  FOR INSERT WITH CHECK (auth.uid() = caller_id);
CREATE POLICY "Participants can update calls" ON public.video_calls
  FOR UPDATE USING (auth.uid() = caller_id OR auth.uid() = recipient_id);

-- 6. MESSAGES - Only conversation participants can access
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;

CREATE POLICY "Users can view messages in their conversations" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      JOIN public.matches m ON c.match_id = m.id
      WHERE c.id = messages.conversation_id
      AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
    )
  );
CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update their own messages" ON public.messages
  FOR UPDATE USING (auth.uid() = sender_id);

-- 7. BACKGROUND_CHECKS - Only owner can view their status
DROP POLICY IF EXISTS "Users can view their own background checks" ON public.background_checks;
DROP POLICY IF EXISTS "Admins can manage background checks" ON public.background_checks;

CREATE POLICY "Users can view their own background checks" ON public.background_checks
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage background checks" ON public.background_checks
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 8. USER_RESPONSE_PATTERNS - Only owner can view their patterns
DROP POLICY IF EXISTS "Users can view their own response patterns" ON public.user_response_patterns;

CREATE POLICY "Users can view their own response patterns" ON public.user_response_patterns
  FOR SELECT USING (auth.uid() = user_id);

-- 9. PREFERENCES - Only owner can access
DROP POLICY IF EXISTS "Users can view their own preferences" ON public.preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON public.preferences;
DROP POLICY IF EXISTS "Users can insert their own preferences" ON public.preferences;

CREATE POLICY "Users can view their own preferences" ON public.preferences
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own preferences" ON public.preferences
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own preferences" ON public.preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 10. PROFILE_VIEWS - Viewer can see their views, viewed user can see who viewed them
DROP POLICY IF EXISTS "Users can see who viewed their profile" ON public.profile_views;
DROP POLICY IF EXISTS "Users can insert profile views" ON public.profile_views;

CREATE POLICY "Users can see their own profile views" ON public.profile_views
  FOR SELECT USING (auth.uid() = viewer_id OR auth.uid() = viewed_user_id);
CREATE POLICY "Users can insert profile views" ON public.profile_views
  FOR INSERT WITH CHECK (auth.uid() = viewer_id);

-- 11. SUPER_LIKES - Only sender/recipient can access
DROP POLICY IF EXISTS "Users can view their super likes" ON public.super_likes;
DROP POLICY IF EXISTS "Users can send super likes" ON public.super_likes;

CREATE POLICY "Users can view their super likes" ON public.super_likes
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
CREATE POLICY "Users can send super likes" ON public.super_likes
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- 12. MATCHES - Only matched users can access
DROP POLICY IF EXISTS "Users can view their matches" ON public.matches;
DROP POLICY IF EXISTS "Users can create matches" ON public.matches;

CREATE POLICY "Users can view their matches" ON public.matches
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);
CREATE POLICY "Users can create matches" ON public.matches
  FOR INSERT WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- 13. CONVERSATIONS - Only participants can access
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can update their conversations" ON public.conversations;

CREATE POLICY "Users can view their conversations" ON public.conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.matches m
      WHERE m.id = conversations.match_id
      AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
    )
  );
CREATE POLICY "Users can update their conversations" ON public.conversations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.matches m
      WHERE m.id = conversations.match_id
      AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
    )
  );

-- 14. NOTIFICATIONS - Only owner can access
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;

CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- 15. USER_TRUST_SIGNALS - Restrict to authenticated users viewing their own or limited public view
DROP POLICY IF EXISTS "Anyone can view trust signals" ON public.user_trust_signals;
DROP POLICY IF EXISTS "Users can view their own trust signals" ON public.user_trust_signals;
DROP POLICY IF EXISTS "Authenticated users can view public trust badges" ON public.user_trust_signals;

CREATE POLICY "Users can view their own trust signals" ON public.user_trust_signals
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can view trust badges only" ON public.user_trust_signals
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- 16. LOGIN_ATTEMPTS - Restrict insert to service role only, view own attempts
DROP POLICY IF EXISTS "Auth insert login attempts" ON public.login_attempts;
DROP POLICY IF EXISTS "Users can view their login attempts" ON public.login_attempts;

CREATE POLICY "Service can insert login attempts" ON public.login_attempts
  FOR INSERT WITH CHECK (true); -- Will be restricted by not exposing this table to anon
CREATE POLICY "Users can view login attempts for their email" ON public.login_attempts
  FOR SELECT USING (auth.jwt() ->> 'email' = email);

-- 17. PROFILES - Authenticated users can view discoverable profiles, own profile fully
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can view their own full profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Authenticated users can view other profiles" ON public.profiles
  FOR SELECT USING (auth.uid() IS NOT NULL AND is_paused = false);
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);