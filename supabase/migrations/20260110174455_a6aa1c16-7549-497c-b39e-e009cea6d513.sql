
-- Function to reassign tasks when employee is blocked
CREATE OR REPLACE FUNCTION public.reassign_tasks_on_employee_block()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if employee was just blocked (blocked_for_tasks changed to true)
  IF NEW.blocked_for_tasks = true AND (OLD.blocked_for_tasks = false OR OLD.blocked_for_tasks IS NULL) THEN
    -- Update all pending and in_progress tasks to unassigned
    UPDATE public.operational_tasks
    SET 
      assigned_to = NULL,
      notes = COALESCE(notes, '') || E'\n[Auto] Tarea desasignada: empleado bloqueado (' || to_char(now(), 'DD/MM/YYYY HH24:MI') || ')',
      updated_at = now()
    WHERE assigned_to = NEW.id
      AND status IN ('pending', 'in_progress');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger that fires when employee is updated
CREATE TRIGGER reassign_tasks_on_block
  AFTER UPDATE ON public.employees
  FOR EACH ROW
  EXECUTE FUNCTION public.reassign_tasks_on_employee_block();
