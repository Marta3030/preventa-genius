import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type AreaType = Database['public']['Enums']['area_type'];

// Alert severity levels
export type AlertSeverity = 'info' | 'warning' | 'error' | 'critical';

// Alert categories
export type AlertCategory = 
  | 'incident'
  | 'training'
  | 'corrective_action'
  | 'contract'
  | 'employee_health'
  | 'inspection'
  | 'document'
  | 'hiring'
  | 'system';

// Escalation levels
export type EscalationLevel = 'area' | 'prevention' | 'rrhh' | 'gerencia';

interface AlertConfig {
  title: string;
  message: string;
  severity: AlertSeverity;
  entityType: AlertCategory;
  entityId?: string;
  targetAreas?: AreaType[];
  targetRoles?: string[];
  expiresInDays?: number;
}

interface EscalationRule {
  condition: (data: Record<string, unknown>) => boolean;
  escalateTo: EscalationLevel[];
  severity: AlertSeverity | ((data: Record<string, unknown>) => AlertSeverity);
  messageTemplate: (data: Record<string, unknown>) => string;
}

// Escalation rules configuration
const ESCALATION_RULES: Record<string, EscalationRule> = {
  // Severe incidents -> immediate escalation to Gerencia
  severe_incident: {
    condition: (data) => ['grave', 'catastrofico'].includes(data.severity as string),
    escalateTo: ['prevention', 'gerencia'],
    severity: 'critical',
    messageTemplate: (data) => 
      `Incidente ${data.severity} reportado en ${data.area}: ${data.title}. Requiere atención inmediata de Gerencia.`,
  },

  // Moderate incidents -> escalate to Prevention
  moderate_incident: {
    condition: (data) => data.severity === 'moderado',
    escalateTo: ['prevention'],
    severity: 'warning',
    messageTemplate: (data) => 
      `Incidente moderado en ${data.area}: ${data.title}. Requiere investigación.`,
  },

  // Expired mandatory training -> block operations, notify RRHH and Gerencia
  training_expired: {
    condition: (data) => data.isLegalRequirement === true && data.daysOverdue as number > 0,
    escalateTo: ['rrhh', 'prevention', 'gerencia'],
    severity: 'critical',
    messageTemplate: (data) => 
      `Capacitación legal "${data.trainingTitle}" vencida hace ${data.daysOverdue} días para ${data.employeeName}. Empleado bloqueado para tareas.`,
  },

  // Training expiring soon -> warning
  training_expiring: {
    condition: (data) => (data.daysUntilExpiry as number) <= 7 && (data.daysUntilExpiry as number) > 0,
    escalateTo: ['prevention'],
    severity: 'warning',
    messageTemplate: (data) => 
      `Capacitación "${data.trainingTitle}" vence en ${data.daysUntilExpiry} días para ${data.employeeName}.`,
  },

  // Overdue corrective actions -> escalate based on days overdue
  corrective_action_overdue: {
    condition: (data) => (data.daysOverdue as number) > 3,
    escalateTo: ['prevention', 'gerencia'],
    severity: 'critical',
    messageTemplate: (data) => 
      `Acción correctiva "${data.title}" vencida hace ${data.daysOverdue} días. Prioridad: ${data.priority}. Escalar a Gerencia.`,
  },

  corrective_action_due_soon: {
    condition: (data) => (data.daysUntilDue as number) <= 3 && (data.daysUntilDue as number) > 0,
    escalateTo: ['prevention'],
    severity: 'warning',
    messageTemplate: (data) => 
      `Acción correctiva "${data.title}" vence en ${data.daysUntilDue} días.`,
  },

  // Contract expiring -> notify RRHH and Gerencia
  contract_expiring: {
    condition: (data) => (data.daysUntilExpiry as number) <= 30,
    escalateTo: ['rrhh', 'gerencia'],
    severity: (data) => (data.daysUntilExpiry as number) <= 7 ? 'critical' : 'warning',
    messageTemplate: (data) => 
      `Contrato de ${data.employeeName} vence en ${data.daysUntilExpiry} días. Requiere renovación.`,
  },

  // Inspection overdue
  inspection_overdue: {
    condition: (data) => (data.daysOverdue as number) > 0,
    escalateTo: ['prevention'],
    severity: 'warning',
    messageTemplate: (data) => 
      `Inspección "${data.title}" programada hace ${data.daysOverdue} días sin completar.`,
  },
};

// Map escalation level to target areas
function getTargetAreas(levels: EscalationLevel[]): AreaType[] {
  const areaMap: Record<EscalationLevel, AreaType[]> = {
    area: [],
    prevention: ['prevencion'],
    rrhh: ['rrhh'],
    gerencia: ['gerencia'],
  };
  
  const areas = new Set<AreaType>();
  levels.forEach(level => {
    areaMap[level].forEach(area => areas.add(area));
  });
  
  return Array.from(areas);
}

/**
 * Create an alert in the system
 */
export async function createAlert(config: AlertConfig): Promise<string | null> {
  const expiresAt = config.expiresInDays 
    ? new Date(Date.now() + config.expiresInDays * 24 * 60 * 60 * 1000).toISOString()
    : null;

  const { data, error } = await supabase
    .from('alerts')
    .insert({
      title: config.title,
      message: config.message,
      severity: config.severity,
      entity_type: config.entityType,
      entity_id: config.entityId,
      target_areas: config.targetAreas,
      expires_at: expiresAt,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating alert:', error);
    return null;
  }

  return data?.id || null;
}

/**
 * Process incident and create appropriate alerts with escalation
 */
export async function processIncidentAlert(incident: {
  id: string;
  title: string;
  severity: string;
  area: string;
  location?: string;
}): Promise<void> {
  const data = { ...incident };

  // Check severe incident rule
  if (ESCALATION_RULES.severe_incident.condition(data)) {
    await createAlert({
      title: `[CRÍTICO] Incidente ${incident.severity} - ${incident.area}`,
      message: ESCALATION_RULES.severe_incident.messageTemplate(data),
      severity: 'critical',
      entityType: 'incident',
      entityId: incident.id,
      targetAreas: getTargetAreas(ESCALATION_RULES.severe_incident.escalateTo),
    });
  }
  // Check moderate incident rule
  else if (ESCALATION_RULES.moderate_incident.condition(data)) {
    await createAlert({
      title: `Incidente moderado - ${incident.area}`,
      message: ESCALATION_RULES.moderate_incident.messageTemplate(data),
      severity: 'warning',
      entityType: 'incident',
      entityId: incident.id,
      targetAreas: getTargetAreas(ESCALATION_RULES.moderate_incident.escalateTo),
    });
  }
}

/**
 * Process training expiration and create alerts
 */
export async function processTrainingAlert(training: {
  id: string;
  trainingTitle: string;
  employeeName: string;
  employeeId: string;
  expiryDate: string;
  isLegalRequirement: boolean;
}): Promise<void> {
  const now = new Date();
  const expiry = new Date(training.expiryDate);
  const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const daysOverdue = daysUntilExpiry < 0 ? Math.abs(daysUntilExpiry) : 0;

  const data = {
    ...training,
    daysUntilExpiry,
    daysOverdue,
  };

  // Check expired training rule
  if (ESCALATION_RULES.training_expired.condition(data)) {
    await createAlert({
      title: `[BLOQUEO] Capacitación legal vencida`,
      message: ESCALATION_RULES.training_expired.messageTemplate(data),
      severity: 'critical',
      entityType: 'training',
      entityId: training.id,
      targetAreas: getTargetAreas(ESCALATION_RULES.training_expired.escalateTo),
    });

    // Block employee for tasks
    await supabase
      .from('employees')
      .update({
        blocked_for_tasks: true,
        blocked_reason: `Capacitación legal "${training.trainingTitle}" vencida`,
      })
      .eq('id', training.employeeId);
  }
  // Check expiring soon rule
  else if (ESCALATION_RULES.training_expiring.condition(data)) {
    await createAlert({
      title: `Capacitación próxima a vencer`,
      message: ESCALATION_RULES.training_expiring.messageTemplate(data),
      severity: 'warning',
      entityType: 'training',
      entityId: training.id,
      targetAreas: getTargetAreas(ESCALATION_RULES.training_expiring.escalateTo),
    });
  }
}

/**
 * Process corrective action status and create alerts
 */
export async function processCorrectiveActionAlert(action: {
  id: string;
  title: string;
  dueDate: string;
  priority: string;
  ownerId: string;
}): Promise<void> {
  const now = new Date();
  const due = new Date(action.dueDate);
  const daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const daysOverdue = daysUntilDue < 0 ? Math.abs(daysUntilDue) : 0;

  const data = {
    ...action,
    daysUntilDue,
    daysOverdue,
  };

  // Check overdue rule
  if (ESCALATION_RULES.corrective_action_overdue.condition(data)) {
    await createAlert({
      title: `[ESCALADO] Acción correctiva vencida`,
      message: ESCALATION_RULES.corrective_action_overdue.messageTemplate(data),
      severity: 'critical',
      entityType: 'corrective_action',
      entityId: action.id,
      targetAreas: getTargetAreas(ESCALATION_RULES.corrective_action_overdue.escalateTo),
    });
  }
  // Check due soon rule
  else if (ESCALATION_RULES.corrective_action_due_soon.condition(data)) {
    await createAlert({
      title: `Acción correctiva próxima a vencer`,
      message: ESCALATION_RULES.corrective_action_due_soon.messageTemplate(data),
      severity: 'warning',
      entityType: 'corrective_action',
      entityId: action.id,
      targetAreas: getTargetAreas(ESCALATION_RULES.corrective_action_due_soon.escalateTo),
    });
  }
}

/**
 * Process contract expiration and create alerts
 */
export async function processContractAlert(contract: {
  id: string;
  employeeName: string;
  employeeId: string;
  endDate: string;
}): Promise<void> {
  const now = new Date();
  const end = new Date(contract.endDate);
  const daysUntilExpiry = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const data = {
    ...contract,
    daysUntilExpiry,
  };

  if (ESCALATION_RULES.contract_expiring.condition(data)) {
    const severity = daysUntilExpiry <= 7 ? 'critical' : 'warning';
    await createAlert({
      title: daysUntilExpiry <= 7 ? `[URGENTE] Contrato por vencer` : `Contrato próximo a vencer`,
      message: ESCALATION_RULES.contract_expiring.messageTemplate(data),
      severity,
      entityType: 'contract',
      entityId: contract.id,
      targetAreas: getTargetAreas(ESCALATION_RULES.contract_expiring.escalateTo),
    });
  }
}

/**
 * Check all pending items and generate alerts (to be called periodically)
 */
export async function runAlertScan(): Promise<{
  trainingsChecked: number;
  actionsChecked: number;
  contractsChecked: number;
  alertsCreated: number;
}> {
  const results = {
    trainingsChecked: 0,
    actionsChecked: 0,
    contractsChecked: 0,
    alertsCreated: 0,
  };

  // Check expiring trainings
  const { data: trainings } = await supabase
    .from('employee_trainings')
    .select(`
      id,
      expiry_date,
      user_id,
      training:trainings(title, is_legal_requirement)
    `)
    .not('expiry_date', 'is', null)
    .eq('status', 'completed');

  if (trainings) {
    for (const t of trainings) {
      if (!t.expiry_date) continue;
      results.trainingsChecked++;
      
      // Get employee name
      const { data: employee } = await supabase
        .from('employees')
        .select('id, name')
        .eq('user_id', t.user_id)
        .single();

      if (employee && t.training) {
        await processTrainingAlert({
          id: t.id,
          trainingTitle: (t.training as { title: string }).title,
          employeeName: employee.name,
          employeeId: employee.id,
          expiryDate: t.expiry_date,
          isLegalRequirement: (t.training as { is_legal_requirement: boolean }).is_legal_requirement || false,
        });
      }
    }
  }

  // Check overdue corrective actions
  const { data: actions } = await supabase
    .from('corrective_actions')
    .select('id, title, due_date, priority, owner_id')
    .eq('status', 'open')
    .lt('due_date', new Date().toISOString());

  if (actions) {
    for (const action of actions) {
      results.actionsChecked++;
      await processCorrectiveActionAlert({
        id: action.id,
        title: action.title,
        dueDate: action.due_date,
        priority: action.priority,
        ownerId: action.owner_id,
      });
    }
  }

  // Check expiring contracts
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const { data: contracts } = await supabase
    .from('contracts')
    .select(`
      id,
      end_date,
      employee_id,
      employee:employees(name)
    `)
    .eq('status', 'active')
    .not('end_date', 'is', null)
    .lte('end_date', thirtyDaysFromNow.toISOString());

  if (contracts) {
    for (const contract of contracts) {
      if (!contract.end_date) continue;
      results.contractsChecked++;
      
      const employeeData = contract.employee as { name: string } | null;
      await processContractAlert({
        id: contract.id,
        employeeName: employeeData?.name || 'Empleado desconocido',
        employeeId: contract.employee_id,
        endDate: contract.end_date,
      });
    }
  }

  return results;
}

/**
 * Get alert statistics for dashboard
 */
export async function getAlertStats(): Promise<{
  critical: number;
  warning: number;
  info: number;
  total: number;
  byModule: Record<string, number>;
}> {
  const { data: alerts } = await supabase
    .from('alerts')
    .select('severity, entity_type')
    .is('dismissed_by', null);

  if (!alerts) {
    return { critical: 0, warning: 0, info: 0, total: 0, byModule: {} };
  }

  const stats = {
    critical: 0,
    warning: 0,
    info: 0,
    total: alerts.length,
    byModule: {} as Record<string, number>,
  };

  for (const alert of alerts) {
    if (alert.severity === 'critical' || alert.severity === 'error') {
      stats.critical++;
    } else if (alert.severity === 'warning') {
      stats.warning++;
    } else {
      stats.info++;
    }

    const module = alert.entity_type || 'system';
    stats.byModule[module] = (stats.byModule[module] || 0) + 1;
  }

  return stats;
}
