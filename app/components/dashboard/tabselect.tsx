"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconGraph } from "@tabler/icons-react";
import { IconTool } from "@tabler/icons-react";
import { IconAbacus } from "@tabler/icons-react";
import { useYear } from "@/app/context/YearContext";
import { useAuth } from "@/app/hooks/useAuth";

const Tabselect = () => {
  const pathname = usePathname();
  const { selectedYear } = useYear();
  const { user } = useAuth();

  const isActive = (path: string) => {
    return pathname.includes(path);
  };

  const getLinkClasses = (path: string) => {
    if (isActive(path)) {
      return "bg-[#31c46c] text-[#eceef0] px-4 py-3 rounded-lg transition-all duration-200 font-medium";
    } else {
      return "text-[#eceef0]/80 hover:text-[#eceef0] hover:bg-[#31c46c]/20 px-4 py-3 rounded-lg transition-all duration-200";
    }
  };

  // Construir las rutas con el año del contexto
  const votacionesPath = `/dashboard/${selectedYear}/votaciones`;
  const estadisticasPath = `/dashboard/${selectedYear}/estadisticas`;
  const adminPath = `/dashboard/${selectedYear}/panel-administrador`;

  // Definir permisos por rol
  const rolePermissions = {
    'Administrador': ['votaciones', 'estadisticas', 'admin'],
    'Digitador': ['votaciones'],
    'Encargado de Local': ['votaciones', 'estadisticas'],
    'Ministro de Fe': ['estadisticas']
  };

  // Obtener permisos del usuario actual
  const userPermissions = user?.rol ? rolePermissions[user.rol as keyof typeof rolePermissions] || [] : [];

  // Función para verificar si el usuario tiene acceso a una sección
  const hasAccess = (section: string) => {
    return userPermissions.includes(section);
  };

  return (
    <div className="min-w-full w-full max-w-full bg-[#FFFFFF]/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden relative">
      {/* Fondo invertido para el content */}
      <div className="h-full w-full absolute inset-0 -z-10 bg-[#2c3e4a]">
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, #4f4f4f 0, #4f4f4f 2px, transparent 2px, transparent 10px)`,
            backgroundSize: "14px 14px",
            opacity: "0.15",
          }}
        ></div>
      </div>

      {/* Contenedor de tabs con borde inferior */}
      <div className="border-b border-[#eceef0]/20 py-2">
        <div className="flex flex-row justify-center md:justify-start mx-1 md:mx-2">
          {/* Tab de Votaciones */}
          {hasAccess('votaciones') && (
            <Link
              href={votacionesPath}
              className={getLinkClasses(votacionesPath)}
            >
              <div className="flex items-center gap-2">
                <IconAbacus size={20} className="hidden md:block" />
                <span>Votaciones</span>
              </div>
            </Link>
          )}
          
          {/* Tab de Estadísticas */}
          {hasAccess('estadisticas') && (
            <Link
              href={estadisticasPath}
              className={getLinkClasses(estadisticasPath)}
            >
              <div className="flex items-center gap-2">
                <IconGraph size={20} className="hidden md:block" />
                <span>Estadísticas</span>
              </div>
            </Link>
          )}
          
          {/* Tab de Administración */}
          {hasAccess('admin') && (
            <Link href={adminPath} className={getLinkClasses(adminPath)}>
              <div className="flex items-center gap-2">
                <IconTool size={20} className="hidden md:block" />
                <span className="block md:hidden">Admin</span>
                <span className="hidden md:block lg:hidden">Administración</span>
                <span className="hidden lg:block">Portal Administrador</span>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tabselect;
