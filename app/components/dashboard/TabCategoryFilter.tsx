"use client";

import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { useYear } from "@/app/context/YearContext";

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

  // Inicializar activeTab con la primera pestaña por defecto
  const [activeTab, setActiveTab] = useState(tabsToRender[0]?.path || "");
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
    } else {
      // Si no hay coincidencia, establecer la primera pestaña como activa
      setActiveTab(tabsToRender[0]?.path || "");
    }

    // Redirección automática si estamos en la ruta base de estadísticas
    if (currentPath.endsWith("/estadisticas") && tabsToRender.length > 0) {
      const firstTabPath = tabsToRender[0].path;
      const section = "estadisticas";
      const newPath = `/dashboard/${selectedYear}/${section}${firstTabPath}`;
      router.replace(newPath); // Usar replace en lugar de push
    } else if (
      currentPath.endsWith("/panel-administrador") &&
      tabsToRender.length > 0
    ) {
      const firstTabPath = tabsToRender[0].path;
      const section = "panel-administrador";
      const newPath = `/dashboard/${section}${firstTabPath}`;
      router.replace(newPath); // Usar replace en lugar de push
    }
  }, [pathname, tabsToRender, router, selectedYear]);

  const handleTabClick = (tabPath: string) => {
    // Construir la nueva ruta
    let newPath = "";
    if (basePath) {
      // Si se proporciona una ruta base, usarla
      newPath = `${basePath}${tabPath}`;
    } else {
      // De lo contrario, construir la ruta basada en el año del contexto y la sección actual
      const section =
        pathname.includes("/estadisticas/") ||
        pathname.endsWith("/estadisticas")
          ? "estadisticas"
          : pathname.includes("/panel-administrador/") ||
            pathname.endsWith("/panel-administrador")
          ? "panel-administrador"
          : "estadisticas";
      if (
        pathname.includes("/panel-administrador/") ||
        pathname.endsWith("/panel-administrador")
      ) {
        newPath = `/dashboard/${section}${tabPath}`;
      } else {
        newPath = `/dashboard/${selectedYear}/${section}${tabPath}`;
      }
    }

    router.push(newPath);
    setActiveTab(tabPath);
  };

  return (
    <div className="w-full mt-6 mb-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex">
          {tabsToRender.map((tab) => (
            <button
              key={tab.path}
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
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TabCategoryFilter;
