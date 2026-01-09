-- Create operational tasks table
CREATE TABLE public.operational_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  area public.area_type NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'pending',
  risk_level TEXT DEFAULT 'bajo',
  assigned_to UUID REFERENCES public.employees(id),
  assigned_by UUID NOT NULL,
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.operational_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "All authenticated can view operational tasks"
  ON public.operational_tasks
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage operational tasks"
  ON public.operational_tasks
  FOR ALL
  USING (is_admin(auth.uid()));

CREATE POLICY "Authenticated can create operational tasks"
  ON public.operational_tasks
  FOR INSERT
  WITH CHECK (assigned_by = auth.uid());

-- Create function to validate task assignment (blocks blocked employees)
CREATE OR REPLACE FUNCTION public.validate_task_assignment()
RETURNS TRIGGER AS $$
DECLARE
  v_employee_blocked BOOLEAN;
  v_employee_name TEXT;
  v_blocked_reason TEXT;
BEGIN
  -- Only check if assigning to someone
  IF NEW.assigned_to IS NOT NULL THEN
    SELECT blocked_for_tasks, name, blocked_reason 
    INTO v_employee_blocked, v_employee_name, v_blocked_reason
    FROM public.employees
    WHERE id = NEW.assigned_to;
    
    IF v_employee_blocked = true THEN
      RAISE EXCEPTION 'No se puede asignar la tarea a %. Motivo: %', 
        v_employee_name, 
        COALESCE(v_blocked_reason, 'Empleado bloqueado');
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger
DROP TRIGGER IF EXISTS validate_task_assignment_trigger ON public.operational_tasks;
CREATE TRIGGER validate_task_assignment_trigger
  BEFORE INSERT OR UPDATE OF assigned_to ON public.operational_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_task_assignment();

-- Create trigger for updated_at
CREATE TRIGGER update_operational_tasks_updated_at
  BEFORE UPDATE ON public.operational_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();