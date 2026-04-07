
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create children table
CREATE TABLE public.children (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT,
  height_cm NUMERIC,
  weight_kg NUMERIC,
  favorite_sport TEXT,
  recommended_sport TEXT,
  skill_level TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own children" ON public.children FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own children" ON public.children FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own children" ON public.children FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own children" ON public.children FOR DELETE USING (auth.uid() = user_id);

-- Create assessment_results table
CREATE TABLE public.assessment_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE NOT NULL,
  answers JSONB,
  recommended_sports JSONB,
  score NUMERIC,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.assessment_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own assessments" ON public.assessment_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own assessments" ON public.assessment_results FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own assessments" ON public.assessment_results FOR DELETE USING (auth.uid() = user_id);

-- Create weekly_progress table
CREATE TABLE public.weekly_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE NOT NULL,
  week_start DATE NOT NULL,
  sport TEXT NOT NULL,
  performance_rating INTEGER,
  hours_practiced NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.weekly_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress" ON public.weekly_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own progress" ON public.weekly_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.weekly_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own progress" ON public.weekly_progress FOR DELETE USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update timestamps trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_children_updated_at BEFORE UPDATE ON public.children FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
