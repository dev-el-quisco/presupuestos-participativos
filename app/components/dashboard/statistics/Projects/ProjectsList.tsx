"use client";

import { useYear } from "@/app/context/YearContext";
import { useFilter } from "@/app/context/FilterContext";
import { useState, useEffect } from "react";

// Definir las categorías válidas como un tipo
type CategoryId = "comunales" | "infantiles" | "deportivos" | "culturales";

// Definir el tipo de proyecto
type Project = {
  id: string;
  title: string;
  category: string;
  categoryId: CategoryId; // Usar el tipo CategoryId aquí
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
  const projectsPerPage = 10;

  // Mapeo de categorías a colores pasteles
  const categoryColors: Record<
    CategoryId,
    { bg: string; text: string; color: string }
  > = {
    comunales: {
      bg: "bg-green-100",
      text: "text-green-800",
      color: "#065F46",
    },
    infantiles: {
      bg: "bg-blue-100",
      text: "text-blue-800",
      color: "#1E40AF",
    },
    deportivos: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      color: "#92400E",
    },
    culturales: {
      bg: "bg-red-100",
      text: "text-red-800",
      color: "#991B1B",
    },
  };

  // Datos de ejemplo para los proyectos - Corregidos para eliminar duplicados
  const projectsData = [
    {
      id: "C1-1", // ID único
      title: "Mejoramiento de plazas públicas",
      category: "Proyectos Comunales",
      categoryId: "comunales",
      percentTotal: 19.7,
      percentCategory: 47.1,
      votes: 1155,
      color: "bg-green-500",
    },
    {
      id: "C2-1", // ID único
      title: "Iluminación LED en calles principales",
      category: "Proyectos Comunales",
      categoryId: "comunales",
      percentTotal: 8.2,
      percentCategory: 19.6,
      votes: 481,
      color: "bg-green-500",
    },
    {
      id: "C3-1", // ID único
      title: "Creación de áreas verdes",
      category: "Proyectos Comunales",
      categoryId: "comunales",
      percentTotal: 7.3,
      percentCategory: 17.4,
      votes: 428,
      color: "bg-green-500",
    },
    {
      id: "C4-1", // ID único
      title: "Sistema de seguridad vecinal",
      category: "Proyectos Comunales",
      categoryId: "comunales",
      percentTotal: 6.6,
      percentCategory: 15.9,
      votes: 389,
      color: "bg-green-500",
    },
    {
      id: "I1-1", // ID único
      title: "Parque infantil inclusivo",
      category: "Proyectos Infantiles",
      categoryId: "infantiles",
      percentTotal: 11.5,
      percentCategory: 35.8,
      votes: 671,
      color: "bg-blue-500",
    },
    {
      id: "I2-1", // ID único
      title: "Talleres de arte para niños",
      category: "Proyectos Infantiles",
      categoryId: "infantiles",
      percentTotal: 8.6,
      percentCategory: 26.8,
      votes: 503,
      color: "bg-blue-500",
    },
    {
      id: "I3-1", // ID único
      title: "Biblioteca infantil comunitaria",
      category: "Proyectos Infantiles",
      categoryId: "infantiles",
      percentTotal: 5.7,
      percentCategory: 17.9,
      votes: 336,
      color: "bg-blue-500",
    },
    {
      id: "I4-1", // ID único
      title: "Escuela de verano municipal",
      category: "Proyectos Infantiles",
      categoryId: "infantiles",
      percentTotal: 3.6,
      percentCategory: 11.1,
      votes: 208,
      color: "bg-blue-500",
    },
    {
      id: "D1-1", // ID único
      title: "Mejoramiento de canchas deportivas",
      category: "Proyectos Deportivos",
      categoryId: "deportivos",
      percentTotal: 7.0,
      percentCategory: 41.7,
      votes: 412,
      color: "bg-yellow-500",
    },
    {
      id: "D2-1", // ID único
      title: "Implementación de máquinas de ejercicio",
      category: "Proyectos Deportivos",
      categoryId: "deportivos",
      percentTotal: 4.7,
      percentCategory: 27.7,
      votes: 273,
      color: "bg-yellow-500",
    },
    {
      id: "D3-1", // ID único
      title: "Escuelas deportivas municipales",
      category: "Proyectos Deportivos",
      categoryId: "deportivos",
      percentTotal: 3.0,
      percentCategory: 17.5,
      votes: 173,
      color: "bg-yellow-500",
    },
    {
      id: "CU1-1", // ID único
      title: "Festival cultural comunitario",
      category: "Proyectos Culturales",
      categoryId: "culturales",
      percentTotal: 3.6,
      percentCategory: 39.7,
      votes: 212,
      color: "bg-red-500",
    },
    {
      id: "CU2-1", // ID único
      title: "Talleres de arte y cultura",
      category: "Proyectos Culturales",
      categoryId: "culturales",
      percentTotal: 2.4,
      percentCategory: 26.8,
      votes: 143,
      color: "bg-red-500",
    },
    {
      id: "CU3-1", // ID único
      title: "Murales comunitarios",
      category: "Proyectos Culturales",
      categoryId: "culturales",
      percentTotal: 1.6,
      percentCategory: 17.0,
      votes: 91,
      color: "bg-red-500",
    },
  ];

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
  ) as Project[]; // Asegurar que currentProjects es de tipo Project[]

  // Rellenar con proyectos vacíos si no hay suficientes para mantener altura constante
  const emptyProjectsNeeded = projectsPerPage - currentProjects.length;
  // Especificar que projectsWithFillers puede contener null
  const projectsWithFillers: (Project | null)[] = [...currentProjects];

  if (emptyProjectsNeeded > 0) {
    for (let i = 0; i < emptyProjectsNeeded; i++) {
      projectsWithFillers.push(null);
    }
  }

  // Cambiar de página
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  useEffect(() => {
    // Actualizar el ancho de la ventana para hacer el componente responsivo
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize(); // Inicializar
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Resetear a la primera página cuando cambia la categoría
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  // Encontrar el valor máximo para escalar las barras
  const maxVotes = Math.max(...sortedProjects.map((project) => project.votes));

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

                // Usar un ancho fijo del 100% para todas las barras
                const barWidth = "100%";
                // Ahora TypeScript sabe que project.categoryId es una clave válida de categoryColors
                const categoryColor = categoryColors[project.categoryId];
                const percentage = ((project.votes * 100) / 5850).toFixed(1);

                // Calcular el ancho de la barra interna que muestra el progreso real
                const progressWidth = `${(project.votes / maxVotes) * 100}%`;

                return (
                  <div key={project.id} className="flex items-center h-12">
                    <div className="flex-shrink-0 mr-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium">
                        {project.id.split("-")[0]}
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

            {/* Paginación - Ahora siempre en la misma posición */}
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
                  // Mostrar solo un rango de páginas alrededor de la página actual
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
