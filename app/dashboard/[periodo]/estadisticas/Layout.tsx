import React, { ReactNode } from "react";
import Layout from "@/app/dashboard/Layout";
import Banner from "@/app/components/dashboard/statistics/Banner";
import TabCategoryFilter from "@/app/components/dashboard/TabCategoryFilter";

interface StatisticsLayoutProps {
  children: ReactNode;
}

export default function StatisticsLayout({ children }: StatisticsLayoutProps) {
  const statisticsTabs = [
    { name: "Proyectos", path: "/proyectos" },
    { name: "Por Sedes", path: "/sedes" },
    { name: "Vista Detallada", path: "/vista-detallada" }
  ];

  return (
    <Layout>
      <div className="p-6 w-full flex flex-col justify-start">
        <div className="flex flex-row items-center justify-between">
          <div>
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
  );
}
