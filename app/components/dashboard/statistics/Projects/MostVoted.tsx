"use client";

import { useYear } from "@/app/context/YearContext";
import { useFilter } from "@/app/context/FilterContext";
import { useState, useEffect } from "react";

interface ProjectWithVotes {
  id: string;
  id_proyecto: string;
  nombre: string;
  tipo_proyecto_nombre: string;
  votos_count: number;
}

interface StatisticsData {
  categories: any[];
  totalVotes: number;
  totalProjects: number;
  projects: ProjectWithVotes[];
}

const MostVoted = () => {
  const { selectedYear } = useYear();
  const { selectedCategory } = useFilter();
  const [windowWidth, setWindowWidth] = useState(0);
  const [statisticsData, setStatisticsData] = useState<StatisticsData | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  // Mapeo de colores por categoría
  const getColorConfig = (categoryName: string) => {
    const colorMap: Record<string, string> = {
      Comunales: "bg-green-500", // Verde
      Infantiles: "bg-[#f7f139]", // Amarillo
      Juveniles: "bg-blue-500", // Azul
      Sectoriales: "bg-[#f0a843]", // Naranja
    };

    return colorMap[categoryName] || "bg-gray-500";
  };

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/statistics?periodo=${selectedYear}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setStatisticsData(data.statistics);
          }
        }
      } catch (error) {
        console.error("Error al cargar estadísticas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [selectedYear]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (loading || !statisticsData) {
    return (
      <div className="w-full p-4">
        <div className="bg-white rounded-lg shadow-sm p-6 h-full border border-gray-200">
          <h2 className="text-xl font-semibold">Proyectos Más Votados</h2>
          <p className="mb-6 font-light">Top 5 con más votos</p>
          <div className="space-y-5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start">
                <div className="flex-shrink-0 mr-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
                </div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Filtrar proyectos según la categoría seleccionada
  const filteredProjects =
    selectedCategory === "todos" || selectedCategory === null
      ? statisticsData.projects
      : statisticsData.projects.filter((project) =>
          project.tipo_proyecto_nombre.toLowerCase().includes(selectedCategory)
        );

  // Ordenar por votos y tomar los 5 primeros
  const topProjects = [...filteredProjects]
    .sort((a, b) => b.votos_count - a.votos_count)
    .slice(0, 5);

  // Encontrar el valor máximo para escalar las barras
  const maxVotes = Math.max(
    ...topProjects.map((project) => project.votos_count),
    1
  );

  // Determinar el título según la categoría seleccionada
  const getCategoryTitle = () => {
    if (selectedCategory === "todos" || selectedCategory === null) {
      return "Proyectos Más Votados";
    }

    const categoryMap: { [key: string]: string } = {
      comunales: "Proyectos Comunales",
      infantiles: "Proyectos Infantiles",
      juveniles: "Proyectos Juveniles",
      sectoriales: "Proyectos Sectoriales",
    };

    return `${categoryMap[selectedCategory] || "Proyectos"} Más Votados`;
  };

  return (
    <div className="w-full p-4">
      <div className="bg-white rounded-lg shadow-sm p-6 h-full border border-gray-200">
        <h2 className="text-xl font-semibold">{getCategoryTitle()}</h2>
        <p className="mb-6 font-light">Top 5 con más votos</p>

        {topProjects.length > 0 ? (
          <div className="space-y-5">
            {topProjects.map((project) => {
              const barWidth = `${(project.votos_count / maxVotes) * 100}%`;
              const colorClass = getColorConfig(project.tipo_proyecto_nombre);

              return (
                <div key={project.id} className="flex items-start">
                  <div className="flex-shrink-0 mr-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium">
                      {project.id_proyecto}
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="mb-1">
                      <div className="font-medium">{project.nombre}</div>
                      <div className="text-xs text-gray-500">
                        Proyectos {project.tipo_proyecto_nombre}
                      </div>
                    </div>

                    <div className="relative mt-2">
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                          <div
                            className={`${colorClass} h-full rounded-full`}
                            style={{ width: barWidth }}
                          ></div>
                        </div>
                        <div className="ml-3 text-sm font-bold min-w-[40px] text-right">
                          {project.votos_count}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No hay proyectos en esta categoría entre los 5 más votados
          </div>
        )}
      </div>
    </div>
  );
};

export default MostVoted;
