"use client";

import { useYear } from "@/app/context/YearContext";
import { useState, useEffect } from "react";

interface ProjectRanking {
  position: number;
  id: string;
  title: string;
  category: string;
  categoryId: string;
  votes: number;
  percentTotal: number;
  percentCategory: number;
}

const Ranking = () => {
  const { selectedYear, isYearReady } = useYear();
  const [projectsRanking, setProjectsRanking] = useState<ProjectRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRanking = async () => {
    if (!isYearReady || !selectedYear) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/statistics/detailed?periodo=${selectedYear}`
      );

      if (!response.ok) {
        throw new Error("Error al obtener ranking de proyectos");
      }

      const data = await response.json();

      if (data.success) {
        setProjectsRanking(data.data.projectsRanking);
      } else {
        throw new Error(data.error || "Error desconocido");
      }
    } catch (err) {
      console.error("Error fetching ranking:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRanking();
  }, [isYearReady, selectedYear]);

  // Definir tipo para las claves de categorías
  type CategoryKey =
    | "comunales"
    | "infantiles"
    | "deportivos"
    | "culturales"
    | "juveniles"
    | "sectoriales";

  // Mapeo de categorías a colores pasteles
  const categoryColors: Record<CategoryKey, { bg: string; text: string }> = {
    comunales: {
      bg: "bg-green-100",
      text: "text-green-800",
    },
    juveniles: {
      bg: "bg-blue-100",
      text: "text-blue-800",
    },
    infantiles: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
    },
    sectoriales: {
      bg: "bg-orange-100",
      text: "text-orange-800",
    },
    deportivos: {
      bg: "bg-blue-100",
      text: "text-blue-800",
    },
    culturales: {
      bg: "bg-orange-100",
      text: "text-orange-800",
    },
  };

  // Mapeo de categorías a nombres cortos (sin "Proyectos")
  const categoryShortNames: Record<CategoryKey, string> = {
    comunales: "Comunales",
    juveniles: "Juveniles",
    infantiles: "Infantiles",
    sectoriales: "Sectoriales",
    deportivos: "Deportivos",
    culturales: "Culturales",
  };

  // Color por defecto para categorías no encontradas
  const defaultColor = {
    bg: "bg-gray-100",
    text: "text-gray-800",
  };

  // Función para obtener el color de la posición (oro, plata, bronce)
  const getPositionColor = (position: number) => {
    switch (position) {
      case 1:
        return "bg-yellow-500"; // Oro
      case 2:
        return "bg-gray-400"; // Plata
      case 3:
        return "bg-amber-600"; // Bronce
      default:
        return "bg-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center py-8">
        <div className="text-gray-600">Cargando ranking de proyectos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex justify-center items-center py-8">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (projectsRanking.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mt-6">
        <h2 className="text-xl mb-4">Ranking Completo de Proyectos</h2>
        <p className="text-gray-600">
          No hay proyectos con votos para el año {selectedYear}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-3 sm:p-6 border border-gray-200 mt-6">
      <h2 className="text-lg sm:text-xl mb-4">Ranking Completo de Proyectos</h2>
      <p className="text-gray-600 mb-6 text-sm sm:text-base">
        Todos los proyectos ordenados por cantidad de votos
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border border-gray-200 rounded-lg">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 rounded-lg border border-gray-200">
            <tr className="rounded-lg">
              <th className="px-2 sm:px-4 py-3 text-center">Pos.</th>
              <th className="px-2 sm:px-4 py-3">Proyecto</th>
              <th className="px-2 sm:px-4 py-3">Categoría</th>
              <th className="px-2 sm:px-4 py-3 text-right">Votos</th>
              <th className="px-2 sm:px-4 py-3 text-right hidden sm:table-cell">% Total</th>
              <th className="px-2 sm:px-4 py-3 text-right hidden md:table-cell">% Cat.</th>
            </tr>
          </thead>
          <tbody className="rounded-lg">
            {projectsRanking.map((project) => {
              // Verificar si la clave es válida y hacer type assertion segura
              const categoryKey =
                project.categoryId.toLowerCase() as CategoryKey;
              const categoryColor =
                categoryKey in categoryColors
                  ? categoryColors[categoryKey]
                  : defaultColor;
              
              // Obtener el nombre corto de la categoría
              const categoryShortName =
                categoryKey in categoryShortNames
                  ? categoryShortNames[categoryKey]
                  : project.category;

              return (
                <tr
                  key={project.id}
                  className="border-b hover:bg-gray-50 border border-gray-200"
                >
                  <td className="px-2 sm:px-4 py-3 text-center">
                    <div
                      className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full ${
                        getPositionColor(project.position)
                      } flex items-center justify-center mx-auto text-white font-medium text-xs sm:text-sm`}
                    >
                      {project.position}
                    </div>
                  </td>
                  <td className="px-2 sm:px-4 py-3 font-medium text-xs sm:text-sm">
                    <div className="truncate max-w-[120px] sm:max-w-none" title={project.title}>
                      {project.title}
                    </div>
                  </td>
                  <td className="px-2 sm:px-4 py-3">
                    <span
                      className={`px-1 sm:px-2 py-1 rounded-full text-xs ${categoryColor.bg} ${categoryColor.text} whitespace-nowrap`}
                    >
                      {categoryShortName}
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-right font-bold text-xs sm:text-sm">
                    {project.votes.toLocaleString()}
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-right text-xs sm:text-sm hidden sm:table-cell">
                    {project.percentTotal}%
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-right text-xs sm:text-sm hidden md:table-cell">
                    {project.percentCategory}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Ranking;
