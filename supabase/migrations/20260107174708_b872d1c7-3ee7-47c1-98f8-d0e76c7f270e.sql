-- Function to create health alerts automatically
CREATE OR REPLACE FUNCTION public.create_health_exam_alert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    v_employee_name TEXT;
    v_employee_area area_type;
BEGIN
    -- Get employee info
    SELECT name, area INTO v_employee_name, v_employee_area
    FROM employees WHERE id = NEW.employee_id;

    -- Alert for 'No Apto' result
    IF NEW.result = 'No Apto' THEN
        INSERT INTO alerts (
            title,
            message,
            severity,
            entity_type,
            entity_id,
            target_areas,
            target_roles
        ) VALUES (
            'Resultado No Apto - Examen de Salud',
            format('El empleado %s obtuvo resultado NO APTO en su examen %s del %s. Requiere acción inmediata.',
                v_employee_name,
                NEW.exam_type,
                to_char(NEW.exam_date, 'DD/MM/YYYY')
            ),
            'critical',
            'employee_health',
            NEW.id,
            ARRAY[v_employee_area, 'rrhh'::area_type, 'prevencion'::area_type],
            ARRAY['admin_general'::app_role, 'admin_area'::app_role]
        );
    END IF;

    -- Alert if next_exam_date is within 30 days
    IF NEW.next_exam_date IS NOT NULL AND NEW.next_exam_date <= CURRENT_DATE + INTERVAL '30 days' THEN
        INSERT INTO alerts (
            title,
            message,
            severity,
            entity_type,
            entity_id,
            target_areas,
            target_roles,
            expires_at
        ) VALUES (
            'Examen de Salud Próximo a Vencer',
            format('El empleado %s tiene su próximo examen %s programado para el %s.',
                v_employee_name,
                NEW.exam_type,
                to_char(NEW.next_exam_date, 'DD/MM/YYYY')
            ),
            CASE 
                WHEN NEW.next_exam_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'warning'
                ELSE 'info'
            END,
            'employee_health',
            NEW.id,
            ARRAY[v_employee_area, 'rrhh'::area_type],
            ARRAY['admin_general'::app_role, 'admin_area'::app_role],
            NEW.next_exam_date + INTERVAL '1 day'
        );
    END IF;

    RETURN NEW;
END;
$$;

-- Trigger for health exam alerts
DROP TRIGGER IF EXISTS on_health_exam_change ON employee_health;
CREATE TRIGGER on_health_exam_change
    AFTER INSERT OR UPDATE ON employee_health
    FOR EACH ROW
    EXECUTE FUNCTION create_health_exam_alert();

-- Function to check for expiring health exams (to be called by cron)
CREATE OR REPLACE FUNCTION public.check_expiring_health_exams()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT 
            eh.id,
            eh.employee_id,
            eh.exam_type,
            eh.next_exam_date,
            e.name as employee_name,
            e.area
        FROM employee_health eh
        JOIN employees e ON e.id = eh.employee_id
        WHERE eh.next_exam_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
        AND NOT EXISTS (
            SELECT 1 FROM alerts a 
            WHERE a.entity_id = eh.id 
            AND a.entity_type = 'employee_health'
            AND a.title LIKE 'Examen de Salud Próximo%'
            AND a.created_at > CURRENT_DATE - INTERVAL '7 days'
        )
    LOOP
        INSERT INTO alerts (
            title,
            message,
            severity,
            entity_type,
            entity_id,
            target_areas,
            target_roles,
            expires_at
        ) VALUES (
            'Examen de Salud Próximo a Vencer',
            format('El empleado %s tiene su próximo examen %s programado para el %s.',
                r.employee_name,
                r.exam_type,
                to_char(r.next_exam_date, 'DD/MM/YYYY')
            ),
            CASE 
                WHEN r.next_exam_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'warning'
                ELSE 'info'
            END,
            'employee_health',
            r.id,
            ARRAY[r.area, 'rrhh'::area_type],
            ARRAY['admin_general'::app_role, 'admin_area'::app_role],
            r.next_exam_date + INTERVAL '1 day'
        );
    END LOOP;
END;
$$;