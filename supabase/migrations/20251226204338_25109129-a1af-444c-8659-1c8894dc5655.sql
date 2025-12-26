-- Continue fixing remaining policies

-- 11. conversations - participants only
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
DROP POLICY IF EXISTS "Anyone can view conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can view own conversations" ON public.conversations;

CREATE POLICY "Users can view own conversations" ON public.conversations
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM matches m 
    WHERE m.id = match_id 
    AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
  )
);

-- 12. messages - participants only
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Anyone can view messages" ON public.messages;
DROP POLICY IF EXISTS "Users can view own messages" ON public.messages;

CREATE POLICY "Users can view own messages" ON public.messages
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversations c
    JOIN matches m ON c.match_id = m.id
    WHERE c.id = conversation_id
    AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
  )
);

-- 13. video_calls - participants only
DROP POLICY IF EXISTS "Users can view their video calls" ON public.video_calls;
DROP POLICY IF EXISTS "Anyone can view video calls" ON public.video_calls;
DROP POLICY IF EXISTS "Users can view own video calls" ON public.video_calls;

CREATE POLICY "Users can view own video calls" ON public.video_calls
FOR SELECT TO authenticated
USING (caller_id = auth.uid() OR recipient_id = auth.uid());

-- 14. notifications - recipient only
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Anyone can view notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;

CREATE POLICY "Users can view own notifications" ON public.notifications
FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- 15. stories - authenticated users only
DROP POLICY IF EXISTS "Anyone can view unexpired stories" ON public.stories;
DROP POLICY IF EXISTS "Users can view stories" ON public.stories;
DROP POLICY IF EXISTS "Authenticated users can view unexpired stories" ON public.stories;

CREATE POLICY "Authenticated users can view unexpired stories" ON public.stories
FOR SELECT TO authenticated
USING (expires_at > now() OR user_id = auth.uid());

-- 16. events - authenticated only
DROP POLICY IF EXISTS "Anyone can view events" ON public.events;
DROP POLICY IF EXISTS "Users can view events" ON public.events;
DROP POLICY IF EXISTS "Authenticated users can view events" ON public.events;

CREATE POLICY "Authenticated users can view events" ON public.events
FOR SELECT TO authenticated
USING (true);

-- 17. background_checks - authenticated only
DROP POLICY IF EXISTS "Anyone can view verified background checks" ON public.background_checks;
DROP POLICY IF EXISTS "Users can view passed background checks" ON public.background_checks;
DROP POLICY IF EXISTS "Authenticated users can view passed checks" ON public.background_checks;

CREATE POLICY "Authenticated users can view passed checks" ON public.background_checks
FOR SELECT TO authenticated
USING (status = 'verified' OR user_id = auth.uid());

-- 18. compatibility_scores - participants only
DROP POLICY IF EXISTS "Users can view their compatibility scores" ON public.compatibility_scores;
DROP POLICY IF EXISTS "Anyone can view scores" ON public.compatibility_scores;
DROP POLICY IF EXISTS "Users can view own compatibility scores" ON public.compatibility_scores;

CREATE POLICY "Users can view own compatibility scores" ON public.compatibility_scores
FOR SELECT TO authenticated
USING (user1_id = auth.uid() OR user2_id = auth.uid());