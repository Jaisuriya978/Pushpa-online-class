
-- Roles enum + user_roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Application status enum
CREATE TYPE public.application_status AS ENUM ('pending', 'approved', 'rejected');

-- Tutor applications table
CREATE TABLE public.tutor_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  country TEXT,
  qualification TEXT,
  subjects TEXT,
  experience TEXT,
  preferred_location TEXT,
  availability TEXT,
  resume_url TEXT,
  status public.application_status NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT INSERT ON public.tutor_applications TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.tutor_applications TO authenticated;
GRANT ALL ON public.tutor_applications TO service_role;

ALTER TABLE public.tutor_applications ENABLE ROW LEVEL SECURITY;

-- Anyone can submit; block dup emails within 60s at app layer.
CREATE POLICY "Anyone can submit an application"
  ON public.tutor_applications FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view applications"
  ON public.tutor_applications FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update applications"
  ON public.tutor_applications FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete applications"
  ON public.tutor_applications FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_tutor_apps_status ON public.tutor_applications(status);
CREATE INDEX idx_tutor_apps_email ON public.tutor_applications(email);
CREATE INDEX idx_tutor_apps_created_at ON public.tutor_applications(created_at DESC);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_tutor_apps_updated_at
  BEFORE UPDATE ON public.tutor_applications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Storage policies for tutor-resumes (private bucket)
CREATE POLICY "Anyone can upload a resume to tutor-resumes"
  ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'tutor-resumes');

CREATE POLICY "Admins can read tutor resumes"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'tutor-resumes' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete tutor resumes"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'tutor-resumes' AND public.has_role(auth.uid(), 'admin'));
