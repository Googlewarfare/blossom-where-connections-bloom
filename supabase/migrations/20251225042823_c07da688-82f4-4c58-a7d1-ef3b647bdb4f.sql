-- Add server-side validation to profile-photos bucket
-- This restricts file uploads to 5MB max and only allows image MIME types
UPDATE storage.buckets
SET 
  file_size_limit = 5242880,  -- 5MB in bytes
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/gif'
  ]
WHERE id = 'profile-photos';

-- Also add validation to chat-media bucket for consistency
UPDATE storage.buckets
SET 
  file_size_limit = 10485760,  -- 10MB in bytes for media
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/gif',
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/webm',
    'audio/ogg',
    'video/mp4',
    'video/webm'
  ]
WHERE id = 'chat-media';