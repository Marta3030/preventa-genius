-- Create function to handle employee blocking when health exam is "no_apto"
CREATE OR REPLACE FUNCTION public.handle_health_exam_result()
RETURNS TRIGGER AS $$
DECLARE
  v_employee_name TEXT;
  v_employee_id UUID;
BEGIN
  -- Only process if result is 'no_apto'
  IF NEW.result = 'no_apto' THEN
    -- Get employee info
    SELECT id, name INTO v_employee_id, v_employee_name
    FROM public.employees
    WHERE id = NEW.employee_id;
    
    -- Block the employee
    UPDATE public.employees
    SET 
      blocked_for_tasks = true,
      blocked_reason = 'Examen de salud: No Apto (' || COALESCE(NEW.exam_type, 'general') || ')',
      updated_at = now()
    WHERE id = NEW.employee_id;
    
    -- Create an alert for this blocking event
    INSERT INTO public.alerts (
      title,
      message,
      severity,
      entity_type,
      entity_id,
      target_roles
    ) VALUES (
      'Empleado bloqueado por resultado No Apto',
      v_employee_name || ' ha sido bloqueado automáticamente debido a resultado No Apto en examen de salud.',
      'critical',
      'employee_health',
      NEW.id,
      ARRAY['admin_prevencion', 'admin_rrhh', 'admin_operaciones']
    );
  END IF;
  
  -- If result changes from 'no_apto' to something else (like 'apto'), unblock
  IF TG_OP = 'UPDATE' AND OLD.result = 'no_apto' AND NEW.result IS DISTINCT FROM 'no_apto' THEN
    -- Check if there are other active 'no_apto' results for this employee
    IF NOT EXISTS (
      SELECT 1 FROM public.employee_health
      WHERE employee_id = NEW.employee_id
        AND id != NEW.id
        AND result = 'no_apto'
    ) THEN
      -- Unblock the employee
      UPDATE public.employees
      SET 
        blocked_for_tasks = false,
        blocked_reason = NULL,
        updated_at = now()
      WHERE id = NEW.employee_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for INSERT
DROP TRIGGER IF EXISTS on_health_exam_result_insert ON public.employee_health;
CREATE TRIGGER on_health_exam_result_insert
  AFTER INSERT ON public.employee_health
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_health_exam_result();

-- Create trigger for UPDATE
DROP TRIGGER IF EXISTS on_health_exam_result_update ON public.employee_health;
CREATE TRIGGER on_health_exam_result_update
  AFTER UPDATE OF result ON public.employee_health
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_health_exam_result();

-- Also create a function to unblock employees manually (for admins)
CREATE OR REPLACE FUNCTION public.unblock_employee(p_employee_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user is admin
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can unblock employees';
  END IF;
  
  UPDATE public.employees
  SET 
    blocked_for_tasks = false,
    blocked_reason = NULL,
    updated_at = now()
  WHERE id = p_employee_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;