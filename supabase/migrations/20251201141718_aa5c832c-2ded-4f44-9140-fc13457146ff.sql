-- Make the profile-photos storage bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'profile-photos';