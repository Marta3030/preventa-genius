-- Add additional fields to documents table for better versioning
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS file_hash TEXT,
ADD COLUMN IF NOT EXISTS effective_date DATE,
ADD COLUMN IF NOT EXISTS notify_all BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS owner_area TEXT;

-- Create document_versions table for complete version history
CREATE TABLE IF NOT EXISTS public.document_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  file_hash TEXT,
  status TEXT DEFAULT 'active',
  uploaded_by UUID NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on document_versions
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;

-- RLS policies for document_versions
CREATE POLICY "Everyone can view document versions" ON public.document_versions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert versions" ON public.document_versions
  FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

-- Create pending_signatures table for signature campaigns
CREATE TABLE IF NOT EXISTS public.pending_signatures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  requested_by UUID NOT NULL,
  signed_at TIMESTAMP WITH TIME ZONE,
  signature_method TEXT,
  signer_ip TEXT,
  reminder_sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(document_id, employee_id)
);

-- Enable RLS on pending_signatures
ALTER TABLE public.pending_signatures ENABLE ROW LEVEL SECURITY;

-- RLS policies for pending_signatures
CREATE POLICY "Users can view their pending signatures" ON public.pending_signatures
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert signatures" ON public.pending_signatures
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own signatures" ON public.pending_signatures
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM employees e WHERE e.id = employee_id AND e.user_id = auth.uid())
  );

-- Create dt_registration_tasks table for DT export tracking
CREATE TABLE IF NOT EXISTS public.dt_registration_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  created_by UUID NOT NULL,
  status TEXT DEFAULT 'pending',
  export_package_url TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  dt_folio TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on dt_registration_tasks
ALTER TABLE public.dt_registration_tasks ENABLE ROW LEVEL SECURITY;

-- RLS policies for dt_registration_tasks
CREATE POLICY "Everyone can view DT tasks" ON public.dt_registration_tasks
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage DT tasks" ON public.dt_registration_tasks
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_document_versions_document_id ON public.document_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_pending_signatures_document_id ON public.pending_signatures(document_id);
CREATE INDEX IF NOT EXISTS idx_pending_signatures_employee_id ON public.pending_signatures(employee_id);
CREATE INDEX IF NOT EXISTS idx_pending_signatures_status ON public.pending_signatures(status);
CREATE INDEX IF NOT EXISTS idx_dt_registration_document_id ON public.dt_registration_tasks(document_id);