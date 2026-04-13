import { useIsMobile } from '@/hooks/use-mobile';
import { useState, useRef, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { UserMenu } from '@/components/layout/UserMenu';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useCompanySettings, useSaveCompanySetting } from '@/hooks/useCompanySettings';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Settings as SettingsIcon,
  Building2,
  Users,
  Shield,
  Bell,
  Database,
  Lock,
  Globe,
  FileText,
  Mail,
  Palette,
  Key,
  Clock,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Bot,
  Cpu,
} from 'lucide-react';

function AISettingsTab() {
  const { data: settings } = useCompanySettings();
  const saveSetting = useSaveCompanySetting();
  const [provider, setProvider] = useState(settings?.ai_provider || 'groq');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState(settings?.ai_model || '');

  const handleSaveProvider = async () => {
    try {
      await saveSetting.mutateAsync({ key: 'ai_provider', value: provider });
      if (apiKey) {
        await saveSetting.mutateAsync({ key: `${provider}_api_key`, value: apiKey });
      }
      if (model) {
        await saveSetting.mutateAsync({ key: 'ai_model', value: model });
      }
      toast.success('Configuración de IA guardada');
      setApiKey('');
    } catch {
      toast.error('Error al guardar configuración');
    }
  };

  const providers = [
    { value: 'groq', label: 'Groq', models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'] },
    { value: 'openai', label: 'OpenAI', models: ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'] },
    { value: 'anthropic', label: 'Anthropic', models: ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307'] },
  ];

  const selectedProviderConfig = providers.find(p => p.value === provider);
  const hasKey = !!settings?.[`${provider}_api_key`];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Asistente IA - Configuración
          </CardTitle>
          <CardDescription>
            Configure su proveedor de IA para el chatbot de SST integrado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Proveedor de IA</Label>
              <Select value={provider} onValueChange={setProvider}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {providers.map(p => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Modelo</Label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Modelo por defecto" />
                </SelectTrigger>
                <SelectContent>
                  {selectedProviderConfig?.models.map(m => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>API Key de {selectedProviderConfig?.label}</Label>
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder={hasKey ? '••••••••••••••••' : `Ingrese su ${selectedProviderConfig?.label} API Key`}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <Button onClick={handleSaveProvider} disabled={saveSetting.isPending}>
                {saveSetting.isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              </Button>
            </div>
            {hasKey && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                API Key configurada
              </p>
            )}
          </div>

          <Separator />

          <div className="rounded-lg bg-muted/50 p-4 space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              ¿Dónde obtener las API Keys?
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• <strong>Groq:</strong> console.groq.com (gratis con límites generosos)</li>
              <li>• <strong>OpenAI:</strong> platform.openai.com/api-keys</li>
              <li>• <strong>Anthropic:</strong> console.anthropic.com</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

export default function Settings() {
  const isMobile = useIsMobile();
  const { user, profile, isAdmin } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const { data: compSettings } = useCompanySettings();
  const saveSetting = useSaveCompanySetting();
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains('dark'));
  const [logoUrl, setLogoUrl] = useState('');
  const [logoUploading, setLogoUploading] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Profile editing state
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    phone: '',
  });
  const [profileSaving, setProfileSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setProfileForm({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
      });
    }
  }, [profile]);

  // Load company settings from DB
  useEffect(() => {
    if (compSettings) {
      setCompanySettings(prev => ({
        name: compSettings.company_name || prev.name,
        rut: compSettings.company_rut || prev.rut,
        address: compSettings.company_address || prev.address,
        phone: compSettings.company_phone || prev.phone,
        email: compSettings.company_email || prev.email,
        website: compSettings.company_website || prev.website,
        industry: compSettings.company_industry || prev.industry,
      }));
    }
  }, [compSettings]);

  // Company settings state
  const [companySettings, setCompanySettings] = useState({
    name: '',
    rut: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    industry: 'construccion',
  });

  // Insurance settings state
  const [insuranceSettings, setInsuranceSettings] = useState({
    administrator: 'achs',
    policyNumber: '123456789',
    expiryDate: '2026-12-31',
  });

  // Notification settings state
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    incidentNotifications: true,
    documentReminders: true,
    trainingReminders: true,
    dailyDigest: false,
    weeklyReport: true,
  });

  // Security settings state
  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    sessionTimeout: '30',
    passwordExpiry: '90',
    ipWhitelist: false,
  });

  const handleSaveProfile = async () => {
    if (!user) return;
    setProfileSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileForm.full_name,
          phone: profileForm.phone,
        })
        .eq('user_id', user.id);
      if (error) throw error;
      toast.success('Perfil actualizado correctamente');
    } catch (err: any) {
      toast.error('Error al actualizar perfil: ' + err.message);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const settingsToSave = [
        { key: 'company_name', value: companySettings.name },
        { key: 'company_rut', value: companySettings.rut },
        { key: 'company_address', value: companySettings.address },
        { key: 'company_phone', value: companySettings.phone },
        { key: 'company_email', value: companySettings.email },
        { key: 'company_website', value: companySettings.website },
        { key: 'company_industry', value: companySettings.industry },
      ];
      for (const s of settingsToSave) {
        await saveSetting.mutateAsync(s);
      }
      toast.success('Configuración guardada correctamente');
    } catch (err: any) {
      toast.error('Error al guardar: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const insuranceAdministrators = [
    { value: 'achs', label: 'ACHS - Asociación Chilena de Seguridad' },
    { value: 'mutual', label: 'Mutual de Seguridad CChC' },
    { value: 'ist', label: 'IST - Instituto de Seguridad del Trabajo' },
    { value: 'isl', label: 'ISL - Instituto de Seguridad Laboral' },
  ];

  const industries = [
    { value: 'construccion', label: 'Construcción' },
    { value: 'mineria', label: 'Minería' },
    { value: 'manufactura', label: 'Manufactura' },
    { value: 'transporte', label: 'Transporte' },
    { value: 'comercio', label: 'Comercio' },
    { value: 'servicios', label: 'Servicios' },
    { value: 'salud', label: 'Salud' },
    { value: 'educacion', label: 'Educación' },
    { value: 'otro', label: 'Otro' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className={isMobile ? "pl-0 pt-14" : "pl-64 transition-all duration-300"}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <SettingsIcon className="h-7 w-7 text-primary" />
                Configuración
              </h1>
              <p className="text-sm text-muted-foreground">
                Administración del sistema y preferencias
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Guardar Cambios
              </Button>
              <UserMenu />
            </div>
          </div>
        </header>

        <div className="p-6">
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full max-w-4xl grid-cols-7">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Perfil</span>
              </TabsTrigger>
              <TabsTrigger value="company" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span className="hidden sm:inline">Empresa</span>
              </TabsTrigger>
              <TabsTrigger value="insurance" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Seguro</span>
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                <span className="hidden sm:inline">IA</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Alertas</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span className="hidden sm:inline">Seguridad</span>
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                <span className="hidden sm:inline">Sistema</span>
              </TabsTrigger>
            </TabsList>

            {/* Perfil de Usuario */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Mi Perfil
                  </CardTitle>
                  <CardDescription>
                    Datos de tu cuenta de usuario
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Nombre Completo</Label>
                      <Input
                        value={profileForm.full_name}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, full_name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        value={profile?.email || user?.email || ''}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">El email no se puede cambiar</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Teléfono</Label>
                      <Input
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+56 9 1234 5678"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Rol</Label>
                      <Input
                        value={
                          profile ? (
                            (() => { 
                              const roleMap: Record<string, string> = {
                                admin_general: 'Administrador General',
                                admin_area: 'Administrador de Área',
                                assistant: 'Asistente',
                              };
                              return roleMap[(profile as any)?.role] || 'Asistente';
                            })()
                          ) : 'Cargando...'
                        }
                        disabled
                        className="bg-muted"
                      />
                    </div>
                  </div>
                  <Button onClick={handleSaveProfile} disabled={profileSaving}>
                    {profileSaving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Guardar Perfil
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Empresa */}
            <TabsContent value="company" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Información de la Empresa
                  </CardTitle>
                  <CardDescription>
                    Datos generales de la organización
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="company-name">Razón Social</Label>
                      <Input
                        id="company-name"
                        value={companySettings.name}
                        onChange={(e) => setCompanySettings({ ...companySettings, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company-rut">RUT Empresa</Label>
                      <Input
                        id="company-rut"
                        value={companySettings.rut}
                        onChange={(e) => setCompanySettings({ ...companySettings, rut: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="company-address">Dirección</Label>
                      <Input
                        id="company-address"
                        value={companySettings.address}
                        onChange={(e) => setCompanySettings({ ...companySettings, address: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company-phone">Teléfono</Label>
                      <Input
                        id="company-phone"
                        value={companySettings.phone}
                        onChange={(e) => setCompanySettings({ ...companySettings, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company-email">Email</Label>
                      <Input
                        id="company-email"
                        type="email"
                        value={companySettings.email}
                        onChange={(e) => setCompanySettings({ ...companySettings, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company-website">Sitio Web</Label>
                      <Input
                        id="company-website"
                        value={companySettings.website}
                        onChange={(e) => setCompanySettings({ ...companySettings, website: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company-industry">Industria</Label>
                      <Select
                        value={companySettings.industry}
                        onValueChange={(v) => setCompanySettings({ ...companySettings, industry: v })}
                      >
                        <SelectTrigger id="company-industry">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {industries.map((ind) => (
                            <SelectItem key={ind.value} value={ind.value}>
                              {ind.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Seguro Ley 16.744 */}
            <TabsContent value="insurance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Organismo Administrador del Seguro
                  </CardTitle>
                  <CardDescription>
                    Configuración del seguro obligatorio Ley 16.744
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="insurance-admin">Mutualidad o ISL</Label>
                      <Select
                        value={insuranceSettings.administrator}
                        onValueChange={(v) => setInsuranceSettings({ ...insuranceSettings, administrator: v })}
                      >
                        <SelectTrigger id="insurance-admin">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {insuranceAdministrators.map((admin) => (
                            <SelectItem key={admin.value} value={admin.value}>
                              {admin.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="insurance-policy">N° de Póliza / Afiliación</Label>
                      <Input
                        id="insurance-policy"
                        value={insuranceSettings.policyNumber}
                        onChange={(e) => setInsuranceSettings({ ...insuranceSettings, policyNumber: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="insurance-expiry">Vigencia hasta</Label>
                      <Input
                        id="insurance-expiry"
                        type="date"
                        value={insuranceSettings.expiryDate}
                        onChange={(e) => setInsuranceSettings({ ...insuranceSettings, expiryDate: e.target.value })}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="rounded-lg bg-muted/50 p-4">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Documentos requeridos
                    </h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                        Certificado de afiliación vigente
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                        Tasa de cotización adicional
                      </li>
                      <li className="flex items-center gap-2">
                        <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                        Estadísticas de siniestralidad (pendiente)
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* SEREMI registration moved to Prevention module */}
            </TabsContent>

            {/* Integraciones IA */}
            <TabsContent value="ai" className="space-y-6">
              <AISettingsTab />
            </TabsContent>

            {/* Notificaciones */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Preferencias de Notificaciones
                  </CardTitle>
                  <CardDescription>
                    Configure cómo y cuándo recibir alertas del sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Alertas por email</Label>
                        <p className="text-sm text-muted-foreground">
                          Recibir notificaciones importantes por correo
                        </p>
                      </div>
                      <Switch
                        checked={notifications.emailAlerts}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, emailAlerts: checked })}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Notificaciones de incidentes</Label>
                        <p className="text-sm text-muted-foreground">
                          Alertas inmediatas cuando se reporta un incidente
                        </p>
                      </div>
                      <Switch
                        checked={notifications.incidentNotifications}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, incidentNotifications: checked })}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Recordatorios de documentos</Label>
                        <p className="text-sm text-muted-foreground">
                          Alertas de vencimiento de documentos y firmas pendientes
                        </p>
                      </div>
                      <Switch
                        checked={notifications.documentReminders}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, documentReminders: checked })}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Recordatorios de capacitaciones</Label>
                        <p className="text-sm text-muted-foreground">
                          Alertas de cursos pendientes y vencimientos
                        </p>
                      </div>
                      <Switch
                        checked={notifications.trainingReminders}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, trainingReminders: checked })}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Resumen diario</Label>
                        <p className="text-sm text-muted-foreground">
                          Recibir un email con el resumen del día
                        </p>
                      </div>
                      <Switch
                        checked={notifications.dailyDigest}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, dailyDigest: checked })}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Reporte semanal</Label>
                        <p className="text-sm text-muted-foreground">
                          Resumen semanal de KPIs y estadísticas
                        </p>
                      </div>
                      <Switch
                        checked={notifications.weeklyReport}
                        onCheckedChange={(checked) => setNotifications({ ...notifications, weeklyReport: checked })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Seguridad */}
            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Configuración de Seguridad
                  </CardTitle>
                  <CardDescription>
                    Políticas de acceso y autenticación
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Autenticación de dos factores</Label>
                        <p className="text-sm text-muted-foreground">
                          Requerir código adicional al iniciar sesión
                        </p>
                      </div>
                      <Switch
                        checked={security.twoFactorEnabled}
                        onCheckedChange={(checked) => setSecurity({ ...security, twoFactorEnabled: checked })}
                      />
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="session-timeout">Tiempo de sesión inactiva (minutos)</Label>
                        <Select
                          value={security.sessionTimeout}
                          onValueChange={(v) => setSecurity({ ...security, sessionTimeout: v })}
                        >
                          <SelectTrigger id="session-timeout">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 minutos</SelectItem>
                            <SelectItem value="30">30 minutos</SelectItem>
                            <SelectItem value="60">1 hora</SelectItem>
                            <SelectItem value="120">2 horas</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password-expiry">Expiración de contraseña (días)</Label>
                        <Select
                          value={security.passwordExpiry}
                          onValueChange={(v) => setSecurity({ ...security, passwordExpiry: v })}
                        >
                          <SelectTrigger id="password-expiry">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="30">30 días</SelectItem>
                            <SelectItem value="60">60 días</SelectItem>
                            <SelectItem value="90">90 días</SelectItem>
                            <SelectItem value="180">180 días</SelectItem>
                            <SelectItem value="never">Nunca</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Lista blanca de IPs</Label>
                        <p className="text-sm text-muted-foreground">
                          Restringir acceso solo a IPs autorizadas
                        </p>
                      </div>
                      <Switch
                        checked={security.ipWhitelist}
                        onCheckedChange={(checked) => setSecurity({ ...security, ipWhitelist: checked })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Claves API
                  </CardTitle>
                  <CardDescription>
                    Gestión de acceso programático al sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg bg-muted/50 p-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      No hay claves API configuradas
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Generar nueva clave
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sistema */}
            <TabsContent value="system" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Información del Sistema
                  </CardTitle>
                  <CardDescription>
                    Estado y configuración técnica
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">Versión</p>
                      <p className="font-medium">1.0.0</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">Entorno</p>
                      <Badge variant="outline">Producción</Badge>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">Base de datos</p>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        <span className="font-medium">Conectada</span>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">Almacenamiento</p>
                      <p className="font-medium">2.5 GB / 10 GB</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Personalización
                  </CardTitle>
                  <CardDescription>
                    Apariencia y branding
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Tema oscuro</Label>
                      <p className="text-sm text-muted-foreground">
                        Usar colores oscuros en la interfaz
                      </p>
                    </div>
                    <Switch
                      checked={darkMode}
                      onCheckedChange={(checked) => {
                        setDarkMode(checked);
                        if (checked) {
                          document.documentElement.classList.add('dark');
                          localStorage.setItem('theme', 'dark');
                        } else {
                          document.documentElement.classList.remove('dark');
                          localStorage.setItem('theme', 'light');
                        }
                        toast.success(checked ? 'Tema oscuro activado' : 'Tema claro activado');
                      }}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Logo de la empresa</Label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                        {(logoUrl || compSettings?.company_logo) ? (
                          <img src={logoUrl || compSettings?.company_logo} alt="Logo" className="w-full h-full object-contain" />
                        ) : (
                          <Building2 className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <div className="space-y-2">
                        <input
                          ref={logoInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file || !user) return;
                            setLogoUploading(true);
                            try {
                              const fileName = `logos/${user.id}_${Date.now()}_${file.name}`;
                              const { error: uploadError } = await supabase.storage
                                .from('documents')
                                .upload(fileName, file, { upsert: false });
                              if (uploadError) throw uploadError;
                              const { data: urlData } = supabase.storage.from('documents').getPublicUrl(fileName);
                              const url = urlData.publicUrl;
                              await saveSetting.mutateAsync({ key: 'company_logo', value: url });
                              setLogoUrl(url);
                              toast.success('Logo actualizado correctamente');
                            } catch (err: any) {
                              toast.error('Error al subir logo: ' + err.message);
                            } finally {
                              setLogoUploading(false);
                            }
                          }}
                        />
                        <Button variant="outline" onClick={() => logoInputRef.current?.click()} disabled={logoUploading}>
                          {logoUploading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : null}
                          Cambiar logo
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Zona Horaria y Formato
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Zona horaria</Label>
                      <Select defaultValue="america_santiago">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="america_santiago">
                            América/Santiago (GMT-3)
                          </SelectItem>
                          <SelectItem value="america_punta_arenas">
                            América/Punta_Arenas (GMT-3)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Formato de fecha</Label>
                      <Select defaultValue="dd/mm/yyyy">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                          <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                          <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}