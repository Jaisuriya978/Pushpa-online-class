
-- 1) Restrict EXECUTE on SECURITY DEFINER function
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;

-- 2) Replace always-true INSERT policy on tutor_applications with validation
DROP POLICY IF EXISTS "Anyone can submit an application" ON public.tutor_applications;
CREATE POLICY "Anyone can submit an application"
  ON public.tutor_applications
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(btrim(full_name)) BETWEEN 2 AND 200
    AND length(btrim(email)) BETWEEN 5 AND 320
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND status = 'pending'::application_status
    AND admin_notes IS NULL
  );

-- 3) Restrict tutor-resumes uploads to safe file types
DROP POLICY IF EXISTS "Anyone can upload a resume to tutor-resumes" ON storage.objects;
CREATE POLICY "Anyone can upload a resume to tutor-resumes"
  ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    bucket_id = 'tutor-resumes'
    AND lower(storage.extension(name)) = ANY (ARRAY['pdf','doc','docx'])
    AND length(name) < 255
  );

-- 4) Admin-only UPDATE policy on tutor-resumes bucket
CREATE POLICY "Admins can update tutor resumes"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'tutor-resumes' AND public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (bucket_id = 'tutor-resumes' AND public.has_role(auth.uid(), 'admin'::public.app_role));
