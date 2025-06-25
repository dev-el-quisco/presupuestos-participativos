import React, { ReactNode } from "react";
import Layout from "@/app/dashboard/Layout";
import Banner from "@/app/components/dashboard/statistics/Banner";
import TabCategoryFilter from "@/app/components/dashboard/TabCategoryFilter";
import RoleProtectedRoute from "@/app/components/auth/RoleProtectedRoute";

interface StatisticsLayoutProps {
  children: ReactNode;
}

export default function StatisticsLayout({ children }: StatisticsLayoutProps) {
  const statisticsTabs = [
    { name: "Proyectos", path: "/proyectos" },
    { name: "Por Sedes", path: "/sedes" },
    { name: "Vista Detallada", path: "/vista-detallada" },
  ];

  return (
    <RoleProtectedRoute
      allowedRoles={["Administrador", "Ministro de Fe", "Encargado de Local"]}
    >
      <Layout>
        <div className="p-6 w-full flex flex-col justify-start">
          <div className="flex flex-col lg:flex-row items-start justify-between pb-4">
            <div className="pb-4 md:pb-0">
              <h1 className="text-2xl">
                Estadísticas de Presupuestos Participativos
              </h1>
              <p>
                Análisis detallado de los resultados y métricas de participación
              </p>
            </div>
            <Banner />
          </div>
          <TabCategoryFilter tabs={statisticsTabs} />
          {children}
        </div>
      </Layout>
    </RoleProtectedRoute>
  );
}
