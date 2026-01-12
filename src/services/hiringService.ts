import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type AreaType = Database['public']['Enums']['area_type'];

interface CandidateData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  rut: string | null;
  vacancy_id: string | null;
}

interface VacancyData {
  title: string;
  area: string;
}

interface HiringResult {
  success: boolean;
  employeeId?: string;
  contractId?: string;
  trainingsAssigned?: number;
  onboardingTasksCreated?: number;
  errors: string[];
}

// Map vacancy area to valid area_type enum
function mapAreaToEnum(area: string): AreaType {
  const areaMap: Record<string, AreaType> = {
    'gerencia': 'gerencia',
    'rrhh': 'rrhh',
    'reclutamiento': 'reclutamiento',
    'prevencion': 'prevencion',
    'operaciones': 'operaciones',
    'comite_paritario': 'comite_paritario',
  };
  return areaMap[area.toLowerCase()] || 'operaciones';
}

// Get mandatory pre-onboarding trainings (legal requirements)
async function getMandatoryTrainings(): Promise<{ id: string; title: string }[]> {
  const { data, error } = await supabase
    .from('trainings')
    .select('id, title')
    .eq('is_legal_requirement', true);
  
  if (error) {
    console.error('Error fetching mandatory trainings:', error);
    return [];
  }
  return data || [];
}

// Create onboarding tasks for new employee
async function createOnboardingTasks(employeeId: string): Promise<number> {
  const defaultTasks = [
    { task_name: 'Entrega de credencial', task_type: 'documentation' },
    { task_name: 'Firma de contrato', task_type: 'documentation' },
    { task_name: 'Inducción general', task_type: 'training' },
    { task_name: 'Inducción de seguridad (Derecho a Saber)', task_type: 'training' },
    { task_name: 'Entrega de EPP', task_type: 'equipment' },
    { task_name: 'Configuración de accesos', task_type: 'system' },
    { task_name: 'Examen ocupacional pre-ingreso', task_type: 'health' },
  ];

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7); // 7 days to complete onboarding

  const tasks = defaultTasks.map(task => ({
    employee_id: employeeId,
    task_name: task.task_name,
    task_type: task.task_type,
    status: 'pending',
    due_date: dueDate.toISOString().split('T')[0],
  }));

  const { error } = await supabase
    .from('onboarding_tasks')
    .insert(tasks);

  if (error) {
    console.error('Error creating onboarding tasks:', error);
    return 0;
  }
  
  return tasks.length;
}

// Assign mandatory trainings to new employee
async function assignMandatoryTrainings(userId: string): Promise<number> {
  const trainings = await getMandatoryTrainings();
  
  if (trainings.length === 0) return 0;

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30); // 30 days to complete trainings

  const assignments = trainings.map(training => ({
    training_id: training.id,
    user_id: userId,
    status: 'pending',
    expiry_date: dueDate.toISOString().split('T')[0],
  }));

  const { error } = await supabase
    .from('employee_trainings')
    .insert(assignments);

  if (error) {
    console.error('Error assigning trainings:', error);
    return 0;
  }
  
  return trainings.length;
}

// Create draft contract for new employee
async function createDraftContract(employeeId: string): Promise<string | null> {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 3); // 3-month initial contract

  const { data, error } = await supabase
    .from('contracts')
    .insert({
      employee_id: employeeId,
      contract_type: 'plazo_fijo',
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      status: 'draft',
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating contract:', error);
    return null;
  }
  
  return data?.id || null;
}

// Create alert for hiring event
async function createHiringAlert(employeeName: string, position: string, area: string): Promise<void> {
  await supabase
    .from('alerts')
    .insert({
      title: 'Nuevo empleado contratado',
      message: `${employeeName} ha sido contratado como ${position} en el área de ${area}. Se han asignado tareas de onboarding y capacitaciones obligatorias.`,
      severity: 'info',
      entity_type: 'hiring',
      target_areas: ['rrhh', 'prevencion'] as AreaType[],
    });
}

/**
 * Main hiring workflow - triggered when a candidate is marked as 'hired'
 * 1. Create employee record in RRHH
 * 2. Create draft contract
 * 3. Create onboarding tasks
 * 4. Assign mandatory trainings (Prevención)
 * 5. Create notification alert
 */
export async function executeHiringWorkflow(
  candidate: CandidateData,
  vacancy: VacancyData | null
): Promise<HiringResult> {
  const result: HiringResult = {
    success: false,
    errors: [],
  };

  try {
    // 1. Create employee record
    const area = mapAreaToEnum(vacancy?.area || 'operaciones');
    const position = vacancy?.title || 'Nuevo cargo';

    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .insert({
        name: candidate.name,
        rut: candidate.rut || `PEND-${Date.now()}`, // Temporary RUT if not provided
        position: position,
        area: area,
        status: 'active',
        date_joined: new Date().toISOString().split('T')[0],
      })
      .select('id, user_id')
      .single();

    if (employeeError) {
      result.errors.push(`Error al crear empleado: ${employeeError.message}`);
      return result;
    }

    result.employeeId = employee.id;

    // 2. Create draft contract
    const contractId = await createDraftContract(employee.id);
    if (contractId) {
      result.contractId = contractId;
    } else {
      result.errors.push('No se pudo crear el contrato borrador');
    }

    // 3. Create onboarding tasks
    const onboardingCount = await createOnboardingTasks(employee.id);
    result.onboardingTasksCreated = onboardingCount;

    // 4. Assign mandatory trainings (using employee ID as user_id for now)
    // In a real system, this would use the actual user_id once the user account is created
    const trainingsCount = await assignMandatoryTrainings(employee.id);
    result.trainingsAssigned = trainingsCount;

    // 5. Create alert
    await createHiringAlert(candidate.name, position, area);

    result.success = true;
    return result;
  } catch (error) {
    result.errors.push(`Error inesperado: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return result;
  }
}

/**
 * Hook-compatible wrapper for the hiring workflow
 */
export async function hireCandidate(candidateId: string): Promise<HiringResult> {
  // Fetch candidate data
  const { data: candidate, error: candidateError } = await supabase
    .from('candidates')
    .select('id, name, email, phone, rut, vacancy_id')
    .eq('id', candidateId)
    .single();

  if (candidateError || !candidate) {
    return {
      success: false,
      errors: [`Candidato no encontrado: ${candidateError?.message}`],
    };
  }

  // Fetch vacancy data if available
  let vacancy: VacancyData | null = null;
  if (candidate.vacancy_id) {
    const { data: vacancyData } = await supabase
      .from('vacancies')
      .select('title, area')
      .eq('id', candidate.vacancy_id)
      .single();
    vacancy = vacancyData;
  }

  return executeHiringWorkflow(candidate, vacancy);
}
