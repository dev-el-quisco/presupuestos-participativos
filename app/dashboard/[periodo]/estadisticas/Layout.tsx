"use client";

import React, { ReactNode, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Layout from "@/app/dashboard/Layout";
import Banner from "@/app/components/dashboard/statistics/Banner";
import TabCategoryFilter from "@/app/components/dashboard/TabCategoryFilter";
import RoleProtectedRoute from "@/app/components/auth/RoleProtectedRoute";

interface StatisticsLayoutProps {
  children: ReactNode;
}

export default function StatisticsLayout({ children }: StatisticsLayoutProps) {
  const params = useParams();
  const [totalVotos, setTotalVotos] = useState<number>(0);
  const [years, setYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>(
    (params.periodo as string) || ""
  );

  // Obtener años disponibles
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const response = await fetch("/api/years");
        const data = await response.json();
        if (data.success) {
          setYears(data.data);
        }
      } catch (error) {
        console.error("Error fetching years:", error);
      }
    };

    fetchYears();
  }, []);

  // Obtener total de votos para el año seleccionado
  useEffect(() => {
    const fetchTotalVotes = async () => {
      if (!selectedYear) return;

      try {
        const response = await fetch(
          `/api/statistics/total-votes?periodo=${selectedYear}`
        );
        const data = await response.json();
        if (data.success) {
          setTotalVotos(data.data.totalVotos || 0);
        }
      } catch (error) {
        console.error("Error fetching total votes:", error);
        setTotalVotos(0);
      }
    };

    fetchTotalVotes();
  }, [selectedYear]);

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
