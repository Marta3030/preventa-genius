import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import logo from "@/assets/logo.png";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  LayoutDashboard,
  Shield,
  Users,
  UserPlus,
  HardHat,
  Wrench,
  Users2,
  ShieldCheck,
  FolderOpen,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: number;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: ShieldCheck, label: "Cumplimiento", href: "/cumplimiento" },
  { icon: Shield, label: "Gerencia", href: "/gerencia" },
  { icon: Users, label: "RRHH", href: "/rrhh" },
  { icon: UserPlus, label: "Reclutamiento", href: "/reclutamiento" },
  { icon: HardHat, label: "Prevención", href: "/prevencion", badge: 3 },
  { icon: Wrench, label: "Operaciones", href: "/operaciones" },
  { icon: Users2, label: "Comité Paritario", href: "/comite" },
  { icon: FolderOpen, label: "Documentos", href: "/documentos" },
  { icon: Bell, label: "Alertas", href: "/alertas" },
  { icon: Settings, label: "Configuración", href: "/configuracion" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();
  const { data: companySettings } = useCompanySettings();

  const companyName = companySettings?.company_name;
  const companyLogo = companySettings?.company_logo;

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Mobile: hamburger button
  if (isMobile) {
    return (
      <>
        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 bg-sidebar rounded-lg shadow-lg text-sidebar-foreground"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Sidebar drawer */}
        <aside
          className={cn(
            "fixed left-0 top-0 z-50 h-screen w-64 bg-sidebar transition-transform duration-300 flex flex-col",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <img
                src={companyLogo || logo}
                alt={companyName || "Prevention & Safety"}
                className="h-10 w-10 object-contain"
              />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-sidebar-primary">
                  {companyName || "PREVENTION"}
                </span>
                {!companyName && (
                  <span className="text-xs text-sidebar-foreground/70">& SAFETY</span>
                )}
              </div>
            </div>
            <button onClick={() => setMobileOpen(false)} className="text-sidebar-foreground/70">
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavButton key={item.label} item={item} collapsed={false} isActive={location.pathname === item.href} />
            ))}
          </nav>
        </aside>
      </>
    );
  }

  // Desktop sidebar
  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar transition-all duration-300 flex flex-col",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 border-b border-sidebar-border">
        <img
          src={companyLogo || logo}
          alt={companyName || "Prevention & Safety"}
          className="h-12 w-12 object-contain"
        />
        {!collapsed && (
          <div className="flex flex-col animate-fade-in">
            <span className="text-sm font-bold text-sidebar-primary">
              {companyName || "PREVENTION"}
            </span>
            {!companyName && (
              <span className="text-xs text-sidebar-foreground/70">& SAFETY</span>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavButton key={item.label} item={item} collapsed={collapsed} isActive={location.pathname === item.href} />
        ))}
      </nav>

      {/* Collapse button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 h-6 w-6 rounded-full bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>
    </aside>
  );
}

function NavButton({
  item,
  collapsed,
  isActive,
}: {
  item: NavItem;
  collapsed: boolean;
  isActive: boolean;
}) {
  const Icon = item.icon;

  return (
    <Link
      to={item.href}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
        isActive
          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-safety"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
      )}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      {!collapsed && (
        <span className="text-sm font-medium animate-fade-in">{item.label}</span>
      )}
      {item.badge && (
        <span
          className={cn(
            "flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold",
            isActive
              ? "bg-sidebar-primary-foreground/20 text-sidebar-primary-foreground"
              : "bg-destructive text-destructive-foreground",
            collapsed && "absolute -top-1 -right-1"
          )}
        >
          {item.badge}
        </span>
      )}

      {/* Tooltip for collapsed state */}
      {collapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-sidebar rounded-md text-sidebar-foreground text-sm whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
          {item.label}
        </div>
      )}
    </Link>
  );
}
