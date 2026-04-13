import { useIsMobile } from '@/hooks/use-mobile';
import { Sidebar } from '@/components/layout/Sidebar';
import { UserMenu } from '@/components/layout/UserMenu';
import { ComplianceDashboard } from '@/components/compliance/ComplianceDashboard';
import { ShieldCheck } from 'lucide-react';

export default function Compliance() {
  const isMobile = useIsMobile();
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className={isMobile ? "pl-0 pt-14" : "pl-64 transition-all duration-300"}>
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="h-7 w-7 text-primary" />
                Cumplimiento Legal
              </h1>
              <p className="text-sm text-muted-foreground">
                Motor de Cumplimiento • DS44 • Ley 16.744 • OIT 155 • ISO 45001
              </p>
            </div>
            <UserMenu />
          </div>
        </header>

        <div className="p-6">
          <ComplianceDashboard />
        </div>
      </main>
    </div>
  );
}
