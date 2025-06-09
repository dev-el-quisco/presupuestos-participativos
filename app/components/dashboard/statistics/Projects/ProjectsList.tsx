"use client";

import { useYear } from "@/app/context/YearContext";
import { useFilter } from "@/app/context/FilterContext";
import { useState, useEffect } from "react";

const ProjectsList = () => {
  const { selectedYear } = useYear();
  const { selectedCategory } = useFilter();
  const [windowWidth, setWindowWidth] = useState(0);

  // Datos de ejemplo para los proyectos
  const projectsData = [
    {
      id: "C1",
      title: "Mejoramiento de plazas públicas",
      category: "Proyectos Comunales",
      categoryId: "comunales",
      percentTotal: 19.7,
      percentCategory: 47.1,
      votes: 1155,
      color: "bg-green-500",
    },
    {
      id: "C2",
      title: "Iluminación LED en calles principales",
      category: "Proyectos Comunales",
      categoryId: "comunales",
      percentTotal: 8.2,
      percentCategory: 19.6,
      votes: 481,
      color: "bg-green-500",
    },
    {
      id: "C3",
      title: "Creación de áreas verdes",
      category: "Proyectos Comunales",
      categoryId: "comunales",
      percentTotal: 7.3,
      percentCategory: 17.4,
      votes: 428,
      color: "bg-green-500",
    },
    {
      id: "C4",
      title: "Sistema de seguridad vecinal",
      category: "Proyectos Comunales",
      categoryId: "comunales",
      percentTotal: 6.6,
      percentCategory: 15.9,
      votes: 389,
      color: "bg-green-500",
    },
    {
      id: "I1",
      title: "Parque infantil inclusivo",
      category: "Proyectos Infantiles",
      categoryId: "infantiles",
      percentTotal: 11.5,
      percentCategory: 35.8,
      votes: 671,
      color: "bg-blue-500",
    },
    {
      id: "I2",
      title: "Talleres de arte para niños",
      category: "Proyectos Infantiles",
      categoryId: "infantiles",
      percentTotal: 8.6,
      percentCategory: 26.8,
      votes: 503,
      color: "bg-blue-500",
    },
    {
      id: "I3",
      title: "Biblioteca infantil comunitaria",
      category: "Proyectos Infantiles",
      categoryId: "infantiles",
      percentTotal: 5.7,
      percentCategory: 17.9,
      votes: 336,
      color: "bg-blue-500",
    },
    {
      id: "I4",
      title: "Escuela de verano municipal",
      category: "Proyectos Infantiles",
      categoryId: "infantiles",
      percentTotal: 3.6,
      percentCategory: 11.1,
      votes: 208,
      color: "bg-blue-500",
    },
    {
      id: "D1",
      title: "Mejoramiento de canchas deportivas",
      category: "Proyectos Deportivos",
      categoryId: "deportivos",
      percentTotal: 7.0,
      percentCategory: 41.7,
      votes: 412,
      color: "bg-yellow-500",
    },
    {
      id: "D2",
      title: "Implementación de máquinas de ejercicio",
      category: "Proyectos Deportivos",
      categoryId: "deportivos",
      percentTotal: 4.7,
      percentCategory: 27.7,
      votes: 273,
      color: "bg-yellow-500",
    },
    {
      id: "D3",
      title: "Escuelas deportivas municipales",
      category: "Proyectos Deportivos",
      categoryId: "deportivos",
      percentTotal: 3.0,
      percentCategory: 17.5,
      votes: 173,
      color: "bg-yellow-500",
    },
    {
      id: "CU1",
      title: "Festival cultural comunitario",
      category: "Proyectos Culturales",
      categoryId: "culturales",
      percentTotal: 3.6,
      percentCategory: 39.7,
      votes: 212,
      color: "bg-red-500",
    },
    {
      id: "CU2",
      title: "Talleres de arte y cultura",
      category: "Proyectos Culturales",
      categoryId: "culturales",
      percentTotal: 2.4,
      percentCategory: 26.8,
      votes: 143,
      color: "bg-red-500",
    },
    {
      id: "CU3",
      title: "Murales comunitarios",
      category: "Proyectos Culturales",
      categoryId: "culturales",
      percentTotal: 1.6,
      percentCategory: 17.0,
      votes: 91,
      color: "bg-red-500",
    },
    {
      id: "C1",
      title: "Mejoramiento de plazas públicas",
      category: "Proyectos Comunales",
      categoryId: "comunales",
      percentTotal: 19.7,
      percentCategory: 47.1,
      votes: 1155,
      color: "bg-green-500",
    },
    {
      id: "C2",
      title: "Iluminación LED en calles principales",
      category: "Proyectos Comunales",
      categoryId: "comunales",
      percentTotal: 8.2,
      percentCategory: 19.6,
      votes: 481,
      color: "bg-green-500",
    },
    {
      id: "C3",
      title: "Creación de áreas verdes",
      category: "Proyectos Comunales",
      categoryId: "comunales",
      percentTotal: 7.3,
      percentCategory: 17.4,
      votes: 428,
      color: "bg-green-500",
    },
    {
      id: "C4",
      title: "Sistema de seguridad vecinal",
      category: "Proyectos Comunales",
      categoryId: "comunales",
      percentTotal: 6.6,
      percentCategory: 15.9,
      votes: 389,
      color: "bg-green-500",
    },
    {
      id: "I1",
      title: "Parque infantil inclusivo",
      category: "Proyectos Infantiles",
      categoryId: "infantiles",
      percentTotal: 11.5,
      percentCategory: 35.8,
      votes: 671,
      color: "bg-blue-500",
    },
    {
      id: "I2",
      title: "Talleres de arte para niños",
      category: "Proyectos Infantiles",
      categoryId: "infantiles",
      percentTotal: 8.6,
      percentCategory: 26.8,
      votes: 503,
      color: "bg-blue-500",
    },
    {
      id: "I3",
      title: "Biblioteca infantil comunitaria",
      category: "Proyectos Infantiles",
      categoryId: "infantiles",
      percentTotal: 5.7,
      percentCategory: 17.9,
      votes: 336,
      color: "bg-blue-500",
    },
    {
      id: "I4",
      title: "Escuela de verano municipal",
      category: "Proyectos Infantiles",
      categoryId: "infantiles",
      percentTotal: 3.6,
      percentCategory: 11.1,
      votes: 208,
      color: "bg-blue-500",
    },
    {
      id: "D1",
      title: "Mejoramiento de canchas deportivas",
      category: "Proyectos Deportivos",
      categoryId: "deportivos",
      percentTotal: 7.0,
      percentCategory: 41.7,
      votes: 412,
      color: "bg-yellow-500",
    },
    {
      id: "D2",
      title: "Implementación de máquinas de ejercicio",
      category: "Proyectos Deportivos",
      categoryId: "deportivos",
      percentTotal: 4.7,
      percentCategory: 27.7,
      votes: 273,
      color: "bg-yellow-500",
    },
    {
      id: "D3",
      title: "Escuelas deportivas municipales",
      category: "Proyectos Deportivos",
      categoryId: "deportivos",
      percentTotal: 3.0,
      percentCategory: 17.5,
      votes: 173,
      color: "bg-yellow-500",
    },
    {
      id: "CU1",
      title: "Festival cultural comunitario",
      category: "Proyectos Culturales",
      categoryId: "culturales",
      percentTotal: 3.6,
      percentCategory: 39.7,
      votes: 212,
      color: "bg-red-500",
    },
    {
      id: "CU2",
      title: "Talleres de arte y cultura",
      category: "Proyectos Culturales",
      categoryId: "culturales",
      percentTotal: 2.4,
      percentCategory: 26.8,
      votes: 143,
      color: "bg-red-500",
    },
    {
      id: "CU3",
      title: "Murales comunitarios",
      category: "Proyectos Culturales",
      categoryId: "culturales",
      percentTotal: 1.6,
      percentCategory: 17.0,
      votes: 91,
      color: "bg-red-500",
    },
    {
      id: "C1",
      title: "Mejoramiento de plazas públicas",
      category: "Proyectos Comunales",
      categoryId: "comunales",
      percentTotal: 19.7,
      percentCategory: 47.1,
      votes: 1155,
      color: "bg-green-500",
    },
    {
      id: "C2",
      title: "Iluminación LED en calles principales",
      category: "Proyectos Comunales",
      categoryId: "comunales",
      percentTotal: 8.2,
      percentCategory: 19.6,
      votes: 481,
      color: "bg-green-500",
    },
    {
      id: "C3",
      title: "Creación de áreas verdes",
      category: "Proyectos Comunales",
      categoryId: "comunales",
      percentTotal: 7.3,
      percentCategory: 17.4,
      votes: 428,
      color: "bg-green-500",
    },
    {
      id: "C4",
      title: "Sistema de seguridad vecinal",
      category: "Proyectos Comunales",
      categoryId: "comunales",
      percentTotal: 6.6,
      percentCategory: 15.9,
      votes: 389,
      color: "bg-green-500",
    },
    {
      id: "I1",
      title: "Parque infantil inclusivo",
      category: "Proyectos Infantiles",
      categoryId: "infantiles",
      percentTotal: 11.5,
      percentCategory: 35.8,
      votes: 671,
      color: "bg-blue-500",
    },
    {
      id: "I2",
      title: "Talleres de arte para niños",
      category: "Proyectos Infantiles",
      categoryId: "infantiles",
      percentTotal: 8.6,
      percentCategory: 26.8,
      votes: 503,
      color: "bg-blue-500",
    },
    {
      id: "I3",
      title: "Biblioteca infantil comunitaria",
      category: "Proyectos Infantiles",
      categoryId: "infantiles",
      percentTotal: 5.7,
      percentCategory: 17.9,
      votes: 336,
      color: "bg-blue-500",
    },
    {
      id: "I4",
      title: "Escuela de verano municipal",
      category: "Proyectos Infantiles",
      categoryId: "infantiles",
      percentTotal: 3.6,
      percentCategory: 11.1,
      votes: 208,
      color: "bg-blue-500",
    },
    {
      id: "D1",
      title: "Mejoramiento de canchas deportivas",
      category: "Proyectos Deportivos",
      categoryId: "deportivos",
      percentTotal: 7.0,
      percentCategory: 41.7,
      votes: 412,
      color: "bg-yellow-500",
    },
    {
      id: "D2",
      title: "Implementación de máquinas de ejercicio",
      category: "Proyectos Deportivos",
      categoryId: "deportivos",
      percentTotal: 4.7,
      percentCategory: 27.7,
      votes: 273,
      color: "bg-yellow-500",
    },
    {
      id: "D3",
      title: "Escuelas deportivas municipales",
      category: "Proyectos Deportivos",
      categoryId: "deportivos",
      percentTotal: 3.0,
      percentCategory: 17.5,
      votes: 173,
      color: "bg-yellow-500",
    },
    {
      id: "CU1",
      title: "Festival cultural comunitario",
      category: "Proyectos Culturales",
      categoryId: "culturales",
      percentTotal: 3.6,
      percentCategory: 39.7,
      votes: 212,
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

  useEffect(() => {
    // Actualizar el ancho de la ventana para hacer el componente responsivo
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize(); // Inicializar
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
          <div className="space-y-3">
            {sortedProjects.map((project) => {
              const barWidth = `${(project.votes / maxVotes) * 100}%`;

              return (
                <div key={project.id} className="flex items-start">
                  <div className="flex-shrink-0 mr-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium">
                      {project.id}
                    </div>
                  </div>

                  <div className="flex-1">
                    {/* <div className="mb-1">
                      <div className="font-medium">{project.title}</div>
                      <div className="text-xs text-gray-500">
                        {project.category}
                      </div>
                    </div> */}

                    <div className="relative mt-1">
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                          <div
                            className={`${project.color} h-full rounded-full`}
                            style={{ width: barWidth }}
                          ></div>
                        </div>
                        <div className="flex flex-col items-start">
                          <div className="ml-3 text-sm font-bold min-w-[40px] text-right">
                            {project.votes}{" "}
                            <span className="text-sm font-light">
                              votos |{" "}
                              <span className="text-sm font-bold">
                                {((project.votes * 100) / 5850).toFixed(1)}
                                <span className="text-sm font-light">% </span>
                              </span>
                            </span>
                          </div>
                          <div className="ml-3 text-sm font-bold min-w-[40px] text-right">
                            {/* {((project.votes * 100) / 5850).toFixed(1)} */}
                            {/* {"% "} */}
                            {/* <span className="text-sm font-light">de 5850</span> */}
                          </div>
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
            No hay proyectos disponibles para esta categoría
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsList;
