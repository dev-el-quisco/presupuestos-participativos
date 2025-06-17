"use client";

import { useYear } from "@/app/context/YearContext";
import { useFilter } from "@/app/context/FilterContext";

const Filter = () => {
  const { selectedYear } = useYear();
  const { selectedCategory, setSelectedCategory } = useFilter();

  const filterData = {
    todos: {
      title: "Todos los Proyectos",
      count: 5850,
      percentage: 100,
      projects: 14,
      color: "bg-gray-200",
      textColor: "text-gray-800",
      borderColor: "ring-gray-500",
      bottomBorderColor: "border-gray-500",
    },
    comunales: {
      title: "Proyectos Comunales",
      count: 2453,
      percentage: 41.9,
      projects: 4,
      color: "bg-green-100",
      textColor: "text-green-800",
      borderColor: "ring-green-500",
      bottomBorderColor: "border-green-500",
    },
    infantiles: {
      title: "Proyectos Infantiles",
      count: 1876,
      percentage: 32.1,
      projects: 4,
      color: "bg-blue-100",
      textColor: "text-blue-800",
      borderColor: "ring-blue-500",
      bottomBorderColor: "border-blue-500",
    },
    deportivos: {
      title: "Proyectos Deportivos",
      count: 987,
      percentage: 16.9,
      projects: 3,
      color: "bg-yellow-100",
      textColor: "text-yellow-800",
      borderColor: "ring-yellow-500",
      bottomBorderColor: "border-yellow-500",
    },
    culturales: {
      title: "Proyectos Culturales",
      count: 534,
      percentage: 9.1,
      projects: 3,
      color: "bg-red-100",
      textColor: "text-red-800",
      borderColor: "ring-red-500",
      bottomBorderColor: "border-red-500",
    },
  };

  const handleCategorySelect = (category: string) => {
    if (selectedCategory === category) {
      setSelectedCategory("todos"); // Cambiado de null a "todos" para siempre tener una selección
    } else {
      setSelectedCategory(category);
    }
  };

  return (
    <div className="w-full my-6">
      <div className="flex flex-wrap gap-2">
        {Object.entries(filterData).map(([key, data]) => {
          // Solo marcar como seleccionada la categoría específica, no todas cuando es "todos"
          const isSelected = selectedCategory === key;

          const selectedClass = isSelected
            ? `ring-2 ring-offset-2 ${data.borderColor}`
            : "";
          const selectedBottomBorder = isSelected
            ? `border-b-4 ${data.bottomBorderColor}`
            : "";

          return (
            <div
              key={key}
              className={`flex-1 min-w-[180px] ${data.color} rounded-lg shadow-sm overflow-hidden cursor-pointer transition-all ${selectedClass}`}
              onClick={() => handleCategorySelect(key)}
              style={{
                opacity: isSelected ? 1 : 0.6,
                transition: "opacity 300ms",
              }}
            >
              <div
                className={`p-4 ${selectedBottomBorder} flex flex-col justify-between`}
              >
                <h3 className={`font-medium ${data.textColor}`}>
                  {data.title}
                </h3>
                <div className="flex items-baseline mt-2">
                  <span className="text-3xl font-bold">
                    {typeof window !== "undefined"
                      ? data.count.toLocaleString()
                      : data.count}
                    <span className="text-sm font-light"> votos</span>
                  </span>
                  <span className="ml-auto text-md text-gray-700">
                    {data.percentage}%
                  </span>
                </div>
                <div className="hidden md:block w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className={`h-2 rounded-full`}
                    style={{
                      width: `${data.percentage}%`,
                      backgroundColor:
                        key === "todos"
                          ? "#6B7280"
                          : getColorFromTextColor(data.textColor),
                      opacity: isSelected ? 1 : 0.6,
                      transition: "opacity 300ms, width 500ms ease-in-out",
                    }}
                  ></div>
                </div>
                {/* <p className="text-sm mt-2 text-gray-500">
                  {data.projects} proyectos
                </p> */}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

function getColorFromTextColor(textColor: string) {
  const colorMap: Record<string, string> = {
    "text-gray-800": "#1F2937",
    "text-green-800": "#065F46",
    "text-blue-800": "#1E40AF",
    "text-yellow-800": "#92400E",
    "text-red-800": "#991B1B",
  };

  return colorMap[textColor] || "#6B7280";
}

export default Filter;
