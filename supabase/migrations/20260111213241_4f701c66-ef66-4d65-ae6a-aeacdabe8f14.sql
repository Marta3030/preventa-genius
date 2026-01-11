-- =============================================
-- MÓDULO GERENCIA: management_actions
-- =============================================
CREATE TABLE public.management_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  document_id UUID REFERENCES public.documents(id),
  action_type TEXT DEFAULT 'policy_approval', -- policy_approval, document_review, strategic_decision
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  rejected_reason TEXT,
  due_date TIMESTAMPTZ,
  notes TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.management_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all management actions"
  ON public.management_actions FOR ALL
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can view management actions"
  ON public.management_actions FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- =============================================
-- MÓDULO RECLUTAMIENTO: vacancies
-- =============================================
CREATE TABLE public.vacancies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  area TEXT NOT NULL,
  requirements TEXT,
  salary_range TEXT,
  positions_count INTEGER DEFAULT 1,
  published_at TIMESTAMPTZ,
  closes_at TIMESTAMPTZ,
  status TEXT DEFAULT 'draft', -- draft, published, closed, filled
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.vacancies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage vacancies"
  ON public.vacancies FOR ALL
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can view published vacancies"
  ON public.vacancies FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- =============================================
-- MÓDULO RECLUTAMIENTO: candidates
-- =============================================
CREATE TABLE public.candidates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vacancy_id UUID REFERENCES public.vacancies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  rut TEXT,
  cv_url TEXT,
  cover_letter TEXT,
  status TEXT DEFAULT 'received', -- received, screening, interview, offer, hired, rejected
  score INTEGER,
  notes TEXT,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage candidates"
  ON public.candidates FOR ALL
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can view candidates"
  ON public.candidates FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- =============================================
-- MÓDULO RECLUTAMIENTO: recruitment_pipeline
-- =============================================
CREATE TABLE public.recruitment_pipeline (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
  stage TEXT NOT NULL, -- screening, phone_interview, technical_test, interview, offer, hired
  moved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  moved_by UUID NOT NULL,
  notes TEXT,
  evaluation_score INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.recruitment_pipeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage pipeline"
  ON public.recruitment_pipeline FOR ALL
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can view pipeline"
  ON public.recruitment_pipeline FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- =============================================
-- MÓDULO COMITÉ PARITARIO: committee_members
-- =============================================
CREATE TABLE public.committee_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.employees(id),
  user_id UUID,
  name TEXT NOT NULL,
  role TEXT NOT NULL, -- presidente, secretario, representante_empresa, representante_trabajadores
  representation TEXT NOT NULL, -- empresa, trabajadores
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT DEFAULT 'active', -- active, inactive
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.committee_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage committee members"
  ON public.committee_members FOR ALL
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can view committee members"
  ON public.committee_members FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- =============================================
-- MÓDULO COMITÉ PARITARIO: committee_meetings
-- =============================================
CREATE TABLE public.committee_meetings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  meeting_date TIMESTAMPTZ NOT NULL,
  location TEXT,
  agenda TEXT,
  attendees UUID[],
  minutes_doc_id UUID REFERENCES public.documents(id),
  status TEXT DEFAULT 'scheduled', -- scheduled, in_progress, completed, cancelled
  notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.committee_meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage meetings"
  ON public.committee_meetings FOR ALL
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can view meetings"
  ON public.committee_meetings FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- =============================================
-- MÓDULO COMITÉ PARITARIO: minutes_actions
-- =============================================
CREATE TABLE public.minutes_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID REFERENCES public.committee_meetings(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  owner_id UUID,
  owner_name TEXT,
  due_date DATE,
  status TEXT DEFAULT 'pending', -- pending, in_progress, completed, overdue
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.minutes_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage minutes actions"
  ON public.minutes_actions FOR ALL
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can view minutes actions"
  ON public.minutes_actions FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- =============================================
-- Triggers para updated_at
-- =============================================
CREATE TRIGGER update_management_actions_updated_at
  BEFORE UPDATE ON public.management_actions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vacancies_updated_at
  BEFORE UPDATE ON public.vacancies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_candidates_updated_at
  BEFORE UPDATE ON public.candidates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_committee_members_updated_at
  BEFORE UPDATE ON public.committee_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_committee_meetings_updated_at
  BEFORE UPDATE ON public.committee_meetings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_minutes_actions_updated_at
  BEFORE UPDATE ON public.minutes_actions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();