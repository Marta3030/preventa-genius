
-- Allow authenticated users to UPDATE operational tasks
CREATE POLICY "Authenticated can update operational tasks"
ON public.operational_tasks
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
