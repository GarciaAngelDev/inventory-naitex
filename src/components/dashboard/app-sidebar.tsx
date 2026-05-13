import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { dashboardNavigation } from "@/config/dashboard-navigation";
import { Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, UserRole } from '@/types/user';
import { filterNavigationByRole } from "@/lib/navigation";
import Image from "next/image";

export function AppSidebar({ user }: { user: User | null }) {

  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarContent className="flex flex-col justify-between">
        <SidebarGroup>
          <SidebarGroupLabel className="p-3 my-3  ">
            <Image src="/brand.webp" alt="logo" className="w-10 h-10 mr-2" width={100} height={100} />
            <span className="text-sm font-medium">Agromaquinarias Naitex</span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filterNavigationByRole(dashboardNavigation, user?.role).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className={pathname.startsWith(item.url) && item.url !== '/dashboard' ? 'bg-yellow-400 hover:bg-yellow-500 text-white cursor-pointer' : pathname === item.url ? 'bg-yellow-400 hover:bg-yellow-500 text-white cursor-pointer' : ''}>
                    <Link href={item.url}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {
          (user?.role === UserRole.SUPER || user?.role === UserRole.ADMIN) && (
            <SidebarGroup>
              <SidebarGroupLabel>Sistema</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className={pathname.startsWith('/dashboard/configuracion') ? 'bg-yellow-500 hover:bg-yellow-600 text-white cursor-pointer' : ''}>
                      <Link href="/dashboard/configuracion">
                        <Settings />
                        <span>Configuración</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )
        }
      </SidebarContent>
    </Sidebar>
  )
}