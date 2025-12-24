-- Create table to track video calls
CREATE TABLE public.video_calls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  caller_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'ringing' CHECK (status IN ('ringing', 'active', 'ended', 'declined', 'missed')),
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.video_calls ENABLE ROW LEVEL SECURITY;

-- Users can view calls they're part of
CREATE POLICY "Users can view their calls"
ON video_calls FOR SELECT
USING (auth.uid() = caller_id OR auth.uid() = recipient_id);

-- Users can create calls for their matches
CREATE POLICY "Users can create calls for matches"
ON video_calls FOR INSERT
WITH CHECK (
  auth.uid() = caller_id
  AND EXISTS (
    SELECT 1 FROM matches
    WHERE id = match_id
    AND (user1_id = auth.uid() OR user2_id = auth.uid())
    AND (user1_id = recipient_id OR user2_id = recipient_id)
  )
);

-- Users can update calls they're part of
CREATE POLICY "Users can update their calls"
ON video_calls FOR UPDATE
USING (auth.uid() = caller_id OR auth.uid() = recipient_id);

-- Create table for WebRTC signaling
CREATE TABLE public.call_signals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  call_id UUID NOT NULL REFERENCES video_calls(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL,
  to_user_id UUID NOT NULL,
  signal_type TEXT NOT NULL CHECK (signal_type IN ('offer', 'answer', 'ice-candidate')),
  signal_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.call_signals ENABLE ROW LEVEL SECURITY;

-- Users can view signals meant for them
CREATE POLICY "Users can view their signals"
ON call_signals FOR SELECT
USING (auth.uid() = to_user_id);

-- Users can insert signals
CREATE POLICY "Users can send signals"
ON call_signals FOR INSERT
WITH CHECK (auth.uid() = from_user_id);

-- Enable realtime for signaling
ALTER PUBLICATION supabase_realtime ADD TABLE video_calls;
ALTER PUBLICATION supabase_realtime ADD TABLE call_signals;