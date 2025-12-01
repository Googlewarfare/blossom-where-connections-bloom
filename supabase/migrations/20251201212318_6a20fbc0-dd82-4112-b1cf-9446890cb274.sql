-- Voice Messages (extends message_media)
ALTER TABLE message_media ADD COLUMN IF NOT EXISTS duration_seconds INTEGER;
ALTER TABLE message_media ADD COLUMN IF NOT EXISTS waveform_data JSONB;

-- Daily Questions
CREATE TABLE IF NOT EXISTS daily_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  date DATE NOT NULL UNIQUE,
  category TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_question_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  question_id UUID NOT NULL REFERENCES daily_questions(id) ON DELETE CASCADE,
  answer TEXT NOT NULL,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, question_id)
);

-- Stories
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL,
  caption TEXT,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '24 hours')
);

CREATE TABLE IF NOT EXISTS story_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  viewer_id UUID NOT NULL,
  viewed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(story_id, viewer_id)
);

-- Success Stories
CREATE TABLE IF NOT EXISTS success_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL,
  user2_id UUID NOT NULL,
  story_text TEXT NOT NULL,
  photo_url TEXT,
  meet_date DATE,
  approved BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Events
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  event_date TIMESTAMPTZ NOT NULL,
  event_end_date TIMESTAMPTZ,
  category TEXT NOT NULL,
  max_attendees INTEGER,
  organizer_id UUID NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS event_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT DEFAULT 'interested',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Compatibility Scores (cached)
CREATE TABLE IF NOT EXISTS compatibility_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL,
  user2_id UUID NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  factors JSONB,
  calculated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user1_id, user2_id)
);

-- Enable RLS
ALTER TABLE daily_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_question_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE success_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE compatibility_scores ENABLE ROW LEVEL SECURITY;

-- Daily Questions Policies
CREATE POLICY "Anyone can view active daily questions"
  ON daily_questions FOR SELECT
  USING (is_active = true);

-- User Question Answers Policies
CREATE POLICY "Users can view public answers"
  ON user_question_answers FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create their own answers"
  ON user_question_answers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own answers"
  ON user_question_answers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own answers"
  ON user_question_answers FOR DELETE
  USING (auth.uid() = user_id);

-- Stories Policies
CREATE POLICY "Users can view non-expired stories"
  ON stories FOR SELECT
  USING (expires_at > now());

CREATE POLICY "Users can create their own stories"
  ON stories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stories"
  ON stories FOR DELETE
  USING (auth.uid() = user_id);

-- Story Views Policies
CREATE POLICY "Users can view story views"
  ON story_views FOR SELECT
  USING (true);

CREATE POLICY "Users can create story views"
  ON story_views FOR INSERT
  WITH CHECK (auth.uid() = viewer_id);

-- Success Stories Policies
CREATE POLICY "Anyone can view approved success stories"
  ON success_stories FOR SELECT
  USING (approved = true);

CREATE POLICY "Couples can create their success story"
  ON success_stories FOR INSERT
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Couples can update their success story"
  ON success_stories FOR UPDATE
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Events Policies
CREATE POLICY "Anyone can view events"
  ON events FOR SELECT
  USING (event_date > now());

CREATE POLICY "Users can create events"
  ON events FOR INSERT
  WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can update their events"
  ON events FOR UPDATE
  USING (auth.uid() = organizer_id);

CREATE POLICY "Organizers can delete their events"
  ON events FOR DELETE
  USING (auth.uid() = organizer_id);

-- Event Attendees Policies
CREATE POLICY "Anyone can view event attendees"
  ON event_attendees FOR SELECT
  USING (true);

CREATE POLICY "Users can join events"
  ON event_attendees FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their attendance"
  ON event_attendees FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can leave events"
  ON event_attendees FOR DELETE
  USING (auth.uid() = user_id);

-- Compatibility Scores Policies
CREATE POLICY "Users can view their compatibility scores"
  ON compatibility_scores FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_daily_questions_date ON daily_questions(date);
CREATE INDEX IF NOT EXISTS idx_user_answers_user_id ON user_question_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_expires ON stories(expires_at);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_location ON events(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_compatibility_user1 ON compatibility_scores(user1_id);
CREATE INDEX IF NOT EXISTS idx_compatibility_user2 ON compatibility_scores(user2_id);

-- Triggers for updated_at
CREATE TRIGGER update_success_stories_updated_at
  BEFORE UPDATE ON success_stories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Function to increment story views
CREATE OR REPLACE FUNCTION increment_story_views()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE stories SET views_count = views_count + 1 WHERE id = NEW.story_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER story_view_counter
  AFTER INSERT ON story_views
  FOR EACH ROW
  EXECUTE FUNCTION increment_story_views();