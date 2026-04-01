-- Allow authenticated users to manage onboarding tasks
DROP POLICY IF EXISTS "Authenticated can create onboarding tasks" ON public.onboarding_tasks;
CREATE POLICY "Authenticated can create onboarding tasks"
ON public.onboarding_tasks
FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated can update onboarding tasks" ON public.onboarding_tasks;
CREATE POLICY "Authenticated can update onboarding tasks"
ON public.onboarding_tasks
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to create/update trainings
DROP POLICY IF EXISTS "Authenticated can create trainings" ON public.trainings;
CREATE POLICY "Authenticated can create trainings"
ON public.trainings
FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Authenticated can update trainings" ON public.trainings;
CREATE POLICY "Authenticated can update trainings"
ON public.trainings
FOR UPDATE
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Allow authenticated users to create/update inspections
DROP POLICY IF EXISTS "Authenticated can create inspections" ON public.inspections;
CREATE POLICY "Authenticated can create inspections"
ON public.inspections
FOR INSERT
TO authenticated
WITH CHECK (inspector_id = auth.uid());

DROP POLICY IF EXISTS "Authenticated can update inspections" ON public.inspections;
CREATE POLICY "Authenticated can update inspections"
ON public.inspections
FOR UPDATE
TO authenticated
USING (inspector_id = auth.uid())
WITH CHECK (inspector_id = auth.uid());

-- Allow authenticated users to create/update risks
DROP POLICY IF EXISTS "Authenticated can create risks" ON public.risks;
CREATE POLICY "Authenticated can create risks"
ON public.risks
FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Authenticated can update risks" ON public.risks;
CREATE POLICY "Authenticated can update risks"
ON public.risks
FOR UPDATE
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Allow authenticated users to create/update committee members
DROP POLICY IF EXISTS "Authenticated can create committee members" ON public.committee_members;
CREATE POLICY "Authenticated can create committee members"
ON public.committee_members
FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated can update committee members" ON public.committee_members;
CREATE POLICY "Authenticated can update committee members"
ON public.committee_members
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to create/update meetings
DROP POLICY IF EXISTS "Authenticated can create committee meetings" ON public.committee_meetings;
CREATE POLICY "Authenticated can create committee meetings"
ON public.committee_meetings
FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Authenticated can update committee meetings" ON public.committee_meetings;
CREATE POLICY "Authenticated can update committee meetings"
ON public.committee_meetings
FOR UPDATE
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Allow authenticated users to create/update minutes actions
DROP POLICY IF EXISTS "Authenticated can create minutes actions" ON public.minutes_actions;
CREATE POLICY "Authenticated can create minutes actions"
ON public.minutes_actions
FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated can update minutes actions" ON public.minutes_actions;
CREATE POLICY "Authenticated can update minutes actions"
ON public.minutes_actions
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to manage EPP catalog
DROP POLICY IF EXISTS "Authenticated can create epp catalog" ON public.epp_catalog;
CREATE POLICY "Authenticated can create epp catalog"
ON public.epp_catalog
FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated can update epp catalog" ON public.epp_catalog;
CREATE POLICY "Authenticated can update epp catalog"
ON public.epp_catalog
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated can delete epp catalog" ON public.epp_catalog;
CREATE POLICY "Authenticated can delete epp catalog"
ON public.epp_catalog
FOR DELETE
TO authenticated
USING (true);

-- Allow authenticated users to create/update EPP allocations
DROP POLICY IF EXISTS "Authenticated can create epp allocations" ON public.epp_allocations;
CREATE POLICY "Authenticated can create epp allocations"
ON public.epp_allocations
FOR INSERT
TO authenticated
WITH CHECK (delivered_by = auth.uid());

DROP POLICY IF EXISTS "Authenticated can update epp allocations" ON public.epp_allocations;
CREATE POLICY "Authenticated can update epp allocations"
ON public.epp_allocations
FOR UPDATE
TO authenticated
USING (delivered_by = auth.uid())
WITH CHECK (delivered_by = auth.uid());

-- Allow authenticated users to upload/update documents
DROP POLICY IF EXISTS "Authenticated can upload documents" ON public.documents;
CREATE POLICY "Authenticated can upload documents"
ON public.documents
FOR INSERT
TO authenticated
WITH CHECK (uploaded_by = auth.uid());

DROP POLICY IF EXISTS "Authenticated can update own documents" ON public.documents;
CREATE POLICY "Authenticated can update own documents"
ON public.documents
FOR UPDATE
TO authenticated
USING (uploaded_by = auth.uid())
WITH CHECK (uploaded_by = auth.uid());

-- Allow authenticated users to create/update vacancies
DROP POLICY IF EXISTS "Authenticated can create vacancies" ON public.vacancies;
CREATE POLICY "Authenticated can create vacancies"
ON public.vacancies
FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Authenticated can update own vacancies" ON public.vacancies;
CREATE POLICY "Authenticated can update own vacancies"
ON public.vacancies
FOR UPDATE
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Allow authenticated users to create corrective actions
DROP POLICY IF EXISTS "Authenticated can create corrective actions" ON public.corrective_actions;
CREATE POLICY "Authenticated can create corrective actions"
ON public.corrective_actions
FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

-- Allow authenticated users to create unified actions
DROP POLICY IF EXISTS "Authenticated can create unified actions" ON public.unified_actions;
CREATE POLICY "Authenticated can create unified actions"
ON public.unified_actions
FOR INSERT
TO authenticated
WITH CHECK (assigned_by = auth.uid());