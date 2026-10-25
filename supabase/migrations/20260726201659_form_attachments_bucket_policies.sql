CREATE POLICY "Anyone can upload form attachments"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'form-attachments');

CREATE POLICY "Public can view form attachments"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'form-attachments');
;
