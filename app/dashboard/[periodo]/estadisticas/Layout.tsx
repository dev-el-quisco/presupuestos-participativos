"use client";

import React, { ReactNode, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Layout from "@/app/dashboard/Layout";
import Banner from "@/app/components/dashboard/statistics/Banner";
import TabCategoryFilter from "@/app/components/dashboard/TabCategoryFilter";
import RoleProtectedRoute from "@/app/components/auth/RoleProtectedRoute";
import { useYear } from "@/app/context/YearContext";

interface StatisticsLayoutProps {
  children: ReactNode;
}

export default function StatisticsLayout({ children }: StatisticsLayoutProps) {
  const [totalVotos, setTotalVotos] = useState<number>(0);
  const [years, setYears] = useState<number[]>([]);

  // Usar el contexto global de año en lugar del estado local
  const { selectedYear, setSelectedYear, isYearReady } = useYear();

  // Generar años disponibles (como en Filter.tsx)
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const maxYear = currentYear + 1;
    const yearsArray: number[] = [];

    for (let year = 2025; year <= maxYear; year++) {
      yearsArray.push(year);
    }

    setYears(yearsArray);
  }, []);

  // Obtener total de votos usando la API existente /api/statistics
  useEffect(() => {
    const fetchTotalVotes = async () => {
      if (!selectedYear || !isYearReady) return;

      try {
        const response = await fetch(`/api/statistics?periodo=${selectedYear}`);
        const data = await response.json();
        if (data.success) {
          setTotalVotos(data.statistics.totalVotes || 0);
        }
      } catch (error) {
        console.error("Error fetching total votes:", error);
        setTotalVotos(0);
      }
    };

    fetchTotalVotes();
  }, [selectedYear, isYearReady]);

  const statisticsTabs = [
    { name: "Proyectos", path: "/proyectos" },
    { name: "Sedes", path: "/sedes" },
    { name: "Detallada", path: "/vista-detallada" },
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
            <Banner
              totalVotos={totalVotos}
              years={years}
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
            />
          </div>
          <TabCategoryFilter tabs={statisticsTabs} />
          {children}
        </div>
      </Layout>
    </RoleProtectedRoute>
  );
}
