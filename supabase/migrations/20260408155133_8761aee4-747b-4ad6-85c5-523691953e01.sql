
-- Allow authenticated users to update is_active on riohs documents (for version rotation)
CREATE POLICY "Authenticated can deactivate riohs documents"
ON public.documents
FOR UPDATE
TO authenticated
USING (document_type = 'riohs')
WITH CHECK (document_type = 'riohs');
