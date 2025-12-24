-- Make profile-photos bucket private to enforce RLS policies
UPDATE storage.buckets 
SET public = false 
WHERE id = 'profile-photos';

-- Also make chat-media bucket private if not already
UPDATE storage.buckets 
SET public = false 
WHERE id = 'chat-media';