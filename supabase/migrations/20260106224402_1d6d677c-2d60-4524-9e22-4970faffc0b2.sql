-- Create contracts table
CREATE TABLE public.contracts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    contract_type TEXT NOT NULL DEFAULT 'indefinido',
    start_date DATE NOT NULL,
    end_date DATE,
    salary NUMERIC,
    document_id UUID REFERENCES public.documents(id),
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create employee_documents table (for tracking required docs per employee)
CREATE TABLE public.employee_documents (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    required BOOLEAN NOT NULL DEFAULT true,
    signed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create employee_health table (occupational exams)
CREATE TABLE public.employee_health (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    exam_type TEXT NOT NULL DEFAULT 'pre-ocupacional',
    exam_date DATE NOT NULL,
    next_exam_date DATE,
    result TEXT,
    notes TEXT,
    document_id UUID REFERENCES public.documents(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create onboarding_tasks table for tracking onboarding progress
CREATE TABLE public.onboarding_tasks (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    task_name TEXT NOT NULL,
    task_type TEXT NOT NULL DEFAULT 'document',
    status TEXT NOT NULL DEFAULT 'pending',
    due_date DATE,
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contracts
CREATE POLICY "Admins can manage contracts" ON public.contracts FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "All authenticated can view contracts" ON public.contracts FOR SELECT USING (true);

-- RLS Policies for employee_documents
CREATE POLICY "Admins can manage employee documents" ON public.employee_documents FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "All authenticated can view employee documents" ON public.employee_documents FOR SELECT USING (true);

-- RLS Policies for employee_health
CREATE POLICY "Admins can manage employee health" ON public.employee_health FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "All authenticated can view employee health" ON public.employee_health FOR SELECT USING (true);

-- RLS Policies for onboarding_tasks
CREATE POLICY "Admins can manage onboarding tasks" ON public.onboarding_tasks FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "All authenticated can view onboarding tasks" ON public.onboarding_tasks FOR SELECT USING (true);

-- Triggers for updated_at
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON public.contracts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_employee_health_updated_at BEFORE UPDATE ON public.employee_health FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to auto-assign mandatory trainings when employee is created
CREATE OR REPLACE FUNCTION public.assign_mandatory_trainings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Insert mandatory legal trainings for new employee
    INSERT INTO public.employee_trainings (user_id, training_id, status)
    SELECT NEW.user_id, t.id, 'pendiente'
    FROM public.trainings t
    WHERE t.is_legal_requirement = true
    AND NEW.user_id IS NOT NULL;
    
    -- Create onboarding tasks for the new employee
    INSERT INTO public.onboarding_tasks (employee_id, task_name, task_type, due_date)
    VALUES 
        (NEW.id, 'Firma de contrato', 'contract', CURRENT_DATE + INTERVAL '3 days'),
        (NEW.id, 'Entrega de RIOHS', 'document', CURRENT_DATE + INTERVAL '1 day'),
        (NEW.id, 'Examen pre-ocupacional', 'health', CURRENT_DATE + INTERVAL '7 days'),
        (NEW.id, 'Inducción Derecho a Saber', 'training', CURRENT_DATE + INTERVAL '5 days'),
        (NEW.id, 'Entrega de EPP', 'epp', CURRENT_DATE + INTERVAL '1 day');
    
    RETURN NEW;
END;
$$;

-- Create trigger for auto-assigning trainings on employee creation
CREATE TRIGGER on_employee_created
    AFTER INSERT ON public.employees
    FOR EACH ROW
    EXECUTE FUNCTION public.assign_mandatory_trainings();