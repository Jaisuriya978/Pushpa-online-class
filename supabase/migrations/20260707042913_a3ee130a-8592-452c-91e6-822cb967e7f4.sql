
CREATE TYPE public.booking_type AS ENUM ('demo', 'paid');
CREATE TYPE public.booking_status AS ENUM ('scheduled', 'completed', 'cancelled');

CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name TEXT NOT NULL,
  parent_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  curriculum TEXT,
  grade TEXT,
  subject TEXT,
  booking_type public.booking_type NOT NULL DEFAULT 'demo',
  plan_name TEXT,
  plan_duration TEXT,
  plan_amount NUMERIC(10,2),
  payment_id TEXT,
  payment_status TEXT,
  meeting_date DATE NOT NULL,
  meeting_time TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  google_event_id TEXT,
  meet_link TEXT,
  tutor_email TEXT,
  status public.booking_status NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX bookings_date_time_idx ON public.bookings (meeting_date, meeting_time) WHERE status = 'scheduled';
CREATE INDEX bookings_created_at_idx ON public.bookings (created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT INSERT ON public.bookings TO anon;
GRANT ALL ON public.bookings TO service_role;

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create bookings"
  ON public.bookings FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(btrim(student_name)) BETWEEN 1 AND 200
    AND length(btrim(email)) BETWEEN 5 AND 320
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    AND status = 'scheduled'
    AND google_event_id IS NULL
    AND meet_link IS NULL
    AND payment_id IS NULL
  );

CREATE POLICY "Admins can view all bookings"
  ON public.bookings FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update bookings"
  ON public.bookings FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete bookings"
  ON public.bookings FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER set_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
