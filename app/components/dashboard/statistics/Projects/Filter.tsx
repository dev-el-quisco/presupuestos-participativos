"use client";

import { useYear } from "@/app/context/YearContext";
import { useState } from "react";

const Filter = () => {
  const { selectedYear } = useYear();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Datos de ejemplo para los filtros
  const filterData = {
    todos: {
      title: "Todos los Proyectos",
      count: 5850,
      percentage: 100,
      projects: 14,
      color: "bg-gray-200",
      textColor: "text-gray-800",
    },
    comunales: {
      title: "Proyectos Comunales",
      count: 2453,
      percentage: 41.9,
      projects: 4,
      color: "bg-green-100",
      textColor: "text-green-800",
    },
    infantiles: {
      title: "Proyectos Infantiles",
      count: 1876,
      percentage: 32.1,
      projects: 4,
      color: "bg-blue-100",
      textColor: "text-blue-800",
    },
    deportivos: {
      title: "Proyectos Deportivos",
      count: 987,
      percentage: 16.9,
      projects: 3,
      color: "bg-yellow-100",
      textColor: "text-yellow-800",
    },
    culturales: {
      title: "Proyectos Culturales",
      count: 534,
      percentage: 9.1,
      projects: 3,
      color: "bg-red-100",
      textColor: "text-red-800",
    },
  };

  // Función para manejar la selección de categoría
  const handleCategorySelect = (category: string) => {
    if (selectedCategory === category) {
      setSelectedCategory(null); // Deseleccionar si ya está seleccionado
    } else {
      setSelectedCategory(category);
    }

    // Aquí se podría emitir un evento o usar un contexto para comunicarse con ProjectsList
  };

  return (
    <div className="w-full my-6">
      <div className="flex flex-wrap gap-2">
        {Object.entries(filterData).map(([key, data]) => {
          const isSelected = selectedCategory === key;
          const selectedClass = isSelected
            ? "ring-2 ring-offset-2 ring-blue-500"
            : "";
          const selectedBottomBorder = isSelected
            ? "border-b-4 border-blue-500"
            : "";

          return (
            <div
              key={key}
              className={`flex-1 min-w-[180px] ${data.color} rounded-lg shadow-sm overflow-hidden cursor-pointer transition-all ${selectedClass}`}
              onClick={() => handleCategorySelect(key)}
            >
              <div className={`p-4 ${selectedBottomBorder}`}>
                <h3 className={`font-medium ${data.textColor}`}>
                  {data.title}
                </h3>
                <div className="flex items-baseline mt-2">
                  <span className="text-3xl font-bold">
                    {data.count.toLocaleString()}
                  </span>
                  <span className="ml-auto text-lg">{data.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className={`h-2 rounded-full ${
                      key === "todos"
                        ? "bg-gray-500"
                        : data.textColor.replace("text", "bg")
                    }`}
                    style={{ width: `${data.percentage}%` }}
                  ></div>
                </div>
                <p className="text-sm mt-2">{data.projects} proyectos</p>
                {isSelected && (
                  <div className="text-xs mt-1 font-medium text-center py-1 bg-white bg-opacity-50 rounded">
                    Seleccionado
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Filter;
