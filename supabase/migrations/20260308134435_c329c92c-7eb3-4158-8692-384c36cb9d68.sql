
INSERT INTO storage.buckets (id, name, public) VALUES ('exchange-screenshots', 'exchange-screenshots', true);

CREATE POLICY "Users can upload exchange screenshots"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'exchange-screenshots' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Anyone can view exchange screenshots"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'exchange-screenshots');
