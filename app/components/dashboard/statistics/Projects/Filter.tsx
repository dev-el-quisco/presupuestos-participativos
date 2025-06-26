"use client";

import { useState, useEffect } from "react";
import { useYear } from "@/app/context/YearContext";
import { useFilter } from "@/app/context/FilterContext";

interface CategoryData {
  id: string;
  name: string;
  count: number;
  projects: number;
  percentage: number;
}

interface StatisticsData {
  categories: CategoryData[];
  totalVotes: number;
  totalProjects: number;
}

const Filter = () => {
  const { selectedYear, isYearReady } = useYear(); // Agregar isYearReady
  const { selectedCategory, setSelectedCategory } = useFilter();
  const [statisticsData, setStatisticsData] = useState<StatisticsData | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  // Mapeo de colores por tipo de proyecto
  const getColorConfig = (categoryName: string) => {
    const colorMap: Record<string, any> = {
      Comunales: {
        color: "bg-green-100",
        textColor: "text-green-800",
        borderColor: "ring-green-500",
        bottomBorderColor: "border-green-500",
      },
      Infantiles: {
        color: "bg-yellow-100",
        textColor: "text-yellow-800",
        borderColor: "ring-yellow-500",
        bottomBorderColor: "border-yellow-500",
      },
      Juveniles: {
        color: "bg-blue-100",
        textColor: "text-blue-800",
        borderColor: "ring-blue-500",
        bottomBorderColor: "border-blue-500",
      },
      Sectoriales: {
        color: "bg-orange-100",
        textColor: "text-orange-800",
        borderColor: "ring-orange-500",
        bottomBorderColor: "border-orange-500",
      },
    };

    return (
      colorMap[categoryName] || {
        color: "bg-gray-100",
        textColor: "text-gray-800",
        borderColor: "ring-gray-500",
        bottomBorderColor: "border-gray-500",
      }
    );
  };

  useEffect(() => {
    const fetchStatistics = async () => {
      if (!isYearReady || !selectedYear) return; // Verificar isYearReady

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
  }, [selectedYear, isYearReady]); // Agregar isYearReady a dependencias

  const handleCategorySelect = (category: string) => {
    if (selectedCategory === category) {
      setSelectedCategory("todos");
    } else {
      setSelectedCategory(category);
    }
  };

  if (loading || !statisticsData) {
    return (
      <div className="w-full my-6">
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex-1 min-w-[180px] bg-gray-200 rounded-lg shadow-sm h-24 animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  // Crear datos del filtro incluyendo "Todos"
  const filterData = {
    todos: {
      title: "Todos los Proyectos",
      count: statisticsData.totalVotes,
      percentage: 100,
      projects: statisticsData.totalProjects,
      color: "bg-gray-200",
      textColor: "text-gray-800",
      borderColor: "ring-gray-500",
      bottomBorderColor: "border-gray-500",
    },
    ...Object.fromEntries(
      statisticsData.categories.map((category) => {
        const colorConfig = getColorConfig(category.name);
        return [
          category.name.toLowerCase(),
          {
            title: `Proyectos ${category.name}`,
            count: category.count,
            percentage: category.percentage,
            projects: category.projects,
            ...colorConfig,
          },
        ];
      })
    ),
  };

  return (
    <div className="w-full my-6">
      <div className="flex flex-wrap gap-2">
        {Object.entries(filterData).map(([key, data]) => {
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
                className={`p-4 ${selectedBottomBorder} flex flex-row md:flex-col items-center md:items-stretch justify-between`}
              >
                <h3 className={`font-medium ${data.textColor}`}>
                  {data.title}
                </h3>
                <div className="flex items-baseline md:mt-2 space-x-2 md:space-x-0">
                  <span className="text-3xl font-bold">
                    {typeof window !== "undefined"
                      ? data.count.toLocaleString()
                      : data.count}
                    <span className="text-sm font-light"> votos</span>
                  </span>
                  <span className="ml-auto text-md text-gray-700">
                    {data.percentage.toFixed(1)}%
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
    "text-orange-800": "#efa844",
  };

  return colorMap[textColor] || "#6B7280";
}

export default Filter;
