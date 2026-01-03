-- =====================================================
-- PREVENTION & SAFETY - Database Schema
-- =====================================================

-- 1. ENUM for user roles
CREATE TYPE public.app_role AS ENUM ('admin_general', 'admin_area', 'assistant');

-- 2. ENUM for risk levels
CREATE TYPE public.risk_level AS ENUM ('bajo', 'medio', 'alto', 'critico');

-- 3. ENUM for incident severity
CREATE TYPE public.incident_severity AS ENUM ('leve', 'moderado', 'grave', 'catastrofico');

-- 4. ENUM for document types
CREATE TYPE public.document_type AS ENUM ('riohs', 'procedimiento', 'acta', 'informe', 'capacitacion', 'otro');

-- 5. ENUM for areas
CREATE TYPE public.area_type AS ENUM ('gerencia', 'rrhh', 'reclutamiento', 'prevencion', 'operaciones', 'comite_paritario');

-- =====================================================
-- USER ROLES TABLE (separate from profiles for security)
-- =====================================================
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'assistant',
    area area_type,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PROFILES TABLE
-- =====================================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RISKS TABLE (Matriz IPER)
-- =====================================================
CREATE TABLE public.risks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    area area_type NOT NULL,
    probability INTEGER NOT NULL CHECK (probability >= 1 AND probability <= 4),
    severity INTEGER NOT NULL CHECK (severity >= 1 AND severity <= 4),
    residual_risk risk_level NOT NULL,
    controls TEXT,
    responsible_user_id UUID REFERENCES auth.users(id),
    status TEXT NOT NULL DEFAULT 'activo',
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.risks ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- INCIDENTS TABLE
-- =====================================================
CREATE TABLE public.incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    area area_type NOT NULL,
    severity incident_severity NOT NULL,
    incident_date TIMESTAMP WITH TIME ZONE NOT NULL,
    days_lost INTEGER DEFAULT 0,
    investigation_status TEXT DEFAULT 'pendiente',
    investigation_notes TEXT,
    corrective_actions TEXT,
    reported_by UUID REFERENCES auth.users(id) NOT NULL,
    assigned_to UUID REFERENCES auth.users(id),
    closed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- DOCUMENTS TABLE
-- =====================================================
CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    document_type document_type NOT NULL,
    file_url TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT true,
    expiry_date DATE,
    registered_with_dt BOOLEAN DEFAULT false,
    uploaded_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- DOCUMENT ACKNOWLEDGEMENTS TABLE
-- =====================================================
CREATE TABLE public.document_acknowledgements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    acknowledged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    ip_address TEXT,
    UNIQUE (document_id, user_id)
);

ALTER TABLE public.document_acknowledgements ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- INSPECTIONS TABLE
-- =====================================================
CREATE TABLE public.inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    area area_type NOT NULL,
    planned_date DATE NOT NULL,
    completed_date DATE,
    status TEXT NOT NULL DEFAULT 'pendiente',
    findings_count INTEGER DEFAULT 0,
    checklist JSONB,
    notes TEXT,
    inspector_id UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- TRAININGS TABLE (Capacitaciones)
-- =====================================================
CREATE TABLE public.trainings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    is_legal_requirement BOOLEAN DEFAULT false,
    duration_hours INTEGER,
    expiry_months INTEGER,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.trainings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- EMPLOYEE TRAININGS TABLE
-- =====================================================
CREATE TABLE public.employee_trainings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    training_id UUID REFERENCES public.trainings(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    expiry_date DATE,
    status TEXT NOT NULL DEFAULT 'pendiente',
    certificate_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (training_id, user_id)
);

ALTER TABLE public.employee_trainings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- SECURITY DEFINER FUNCTION FOR ROLE CHECKING
-- =====================================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    )
$$;

-- Function to check if user is admin (general or area)
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role IN ('admin_general', 'admin_area')
    )
$$;

-- =====================================================
-- TRIGGER FOR CREATING PROFILE ON USER SIGNUP
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, full_name, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
        NEW.email
    );
    -- Default role: assistant
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'assistant');
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- TRIGGER FOR UPDATING updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_risks_updated_at BEFORE UPDATE ON public.risks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON public.incidents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_inspections_updated_at BEFORE UPDATE ON public.inspections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_trainings_updated_at BEFORE UPDATE ON public.trainings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- USER_ROLES: Only admins can manage roles
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admin general can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin_general'));
CREATE POLICY "Users can view their own role" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

-- PROFILES: Users can view all, update own
CREATE POLICY "Authenticated users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- RISKS: Admins full access, assistants read-only
CREATE POLICY "All authenticated can view risks" ON public.risks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage risks" ON public.risks FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- INCIDENTS: Admins full access, assistants can create and view
CREATE POLICY "All authenticated can view incidents" ON public.incidents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can create incidents" ON public.incidents FOR INSERT TO authenticated WITH CHECK (reported_by = auth.uid());
CREATE POLICY "Admins can manage incidents" ON public.incidents FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete incidents" ON public.incidents FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

-- DOCUMENTS: All can view, admins can manage
CREATE POLICY "All authenticated can view documents" ON public.documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage documents" ON public.documents FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- DOCUMENT_ACKNOWLEDGEMENTS: Users can ack, all can view
CREATE POLICY "All authenticated can view acknowledgements" ON public.document_acknowledgements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can acknowledge documents" ON public.document_acknowledgements FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- INSPECTIONS: All can view, admins can manage
CREATE POLICY "All authenticated can view inspections" ON public.inspections FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage inspections" ON public.inspections FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- TRAININGS: All can view, admins can manage
CREATE POLICY "All authenticated can view trainings" ON public.trainings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage trainings" ON public.trainings FOR ALL TO authenticated USING (public.is_admin(auth.uid()));

-- EMPLOYEE_TRAININGS: All can view, admins can manage
CREATE POLICY "All authenticated can view employee trainings" ON public.employee_trainings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage employee trainings" ON public.employee_trainings FOR ALL TO authenticated USING (public.is_admin(auth.uid()));