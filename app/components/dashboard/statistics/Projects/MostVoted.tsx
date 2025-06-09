"use client";

import { useYear } from "@/app/context/YearContext";
import { useState, useEffect } from "react";

const MostVoted = () => {
  const { selectedYear } = useYear();
  const [windowWidth, setWindowWidth] = useState(0);

  // Datos para el gráfico de proyectos más votados (top 5)
  const topProjects = [
    {
      id: "C1",
      title: "Mejoramiento de plazas públicas",
      votes: 1155,
      color: "bg-green-500",
      category: "Proyectos Comunales",
    },
    {
      id: "I1",
      title: "Parque infantil inclusivo",
      votes: 671,
      color: "bg-blue-500",
      category: "Proyectos Infantiles",
    },
    {
      id: "I2",
      title: "Talleres de arte para niños",
      votes: 503,
      color: "bg-blue-500",
      category: "Proyectos Infantiles",
    },
    {
      id: "C2",
      title: "Iluminación LED en calles principales",
      votes: 481,
      color: "bg-green-500",
      category: "Proyectos Comunales",
    },
    {
      id: "C3",
      title: "Creación de áreas verdes",
      votes: 428,
      color: "bg-green-500",
      category: "Proyectos Comunales",
    },
  ];

  useEffect(() => {
    // Actualizar el ancho de la ventana para hacer el gráfico responsivo
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize(); // Inicializar
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Encontrar el valor máximo para escalar las barras
  const maxVotes = Math.max(...topProjects.map((project) => project.votes));

  return (
    <div className="w-full md:w-1/2 p-4">
      <div className="bg-white rounded-lg shadow-sm p-6 h-full border border-gray-200">
        <h2 className="text-xl font-semibold mb-6">Proyectos Más Votados</h2>

        <div className="space-y-5">
          {topProjects.map((project) => {
            const barWidth = `${(project.votes / maxVotes) * 100}%`;

            return (
              <div key={project.id} className="flex items-start">
                <div className="flex-shrink-0 mr-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium">
                    {project.id}
                  </div>
                </div>

                <div className="flex-1">
                  <div className="mb-1">
                    <div className="font-medium">{project.title}</div>
                    <div className="text-xs text-gray-500">
                      {project.category}
                    </div>
                  </div>

                  <div className="relative mt-2">
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                        <div
                          className={`${project.color} h-full rounded-full`}
                          style={{ width: barWidth }}
                        ></div>
                      </div>
                      <div className="ml-3 text-sm font-bold min-w-[40px] text-right">
                        {project.votes}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MostVoted;
