-- Roiders.Club initial schema

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  dob date,
  weight_kg numeric,
  height_cm numeric,
  experience text CHECK (experience IN ('beginner', 'intermediate', 'advanced')),
  units text DEFAULT 'metric' CHECK (units IN ('metric', 'imperial')),
  bloodwork_ref_set text DEFAULT 'uk' CHECK (bloodwork_ref_set IN ('uk', 'us', 'eu')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.compounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  type text NOT NULL,
  half_life_days numeric NOT NULL,
  half_life_label text,
  detection_time text,
  color_hex text,
  default_dose_mg numeric,
  is_oral boolean DEFAULT false,
  notes text
);

CREATE TABLE public.cycles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  start_date date,
  duration_wk int,
  status text DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'complete')),
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.cycle_compounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id uuid NOT NULL REFERENCES public.cycles(id) ON DELETE CASCADE,
  compound_id uuid NOT NULL REFERENCES public.compounds(id),
  dose_mg numeric NOT NULL,
  frequency text NOT NULL CHECK (frequency IN ('daily', 'eod', 'mwf', 'custom')),
  custom_days int[],
  start_week int DEFAULT 1,
  end_week int,
  notes text
);

CREATE TABLE public.dose_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cycle_compound_id uuid NOT NULL REFERENCES public.cycle_compounds(id) ON DELETE CASCADE,
  logged_at timestamptz NOT NULL,
  dose_mg numeric,
  injection_site text CHECK (injection_site IN ('glute_l', 'glute_r', 'quad_l', 'quad_r', 'delt_l', 'delt_r')),
  notes text
);

CREATE TABLE public.bloodwork_panels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  drawn_at date NOT NULL,
  lab_name text,
  cycle_id uuid REFERENCES public.cycles(id) ON DELETE SET NULL,
  notes text
);

CREATE TABLE public.bloodwork_markers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  panel_id uuid NOT NULL REFERENCES public.bloodwork_panels(id) ON DELETE CASCADE,
  marker text NOT NULL,
  value numeric,
  unit text,
  ref_low numeric,
  ref_high numeric,
  flagged boolean GENERATED ALWAYS AS (value < ref_low OR value > ref_high) STORED
);

CREATE TABLE public.health_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  logged_at date NOT NULL,
  weight_kg numeric,
  bp_systolic int,
  bp_diastolic int,
  resting_hr int,
  mood int CHECK (mood BETWEEN 1 AND 5),
  libido int CHECK (libido BETWEEN 1 AND 5),
  sleep_hr numeric,
  notes text
);

-- Profile creation trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cycle_compounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dose_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bloodwork_panels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bloodwork_markers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their profile" ON public.profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Authenticated users can read compounds" ON public.compounds
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users own their cycles" ON public.cycles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users own their cycle compounds" ON public.cycle_compounds
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.cycles c
      WHERE c.id = cycle_compounds.cycle_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users own their dose logs" ON public.dose_logs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users own their bloodwork panels" ON public.bloodwork_panels
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users own their bloodwork markers" ON public.bloodwork_markers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.bloodwork_panels p
      WHERE p.id = bloodwork_markers.panel_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users own their health logs" ON public.health_logs
  FOR ALL USING (auth.uid() = user_id);