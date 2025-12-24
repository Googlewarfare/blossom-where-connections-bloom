-- Background checks table
CREATE TABLE public.background_checks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'passed', 'failed', 'expired')),
  provider TEXT,
  verification_date TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Trusted contacts for date check-ins
CREATE TABLE public.trusted_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Date check-ins
CREATE TABLE public.date_checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_id UUID REFERENCES matches(id) ON DELETE SET NULL,
  trusted_contact_id UUID NOT NULL REFERENCES trusted_contacts(id) ON DELETE CASCADE,
  date_location TEXT,
  date_time TIMESTAMP WITH TIME ZONE NOT NULL,
  expected_end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'checked_in', 'alert_sent', 'completed', 'cancelled')),
  last_checkin_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.background_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trusted_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.date_checkins ENABLE ROW LEVEL SECURITY;

-- Background checks policies
CREATE POLICY "Users can view their own background check"
  ON public.background_checks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can request background check"
  ON public.background_checks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view others passed background checks"
  ON public.background_checks FOR SELECT
  USING (status = 'passed');

-- Trusted contacts policies
CREATE POLICY "Users can manage their own trusted contacts"
  ON public.trusted_contacts FOR ALL
  USING (auth.uid() = user_id);

-- Date check-ins policies
CREATE POLICY "Users can manage their own date check-ins"
  ON public.date_checkins FOR ALL
  USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_background_checks_updated_at
  BEFORE UPDATE ON public.background_checks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_date_checkins_updated_at
  BEFORE UPDATE ON public.date_checkins
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();