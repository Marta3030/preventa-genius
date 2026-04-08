DROP POLICY IF EXISTS "Admins can upload documents" ON storage.objects;
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');
