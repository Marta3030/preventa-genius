import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ComplianceRule {
  id: string;
  rule_code: string;
  legal_reference: string;
  category: string;
  title: string;
  description: string | null;
  severity: string;
  is_active: boolean;
  auto_block: boolean;
}

export interface ComplianceCheckResult {
  rule_code: string;
  legal_reference: string;
  category: string;
  title: string;
  description: string | null;
  severity: string;
  status: 'compliant' | 'non_compliant' | 'partial' | 'not_applicable';
  details: string;
  count?: number;
  total?: number;
}

export interface PHVACycle {
  phase: 'planificar' | 'hacer' | 'verificar' | 'actuar';
  label: string;
  description: string;
  compliance: number;
  checks: ComplianceCheckResult[];
}

export function useComplianceRules() {
  return useQuery({
    queryKey: ['compliance-rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('compliance_rules')
        .select('*')
        .eq('is_active', true)
        .order('category');
      if (error) throw error;
      return data as ComplianceRule[];
    },
  });
}

export function useComplianceChecks() {
  return useQuery({
    queryKey: ['compliance-checks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('compliance_checks')
        .select('*')
        .order('checked_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });
}

/**
 * Run a full compliance scan against current data
 */
export function useRunComplianceScan() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (): Promise<ComplianceCheckResult[]> => {
      const results: ComplianceCheckResult[] = [];

      // 1. POL_SST_001 - Check for active SST Policy document
      const { count: policyCount } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .in('document_type', ['procedimiento', 'otro']);
      
      results.push({
        rule_code: 'POL_SST_001',
        legal_reference: 'DS44 Art. 3',
        category: 'ds44',
        title: 'Política SST vigente',
        description: 'Debe existir política de SST firmada por gerencia',
        severity: 'critical',
        status: (policyCount || 0) > 0 ? 'compliant' : 'non_compliant',
        details: (policyCount || 0) > 0 
          ? `${policyCount} documentos de política activos`
          : 'No se encontró política SST activa. Suba un documento tipo "Procedimiento" con la política SST.',
        count: policyCount || 0,
      });

      // 2. IPER_001 - Check for active risk assessments
      const { count: riskCount } = await supabase
        .from('risks')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'activo');
      
      results.push({
        rule_code: 'IPER_001',
        legal_reference: 'DS44 Art. 5',
        category: 'ds44',
        title: 'Identificación de peligros actualizada',
        description: 'Debe existir al menos una evaluación IPER activa',
        severity: 'critical',
        status: (riskCount || 0) > 0 ? 'compliant' : 'non_compliant',
        details: (riskCount || 0) > 0
          ? `${riskCount} riesgos identificados activos`
          : 'No hay evaluaciones IPER activas. Agregue riesgos en Prevención > Riesgos.',
        count: riskCount || 0,
      });

      // 3. DAS_001 - Check DAS documents signed
      const { count: totalEmployees } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');
      
      const { count: dasCount } = await supabase
        .from('das_documents')
        .select('*', { count: 'exact', head: true })
        .in('status', ['signed', 'pending']);
      
      const dasCompliance = (totalEmployees || 0) > 0 
        ? ((dasCount || 0) / (totalEmployees || 1)) * 100 
        : 0;
      
      results.push({
        rule_code: 'DAS_001',
        legal_reference: 'Ley 16.744 Art. 21',
        category: 'ley_16744',
        title: 'Derecho a Saber firmado',
        description: 'Todo trabajador debe tener DAS firmado',
        severity: 'critical',
        status: dasCompliance >= 100 ? 'compliant' : dasCompliance >= 50 ? 'partial' : 'non_compliant',
        details: `${dasCount || 0} de ${totalEmployees || 0} trabajadores con DAS`,
        count: dasCount || 0,
        total: totalEmployees || 0,
      });

      // 4. CAP_001 - Training compliance
      const { count: expiredTrainings } = await supabase
        .from('employee_trainings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pendiente');
      
      results.push({
        rule_code: 'CAP_001',
        legal_reference: 'DS44 Art. 8',
        category: 'ds44',
        title: 'Capacitación obligatoria vigente',
        description: 'Las capacitaciones legales deben estar vigentes',
        severity: 'critical',
        status: (expiredTrainings || 0) === 0 ? 'compliant' : 'non_compliant',
        details: (expiredTrainings || 0) === 0
          ? 'Todas las capacitaciones están al día'
          : `${expiredTrainings} capacitaciones pendientes o vencidas`,
        count: expiredTrainings || 0,
      });

      // 5. INC_001 - Incident investigation
      const { count: uninvestigated } = await supabase
        .from('incidents')
        .select('*', { count: 'exact', head: true })
        .eq('investigation_status', 'pendiente');
      
      results.push({
        rule_code: 'INC_001',
        legal_reference: 'DS44 Art. 12',
        category: 'ds44',
        title: 'Investigación de incidentes',
        description: 'Todo incidente debe ser investigado',
        severity: 'high',
        status: (uninvestigated || 0) === 0 ? 'compliant' : 'non_compliant',
        details: (uninvestigated || 0) === 0
          ? 'Todos los incidentes tienen investigación'
          : `${uninvestigated} incidentes sin investigar`,
        count: uninvestigated || 0,
      });

      // 6. SAL_001 - Health exams
      const { count: overdueExams } = await supabase
        .from('employee_health')
        .select('*', { count: 'exact', head: true })
        .lt('next_exam_date', new Date().toISOString().split('T')[0])
        .not('next_exam_date', 'is', null);
      
      results.push({
        rule_code: 'SAL_001',
        legal_reference: 'Ley 16.744 Art. 71',
        category: 'ley_16744',
        title: 'Exámenes de salud ocupacional vigentes',
        description: 'Exámenes de salud al día según exposición',
        severity: 'critical',
        status: (overdueExams || 0) === 0 ? 'compliant' : 'non_compliant',
        details: (overdueExams || 0) === 0
          ? 'Todos los exámenes de salud vigentes'
          : `${overdueExams} exámenes de salud vencidos`,
        count: overdueExams || 0,
      });

      // 7. EPP_001 - EPP delivered
      const { count: pendingEPP } = await supabase
        .from('epp_allocations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending_signature');
      
      results.push({
        rule_code: 'EPP_001',
        legal_reference: 'DS44 Art. 7',
        category: 'ds44',
        title: 'EPP entregado y firmado',
        description: 'EPP con acuse de recibo firmado',
        severity: 'high',
        status: (pendingEPP || 0) === 0 ? 'compliant' : 'partial',
        details: (pendingEPP || 0) === 0
          ? 'Todas las entregas de EPP firmadas'
          : `${pendingEPP} entregas de EPP pendientes de firma`,
        count: pendingEPP || 0,
      });

      // 8. RIOHS_001 - RIOHS registered
      const { count: riohsRegistered } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('document_type', 'riohs')
        .eq('registered_with_dt', true)
        .eq('is_active', true);
      
      results.push({
        rule_code: 'RIOHS_001',
        legal_reference: 'Ley 16.744',
        category: 'ley_16744',
        title: 'RIOHS registrado en DT',
        description: 'Reglamento Interno registrado ante DT',
        severity: 'critical',
        status: (riohsRegistered || 0) > 0 ? 'compliant' : 'non_compliant',
        details: (riohsRegistered || 0) > 0
          ? 'RIOHS registrado ante la Dirección del Trabajo'
          : 'RIOHS no registrado. Registre en Documentos > Registro DT.',
        count: riohsRegistered || 0,
      });

      // 9. COM_001 - Committee active
      const { count: activeMembers } = await supabase
        .from('committee_members')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');
      
      const totalWorkers = totalEmployees || 0;
      const needsCommittee = totalWorkers >= 25;
      
      results.push({
        rule_code: 'COM_001',
        legal_reference: 'DS44 Art. 15',
        category: 'ds44',
        title: 'Comité Paritario constituido',
        description: 'Empresas con 25+ trabajadores requieren Comité',
        severity: 'high',
        status: !needsCommittee ? 'not_applicable' 
          : (activeMembers || 0) >= 6 ? 'compliant' 
          : (activeMembers || 0) > 0 ? 'partial' : 'non_compliant',
        details: !needsCommittee
          ? `${totalWorkers} trabajadores (< 25, no aplica)`
          : `${activeMembers || 0} miembros activos${(activeMembers || 0) < 6 ? ' (mínimo 6 requeridos)' : ''}`,
        count: activeMembers || 0,
        total: 6,
      });

      // 10. DOC_001 - Document control
      const { count: expiredDocs } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .lt('expiry_date', new Date().toISOString().split('T')[0])
        .not('expiry_date', 'is', null);
      
      results.push({
        rule_code: 'DOC_001',
        legal_reference: 'DS44 Art. 18',
        category: 'ds44',
        title: 'Control documental vigente',
        description: 'Documentos del SG-SST vigentes y versionados',
        severity: 'high',
        status: (expiredDocs || 0) === 0 ? 'compliant' : 'non_compliant',
        details: (expiredDocs || 0) === 0
          ? 'Todos los documentos vigentes'
          : `${expiredDocs} documentos vencidos`,
        count: expiredDocs || 0,
      });

      // 11. ACC_001 - Corrective actions
      const { count: overdueActions } = await supabase
        .from('corrective_actions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
        .lt('due_date', new Date().toISOString().split('T')[0]);
      
      results.push({
        rule_code: 'ACC_001',
        legal_reference: 'DS44 Art. 14',
        category: 'ds44',
        title: 'Acciones correctivas implementadas',
        description: 'Sin acciones correctivas vencidas sin cierre',
        severity: 'high',
        status: (overdueActions || 0) === 0 ? 'compliant' : 'non_compliant',
        details: (overdueActions || 0) === 0
          ? 'Todas las acciones correctivas al día'
          : `${overdueActions} acciones correctivas vencidas`,
        count: overdueActions || 0,
      });

      // 12. PART_001 - Worker participation
      const { count: meetings } = await supabase
        .from('committee_meetings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completada');
      
      results.push({
        rule_code: 'PART_001',
        legal_reference: 'OIT 155 Art. 19',
        category: 'oit_155',
        title: 'Participación de trabajadores',
        description: 'Mecanismo de participación activo',
        severity: 'warning',
        status: (meetings || 0) > 0 ? 'compliant' : 'partial',
        details: (meetings || 0) > 0
          ? `${meetings} reuniones de comité realizadas`
          : 'Sin reuniones de comité registradas',
        count: meetings || 0,
      });

      // Save results to compliance_checks table
      for (const result of results) {
        await supabase.from('compliance_checks').insert({
          check_code: result.rule_code,
          legal_reference: result.legal_reference,
          category: result.category,
          title: result.title,
          description: result.details,
          status: result.status,
          severity: result.severity,
          checked_at: new Date().toISOString(),
        });
      }

      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compliance-checks'] });
    },
  });
}

/**
 * Build PHVA cycle data from compliance results
 */
export function buildPHVACycle(results: ComplianceCheckResult[]): PHVACycle[] {
  const planChecks = results.filter(r => ['POL_SST_001', 'IPER_001'].includes(r.rule_code));
  const doChecks = results.filter(r => ['DAS_001', 'CAP_001', 'EPP_001', 'RIOHS_001'].includes(r.rule_code));
  const checkChecks = results.filter(r => ['INC_001', 'SAL_001', 'DOC_001', 'COM_001'].includes(r.rule_code));
  const actChecks = results.filter(r => ['ACC_001', 'PART_001'].includes(r.rule_code));

  const calcCompliance = (checks: ComplianceCheckResult[]) => {
    if (checks.length === 0) return 0;
    const compliant = checks.filter(c => c.status === 'compliant').length;
    const partial = checks.filter(c => c.status === 'partial').length;
    return Math.round(((compliant + partial * 0.5) / checks.length) * 100);
  };

  return [
    {
      phase: 'planificar',
      label: 'PLANIFICAR',
      description: 'Política SST, Identificación de riesgos IPER',
      compliance: calcCompliance(planChecks),
      checks: planChecks,
    },
    {
      phase: 'hacer',
      label: 'HACER',
      description: 'DAS, Capacitaciones, EPP, RIOHS',
      compliance: calcCompliance(doChecks),
      checks: doChecks,
    },
    {
      phase: 'verificar',
      label: 'VERIFICAR',
      description: 'Investigaciones, Salud, Documentos, Comité',
      compliance: calcCompliance(checkChecks),
      checks: checkChecks,
    },
    {
      phase: 'actuar',
      label: 'ACTUAR',
      description: 'Acciones correctivas, Participación',
      compliance: calcCompliance(actChecks),
      checks: actChecks,
    },
  ];
}
