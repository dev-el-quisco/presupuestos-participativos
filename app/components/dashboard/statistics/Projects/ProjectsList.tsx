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

type Project = {
  id: string;
  id_proyecto: string; // Agregar el ID visual
  title: string;
  category: string;
  categoryId: string;
  percentTotal: number;
  percentCategory: number;
  votes: number;
  color: string;
};

const ProjectsList = () => {
  const { selectedYear } = useYear();
  const { selectedCategory } = useFilter();
  const [windowWidth, setWindowWidth] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [statisticsData, setStatisticsData] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const projectsPerPage = 10;

  // Mapeo de categorías a colores pasteles
  const categoryColors: Record<string, { bg: string; text: string; color: string }> = {
    comunales: {
      bg: "bg-green-100", // Verde
      text: "text-green-800",
      color: "#065F46",
    },
    infantiles: {
      bg: "bg-yellow-100", // Amarillo
      text: "text-yellow-800",
      color: "#92400E",
    },
    juveniles: {
      bg: "bg-blue-100", // Azul
      text: "text-blue-800",
      color: "#1E40AF",
    },
    sectoriales: {
      bg: "bg-orange-100", // Naranja
      text: "text-orange-800",
      color: "#efa844",
    },
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

  // Resetear a la primera página cuando cambia la categoría
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  if (loading || !statisticsData) {
    return (
      <div className="w-full my-4">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-6">Cargando proyectos...</h2>
          <div className="space-y-4" style={{ minHeight: `${projectsPerPage * 48}px` }}>
            {Array.from({ length: projectsPerPage }).map((_, index) => (
              <div key={index} className="flex items-center h-12">
                <div className="flex-shrink-0 mr-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
                </div>
                <div className="flex-1">
                  <div className="bg-gray-200 rounded-full h-10 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Convertir datos de la API al formato esperado por el componente
  const projectsData: Project[] = statisticsData.projects.map((project) => {
    const categoryId = project.tipo_proyecto_nombre.toLowerCase();
    const categoryData = statisticsData.categories.find(
      (cat) => cat.name.toLowerCase() === project.tipo_proyecto_nombre.toLowerCase()
    );
    
    const percentTotal = statisticsData.totalVotes > 0 
      ? (project.votos_count / statisticsData.totalVotes) * 100 
      : 0;
    
    const percentCategory = categoryData && categoryData.count > 0 
      ? (project.votos_count / categoryData.count) * 100 
      : 0;

    return {
      id: project.id,
      id_proyecto: project.id_proyecto, // Agregar el ID visual
      title: project.nombre,
      category: `Proyectos ${project.tipo_proyecto_nombre}`,
      categoryId: categoryId,
      percentTotal: percentTotal,
      percentCategory: percentCategory,
      votes: project.votos_count,
      color: categoryColors[categoryId]?.color || "#6B7280",
    };
  });

  // Filtrar proyectos según la categoría seleccionada
  const filteredProjects =
    selectedCategory === "todos"
      ? projectsData
      : projectsData.filter(
          (project) => project.categoryId === selectedCategory
        );

  // Ordenar proyectos por número de votos (de mayor a menor)
  const sortedProjects = [...filteredProjects].sort(
    (a, b) => b.votes - a.votes
  );

  // Calcular proyectos para la página actual
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = sortedProjects.slice(
    indexOfFirstProject,
    indexOfLastProject
  ) as Project[];

  // Rellenar con proyectos vacíos si no hay suficientes para mantener altura constante
  const emptyProjectsNeeded = projectsPerPage - currentProjects.length;
  const projectsWithFillers: (Project | null)[] = [...currentProjects];

  if (emptyProjectsNeeded > 0) {
    for (let i = 0; i < emptyProjectsNeeded; i++) {
      projectsWithFillers.push(null);
    }
  }

  // Cambiar de página
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Encontrar el valor máximo para escalar las barras
  const maxVotes = Math.max(...sortedProjects.map((project) => project.votes), 1);

  return (
    <div className="w-full my-4">
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-xl font-semibold mb-6">
          {selectedCategory && selectedCategory !== "todos"
            ? `Proyectos ${
                selectedCategory.charAt(0).toUpperCase() +
                selectedCategory.slice(1)
              }`
            : "Todos los Proyectos"}
        </h2>

        {sortedProjects.length > 0 ? (
          <div>
            {/* Contenedor con altura fija para mantener consistencia */}
            <div
              className="space-y-4"
              style={{ minHeight: `${projectsPerPage * 48}px` }}
            >
              {projectsWithFillers.map((project, index) => {
                if (!project)
                  return <div key={`empty-${index}`} className="h-12"></div>;

                const barWidth = "100%";
                const categoryColor = categoryColors[project.categoryId] || {
                  bg: "bg-gray-100",
                  text: "text-gray-800",
                  color: "#6B7280",
                };
                const percentage = project.percentTotal.toFixed(1);

                // Calcular el ancho de la barra interna que muestra el progreso real
                const progressWidth = `${(project.votes / maxVotes) * 100}%`;

                return (
                  <div key={project.id} className="flex items-center h-12">
                    <div className="flex-shrink-0 mr-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium">
                        {project.id_proyecto}
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="relative">
                        <div className="flex-1 bg-gray-100 rounded-full h-10 overflow-hidden">
                          {/* Barra de fondo completa (gris) */}
                          <div
                            className="bg-gray-200 h-full rounded-full flex items-center relative"
                            style={{ width: barWidth }}
                          >
                            {/* Barra de progreso interna con el color pastel de la categoría */}
                            <div
                              className={`absolute top-0 left-0 h-full ${categoryColor.bg}`}
                              style={{ width: progressWidth }}
                            ></div>

                            {/* Contenido siempre visible */}
                            <div className="flex justify-between items-center w-full px-3 z-10">
                              <span className="text-sm font-medium text-gray-800 truncate max-w-[60%]">
                                {project.title}
                              </span>
                              <span className="text-sm font-bold text-gray-800">
                                {project.votes}{" "}
                                <span className="text-xs font-light">
                                  votos
                                </span>{" "}
                                | {percentage}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Paginación */}
            <div className="flex justify-center mt-6">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded ${
                    currentPage === 1
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                  }`}
                >
                  Anterior
                </button>

                {Array.from({
                  length: Math.ceil(sortedProjects.length / projectsPerPage),
                }).map((_, index) => {
                  if (
                    index + 1 === 1 ||
                    index + 1 ===
                      Math.ceil(sortedProjects.length / projectsPerPage) ||
                    (index + 1 >= currentPage - 2 &&
                      index + 1 <= currentPage + 2)
                  ) {
                    return (
                      <button
                        key={index}
                        onClick={() => paginate(index + 1)}
                        className={`px-3 py-1 rounded ${
                          currentPage === index + 1
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        {index + 1}
                      </button>
                    );
                  } else if (
                    index + 1 === currentPage - 3 ||
                    index + 1 === currentPage + 3
                  ) {
                    return <span key={index}>...</span>;
                  }
                  return null;
                })}

                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={
                    currentPage ===
                    Math.ceil(sortedProjects.length / projectsPerPage)
                  }
                  className={`px-3 py-1 rounded ${
                    currentPage ===
                    Math.ceil(sortedProjects.length / projectsPerPage)
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                  }`}
                >
                  Siguiente
                </button>
              </nav>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No hay proyectos disponibles para esta categoría
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsList;
