-- ============================================
-- BLOSSOM INTENTIONAL DATING FEATURES
-- ============================================

-- 1. INTENT PROMPTS - Store user's reflective answers during onboarding
CREATE TABLE public.user_intent_prompts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_key TEXT NOT NULL,
  answer TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, prompt_key)
);

-- 2. CONVERSATION STATUS - Track active/archived/closed conversations
ALTER TABLE public.conversations 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'closed')),
ADD COLUMN IF NOT EXISTS closed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS closed_by UUID,
ADD COLUMN IF NOT EXISTS closure_reason TEXT,
ADD COLUMN IF NOT EXISTS closure_message TEXT;

-- 3. GHOSTING TRACKING - Track response patterns
CREATE TABLE public.user_response_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_conversations INTEGER DEFAULT 0,
  ghosted_count INTEGER DEFAULT 0,
  graceful_closures INTEGER DEFAULT 0,
  average_response_time_hours NUMERIC(10,2),
  last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  visibility_score NUMERIC(3,2) DEFAULT 1.00 CHECK (visibility_score >= 0 AND visibility_score <= 1),
  UNIQUE(user_id)
);

-- 4. TRUST SIGNALS - Store computed trust indicators
CREATE TABLE public.user_trust_signals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_completeness INTEGER DEFAULT 0,
  shows_up_consistently BOOLEAN DEFAULT false,
  communicates_with_care BOOLEAN DEFAULT false,
  community_trusted BOOLEAN DEFAULT false,
  verified_identity BOOLEAN DEFAULT false,
  thoughtful_closer BOOLEAN DEFAULT false,
  last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- 5. CLOSURE PROMPTS - Store predefined closure messages
CREATE TABLE public.closure_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL,
  tone TEXT NOT NULL CHECK (tone IN ('kind', 'neutral', 'honest')),
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default closure templates
INSERT INTO public.closure_templates (message, tone, display_order) VALUES
('I don''t feel a romantic connection, but I wish you well on your journey.', 'kind', 1),
('I''m not ready to continue this conversation right now.', 'neutral', 2),
('I''ve enjoyed our conversation, but I don''t think we''re the right match.', 'honest', 3),
('Taking a break from dating at the moment. Best of luck!', 'neutral', 4),
('I appreciate you, but I''m moving in a different direction.', 'kind', 5);

-- Enable RLS on all new tables
ALTER TABLE public.user_intent_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_response_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_trust_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.closure_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_intent_prompts
CREATE POLICY "Users can view their own intent prompts"
  ON public.user_intent_prompts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own intent prompts"
  ON public.user_intent_prompts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own intent prompts"
  ON public.user_intent_prompts FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for user_response_patterns (users see their own, system can read for matching)
CREATE POLICY "Users can view their own response patterns"
  ON public.user_response_patterns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own response patterns"
  ON public.user_response_patterns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own response patterns"
  ON public.user_response_patterns FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for user_trust_signals (public read for display, users manage their own)
CREATE POLICY "Anyone can view trust signals"
  ON public.user_trust_signals FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own trust signals"
  ON public.user_trust_signals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trust signals"
  ON public.user_trust_signals FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for closure_templates (public read)
CREATE POLICY "Anyone can view closure templates"
  ON public.closure_templates FOR SELECT
  USING (is_active = true);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_intent_prompts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_user_intent_prompts_updated_at
  BEFORE UPDATE ON public.user_intent_prompts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_intent_prompts_updated_at();

-- Function to count active conversations for a user
CREATE OR REPLACE FUNCTION public.get_active_conversation_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  count_result INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER INTO count_result
  FROM public.conversations c
  JOIN public.matches m ON c.match_id = m.id
  WHERE (m.user1_id = p_user_id OR m.user2_id = p_user_id)
    AND c.status = 'active';
  RETURN count_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to check if user can start new conversation (max 3 active)
CREATE OR REPLACE FUNCTION public.can_start_new_conversation(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.get_active_conversation_count(p_user_id) < 3;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to calculate and update trust signals
CREATE OR REPLACE FUNCTION public.calculate_trust_signals(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_profile_complete INTEGER;
  v_response_patterns RECORD;
  v_verified BOOLEAN;
  v_photo_count INTEGER;
  v_bio_length INTEGER;
BEGIN
  -- Get profile completeness
  SELECT 
    COALESCE(verified, false),
    CASE WHEN bio IS NOT NULL AND LENGTH(bio) > 50 THEN LENGTH(bio) ELSE 0 END
  INTO v_verified, v_bio_length
  FROM public.profiles WHERE id = p_user_id;
  
  SELECT COUNT(*) INTO v_photo_count FROM public.profile_photos WHERE user_id = p_user_id;
  
  -- Calculate profile completeness (0-100)
  v_profile_complete := LEAST(100, 
    (CASE WHEN v_bio_length > 0 THEN 30 ELSE 0 END) +
    (LEAST(v_photo_count, 3) * 15) +
    (CASE WHEN v_verified THEN 25 ELSE 0 END)
  );
  
  -- Get response patterns
  SELECT * INTO v_response_patterns FROM public.user_response_patterns WHERE user_id = p_user_id;
  
  -- Upsert trust signals
  INSERT INTO public.user_trust_signals (
    user_id,
    profile_completeness,
    shows_up_consistently,
    communicates_with_care,
    community_trusted,
    verified_identity,
    thoughtful_closer,
    last_calculated_at
  ) VALUES (
    p_user_id,
    v_profile_complete,
    COALESCE(v_response_patterns.average_response_time_hours < 24, false),
    COALESCE(v_response_patterns.ghosted_count = 0 OR v_response_patterns.ghosted_count::float / NULLIF(v_response_patterns.total_conversations, 0) < 0.1, true),
    v_profile_complete >= 80 AND COALESCE(v_response_patterns.visibility_score >= 0.8, true),
    v_verified,
    COALESCE(v_response_patterns.graceful_closures > 0, false),
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    profile_completeness = EXCLUDED.profile_completeness,
    shows_up_consistently = EXCLUDED.shows_up_consistently,
    communicates_with_care = EXCLUDED.communicates_with_care,
    community_trusted = EXCLUDED.community_trusted,
    verified_identity = EXCLUDED.verified_identity,
    thoughtful_closer = EXCLUDED.thoughtful_closer,
    last_calculated_at = EXCLUDED.last_calculated_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;