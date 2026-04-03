import { useLocation, useNavigate } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard,
  DollarSign,
  CalendarDays,
  Users,
  Settings,
  LogOut,
  GraduationCap,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { title: "Dashboard", url: "/accounts/dashboard/tutor", icon: LayoutDashboard },
  { title: "Solicitudes", url: "/accounts/dashboard/tutor/requests", icon: Users },
  { title: "Mis Sesiones", url: "/accounts/dashboard/tutor/sessions", icon: CalendarDays },
  { title: "Ingresos", url: "/accounts/dashboard/tutor/earnings", icon: DollarSign },
  { title: "Configuración", url: "/accounts/dashboard/tutor/settings", icon: Settings },
];

export function TutorSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { logout, profile_data } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-secondary" />
              {!collapsed && <span className="font-bold">SubjectSupport</span>}
            </div>
          </SidebarGroupLabel>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Menú</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-muted/50"
                      activeClassName="bg-secondary/10 text-secondary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {!collapsed && profile_data && (
          <div className="px-3 pb-2">
            <p className="truncate text-sm font-medium text-foreground">{profile_data.full_name}</p>
            <p className="truncate text-xs text-muted-foreground">{profile_data.email}</p>
          </div>
        )}
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "sm"}
          className="w-full justify-start text-muted-foreground hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {!collapsed && "Cerrar sesión"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
