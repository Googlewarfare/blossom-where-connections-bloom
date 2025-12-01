-- Create storage policy for verification photo uploads
CREATE POLICY "Users can upload verification photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'profile-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND name LIKE '%/verification-%'
  );

-- Create storage policy for admins to view verification photos
CREATE POLICY "Authenticated users can view verification photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'profile-photos'
    AND name LIKE '%/verification-%'
  );