-- Allow authenticated users to create employees
CREATE POLICY "Authenticated can create employees"
ON public.employees
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update employees
CREATE POLICY "Authenticated can update employees"
ON public.employees
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to create health records
DROP POLICY IF EXISTS "Admins can manage employee health" ON public.employee_health;
CREATE POLICY "Admins can manage employee health"
ON public.employee_health
FOR ALL
TO public
USING (is_admin(auth.uid()));

CREATE POLICY "Authenticated can create employee health"
ON public.employee_health
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to create contracts
DROP POLICY IF EXISTS "Admins can manage contracts" ON public.contracts;
CREATE POLICY "Admins can manage contracts"
ON public.contracts
FOR ALL
TO public
USING (is_admin(auth.uid()));

CREATE POLICY "Authenticated can create contracts"
ON public.contracts
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to create onboarding tasks
DROP POLICY IF EXISTS "Authenticated can create onboarding tasks" ON public.onboarding_tasks;
CREATE POLICY "Authenticated can create onboarding tasks"
ON public.onboarding_tasks
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update onboarding tasks
DROP POLICY IF EXISTS "Authenticated can update onboarding tasks" ON public.onboarding_tasks;
CREATE POLICY "Authenticated can update onboarding tasks"
ON public.onboarding_tasks
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow reading onboarding tasks
DROP POLICY IF EXISTS "All authenticated can view onboarding tasks" ON public.onboarding_tasks;
CREATE POLICY "All authenticated can view onboarding tasks"
ON public.onboarding_tasks
FOR SELECT
TO authenticated
USING (true);

-- Ensure storage SELECT policy exists for documents bucket
DROP POLICY IF EXISTS "Authenticated can read documents" ON storage.objects;
CREATE POLICY "Authenticated can read documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'documents');