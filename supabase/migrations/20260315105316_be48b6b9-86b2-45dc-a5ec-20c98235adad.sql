-- Add subcategory column to courses table
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS subcategory text;

-- Create course-thumbnails storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-thumbnails', 'course-thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to course-thumbnails
CREATE POLICY "Admin upload course thumbnails"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'course-thumbnails' AND public.has_role(auth.uid(), 'admin'::public.app_role));

-- Allow public read access to course thumbnails
CREATE POLICY "Public read course thumbnails"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'course-thumbnails');