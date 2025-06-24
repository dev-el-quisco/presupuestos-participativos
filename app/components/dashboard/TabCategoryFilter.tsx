"use client";

import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { useYear } from "@/app/context/YearContext";
import Link from "next/link";

interface Tab {
  name: string;
  path: string;
  icon?: ReactNode;
}

interface TabCategoryFilterProps {
  tabs?: Tab[];
  basePath?: string;
}

const TabCategoryFilter = ({ tabs, basePath = "" }: TabCategoryFilterProps) => {
  const router = useRouter();
  const pathname = usePathname();
  // Si no se proporcionan tabs, usar las pestañas predeterminadas para estadísticas
  const defaultTabs: Tab[] = [
    { name: "Proyectos", path: "/proyectos" },
    { name: "Por Sedes", path: "/sedes" },
    { name: "Vista Detallada", path: "/vista-detallada" },
  ];

  const tabsToRender = tabs || defaultTabs;

  // Inicializar activeTab como null para evitar selección automática
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const { selectedYear } = useYear();

  useEffect(() => {
    // Determinar la pestaña activa basada en la ruta actual
    const currentPath = pathname;
    const matchingTab = tabsToRender.find((tab) => {
      // Comprobar si la ruta actual termina con la ruta de la pestaña
      return (
        currentPath.endsWith(tab.path) ||
        (tab.path === "" && currentPath.endsWith("/estadisticas"))
      );
    });

    if (matchingTab) {
      setActiveTab(matchingTab.path);
    } else if (
      // No seleccionar automáticamente si estamos en la ruta base de estadísticas o panel-administrador
      !currentPath.endsWith("/estadisticas") &&
      !currentPath.endsWith("/panel-administrador")
    ) {
      // Solo establecer la primera pestaña como activa si no estamos en las rutas base
      setActiveTab(tabsToRender[0]?.path || "");
    }
    // No hay redirección automática
  }, [pathname, tabsToRender, selectedYear]);

  // Construir la ruta para cada tab
  const getTabPath = (tabPath: string) => {
    if (basePath) {
      return `${basePath}${tabPath}`;
    } else {
      const section =
        pathname.includes("/estadisticas/") ||
        pathname.endsWith("/estadisticas")
          ? "estadisticas"
          : pathname.includes("/panel-administrador/") ||
            pathname.endsWith("/panel-administrador")
          ? "panel-administrador"
          : "estadisticas";

      return `/dashboard/${selectedYear}/${section}${tabPath}`;
    }
  };

  // Reemplazar la función handleTabClick con un manejador para actualizar el estado local
  const handleTabClick = (tabPath: string) => {
    setActiveTab(tabPath);
  };

  return (
    <div className="w-full pb-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex overflow-x-auto hide-scrollbar">
          {tabsToRender.map((tab) => (
            <Link
              key={tab.path}
              href={getTabPath(tab.path)}
              onClick={() => handleTabClick(tab.path)}
              className={`flex-1 py-3 px-4 text-center transition-colors ${
                activeTab === tab.path
                  ? "bg-white text-gray-800 font-medium border-b-2 border-[#31c46c]"
                  : "bg-gray-50 text-gray-600 hover:bg-[#31c46c]/20"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                {tab.icon && <span>{tab.icon}</span>}
                <span>{tab.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TabCategoryFilter;
