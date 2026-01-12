import { useState } from "react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/logo.png";
import {
  LayoutDashboard,
  Shield,
  Users,
  UserPlus,
  HardHat,
  Wrench,
  Users2,
  ChevronLeft,
  ChevronRight,
  FileText,
  AlertTriangle,
  Settings,
  LogOut,
} from "lucide-react";

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: number;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Shield, label: "Gerencia", href: "/gerencia" },
  { icon: Users, label: "RRHH", href: "/rrhh" },
  { icon: UserPlus, label: "Reclutamiento", href: "/reclutamiento" },
  { icon: HardHat, label: "Prevención", href: "/prevencion", badge: 3 },
  { icon: Wrench, label: "Operaciones", href: "/operaciones" },
  { icon: Users2, label: "Comité Paritario", href: "/comite" },
];

const bottomNavItems: NavItem[] = [
  { icon: FileText, label: "Documentos", href: "/documentos" },
  { icon: AlertTriangle, label: "Alertas", href: "/alertas", badge: 5 },
  { icon: Settings, label: "Configuración", href: "/settings" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { signOut } = useAuth();

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
          src={logo}
          alt="Prevention & Safety"
          className="h-12 w-12 object-contain"
        />
        {!collapsed && (
          <div className="flex flex-col animate-fade-in">
            <span className="text-sm font-bold text-sidebar-primary">
              PREVENTION
            </span>
            <span className="text-xs text-sidebar-foreground/70">& SAFETY</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="mb-4">
          {!collapsed && (
            <span className="px-3 text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider">
              Módulos
            </span>
          )}
        </div>
        {navItems.map((item) => (
          <NavButton key={item.label} item={item} collapsed={collapsed} isActive={location.pathname === item.href} />
        ))}

        <div className="pt-6">
          {!collapsed && (
            <span className="px-3 text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider">
              Sistema
            </span>
          )}
        </div>
        {bottomNavItems.map((item) => (
          <NavButton key={item.label} item={item} collapsed={collapsed} isActive={location.pathname === item.href} />
        ))}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-sidebar-border">
        <button 
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span className="text-sm">Cerrar Sesión</span>}
        </button>
      </div>

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
