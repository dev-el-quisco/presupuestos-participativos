"use client";

import { useYear } from "@/app/context/YearContext";
import { useState } from "react";

const ProjectsList = () => {
  const { selectedYear } = useYear();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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
  ];

  // Filtrar proyectos según la categoría seleccionada
  const filteredProjects = selectedCategory
    ? projectsData.filter((project) => project.categoryId === selectedCategory)
    : projectsData;

  // Función para escuchar cambios en el filtro (se podría implementar con contexto o props)
  // Esta función se llamaría desde el componente Filter
  const handleFilterChange = (category: string | null) => {
    setSelectedCategory(category);
  };

  return (
    <div className="w-full my-6">
      <h2 className="text-xl font-semibold mb-4">
        {selectedCategory
          ? `Proyectos ${
              selectedCategory.charAt(0).toUpperCase() +
              selectedCategory.slice(1)
            }`
          : "Todos los Proyectos"}
      </h2>

      <div className="space-y-4">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="border rounded-lg overflow-hidden shadow-sm border-gray-300"
          >
            <div className="flex items-center">
              <div className={`${project.color} w-2 h-full self-stretch`}></div>

              <div className="flex-1 p-4">
                <div className="flex flex-col md:flex-row md:items-center">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className="inline-block w-8 h-8 rounded-full bg-gray-200 text-center leading-8 font-medium mr-2">
                        {project.id}
                      </span>
                      <h3 className="font-medium text-lg">{project.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {project.category}
                    </p>
                  </div>

                  <div className="flex flex-col md:flex-row items-start md:items-center mt-3 md:mt-0 space-y-2 md:space-y-0 md:space-x-6">
                    <div className="text-sm">
                      <span className="font-medium">% Total</span>
                      <p className="font-bold">{project.percentTotal}%</p>
                    </div>

                    <div className="text-sm">
                      <span className="font-medium">% Categoría</span>
                      <p className="font-bold">{project.percentCategory}%</p>
                    </div>

                    <div className="text-sm">
                      <span className="font-medium">Votos</span>
                      <p className="font-bold text-lg">{project.votes}</p>
                    </div>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                  <div
                    className={`h-2 rounded-full ${project.color}`}
                    style={{ width: `${project.percentCategory}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsList;
