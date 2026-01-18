import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useEPPAllocations, useEPPCatalog, useIntegralKPIs } from "@/hooks/useIntegralModule";
import { EPPAllocationForm } from "./EPPAllocationForm";
import { useAuth } from "@/hooks/useAuth";
import { format, parseISO, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import { HardHat, AlertTriangle, CheckCircle, Clock, FileSignature } from "lucide-react";

const statusColors: Record<string, string> = {
  pending_signature: "bg-warning/10 text-warning border-warning/30",
  signed: "bg-success/10 text-success border-success/30",
  expired: "bg-destructive/10 text-destructive border-destructive/30",
};

const statusLabels: Record<string, string> = {
  pending_signature: "Pendiente Firma",
  signed: "Firmado",
  expired: "Vencido",
};

const categoryIcons: Record<string, string> = {
  cabeza: "🪖",
  ojos: "🥽",
  manos: "🧤",
  pies: "👢",
  cuerpo: "🦺",
  oídos: "🎧",
  respiratorio: "😷",
  caidas: "🪢",
};

export function EPPDashboard() {
  const { isAdmin } = useAuth();
  const { data: allocations, isLoading: loadingAllocations } = useEPPAllocations();
  const { data: catalog, isLoading: loadingCatalog } = useEPPCatalog();
  const kpis = useIntegralKPIs();

  const today = new Date();

  const getExpiryStatus = (expiryDate?: string) => {
    if (!expiryDate) return null;
    const days = differenceInDays(parseISO(expiryDate), today);
    if (days < 0) return { label: "Vencido", color: "text-destructive", urgent: true };
    if (days <= 7) return { label: `${days}d`, color: "text-destructive", urgent: true };
    if (days <= 30) return { label: `${days}d`, color: "text-warning", urgent: false };
    return { label: `${days}d`, color: "text-muted-foreground", urgent: false };
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <HardHat className="h-4 w-4" />
              Total Asignaciones
            </CardDescription>
            <CardTitle className="text-3xl">{kpis.epp.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <FileSignature className="h-4 w-4" />
              Pendientes Firma
            </CardDescription>
            <CardTitle className="text-3xl text-warning">{kpis.epp.pending_signature}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Vence en 30 días
            </CardDescription>
            <CardTitle className="text-3xl text-destructive">{kpis.epp.expiring_30d}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Items en Catálogo
            </CardDescription>
            <CardTitle className="text-3xl">{catalog?.length || 0}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Catálogo EPP */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Catálogo de EPP</CardTitle>
              <CardDescription>Equipos de protección personal disponibles</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loadingCatalog ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {catalog?.map((item) => (
                <div 
                  key={item.id} 
                  className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{categoryIcons[item.category] || "🛡️"}</span>
                    <span className="text-xs text-muted-foreground">{item.code}</span>
                  </div>
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Vida útil: {item.useful_life_months || 12} meses
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Asignaciones Recientes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Asignaciones de EPP</CardTitle>
              <CardDescription>Registro de entregas y firmas</CardDescription>
            </div>
            {isAdmin && <EPPAllocationForm />}
          </div>
        </CardHeader>
        <CardContent>
          {loadingAllocations ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : allocations?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <HardHat className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay asignaciones de EPP registradas</p>
              {isAdmin && (
                <EPPAllocationForm 
                  trigger={
                    <Button variant="outline" className="mt-4">
                      Registrar primera entrega
                    </Button>
                  }
                />
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trabajador</TableHead>
                  <TableHead>EPP</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Fecha Entrega</TableHead>
                  <TableHead>Vencimiento</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allocations?.slice(0, 10).map((allocation) => {
                  const expiryStatus = getExpiryStatus(allocation.expiry_date);
                  return (
                    <TableRow key={allocation.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{allocation.employee?.name}</p>
                          <p className="text-xs text-muted-foreground">{allocation.employee?.rut}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{categoryIcons[allocation.epp_item?.category || ''] || "🛡️"}</span>
                          <span>{allocation.epp_item?.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {allocation.quantity}
                        {allocation.size && <span className="text-muted-foreground ml-1">({allocation.size})</span>}
                      </TableCell>
                      <TableCell>
                        {format(parseISO(allocation.delivery_date), "dd/MM/yyyy", { locale: es })}
                      </TableCell>
                      <TableCell>
                        {allocation.expiry_date ? (
                          <div className="flex items-center gap-2">
                            <span>{format(parseISO(allocation.expiry_date), "dd/MM/yyyy", { locale: es })}</span>
                            {expiryStatus && (
                              <Badge variant="outline" className={expiryStatus.color}>
                                {expiryStatus.urgent && <Clock className="h-3 w-3 mr-1" />}
                                {expiryStatus.label}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColors[allocation.status]}>
                          {allocation.status === 'pending_signature' && <FileSignature className="h-3 w-3 mr-1" />}
                          {allocation.status === 'signed' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {statusLabels[allocation.status] || allocation.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
