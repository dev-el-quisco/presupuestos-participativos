"use client";

import { useYear } from "@/app/context/YearContext";
import { useFilter } from "@/app/context/FilterContext";
import { useAuth } from "@/app/context/AuthContext";
import { useState, useEffect } from "react";

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

const DistributionByCategory = () => {
  const { selectedYear, isYearReady } = useYear();
  const { selectedCategory } = useFilter();
  const { user } = useAuth();
  const [windowWidth, setWindowWidth] = useState(0);
  const [statisticsData, setStatisticsData] = useState<StatisticsData | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  // Mapeo de colores por categoría
  const getColorConfig = (categoryName: string) => {
    const colorMap: Record<
      string,
      { color: string; colorClass: string; key: string }
    > = {
      Comunales: {
        color: "#10B981", // Verde
        colorClass: "bg-green-500",
        key: "comunales",
      },
      Infantiles: {
        color: "#f7f139", // Amarillo
        colorClass: "bg-[#f7f139]",
        key: "infantiles",
      },
      Juveniles: {
        color: "#3B82F6", // Azul
        colorClass: "bg-blue-500",
        key: "juveniles",
      },
      Sectoriales: {
        color: "#f0a843", // Naranja
        colorClass: "bg-[#f0a843]",
        key: "sectoriales",
      },
    };

    return (
      colorMap[categoryName] || {
        color: "#6B7280",
        colorClass: "bg-gray-500",
        key: categoryName.toLowerCase(),
      }
    );
  };

  useEffect(() => {
    const fetchStatistics = async () => {
      if (!isYearReady || !selectedYear || !user?.id) return;

      try {
        setLoading(true);
        const token = localStorage.getItem("auth_token");
        const response = await fetch(
          `/api/statistics?periodo=${selectedYear}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
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
  }, [selectedYear, isYearReady, user?.id]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (loading || !statisticsData) {
    return (
      <div className="w-full pt-6 md:p-4">
        <div className="bg-white rounded-lg shadow-sm p-4 h-full border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">
            Distribución por Categoría
          </h2>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </div>
    );
  }

  // Calcular dimensiones del gráfico
  const size = Math.min(windowWidth > 768 ? 300 : 200, 300);
  const radius = size / 2 - 10;
  const centerX = size / 2;
  const centerY = size / 2;

  // Preparar datos para el gráfico
  const allCategories = ["Comunales", "Infantiles", "Juveniles", "Sectoriales"];

  const categoryData = allCategories.map((categoryName) => {
    const existingCategory = statisticsData.categories.find(
      (cat) => cat.name === categoryName
    );
    const colorConfig = getColorConfig(categoryName);

    return {
      name: categoryName,
      value: existingCategory ? existingCategory.percentage : 0,
      ...colorConfig,
    };
  });

  // Calcular votos especiales (nulos y blancos)
  const totalCategoryVotes = statisticsData.categories.reduce(
    (sum, cat) => sum + cat.count,
    0
  );
  const specialVotes = statisticsData.totalVotes - totalCategoryVotes;
  const specialVotesPercentage = statisticsData.totalVotes > 0 
    ? (specialVotes / statisticsData.totalVotes) * 100 
    : 0;

  // Agregar votos especiales si existen
  if (specialVotes > 0) {
    categoryData.push({
      name: "Votos Especiales",
      value: specialVotesPercentage,
      color: "#6B7280", // Gris
      colorClass: "bg-gray-500",
      key: "especiales",
    });
  }

  // Filtrar solo categorías con votos para el gráfico
  const categoriesWithVotes = categoryData.filter((cat) => cat.value > 0);
  
  // Función para crear un path de arco SVG
  const createArcPath = (
    startAngle: number,
    endAngle: number,
    radius: number,
    centerX: number,
    centerY: number
  ) => {
    const start = polarToCartesian(centerX, centerY, radius, endAngle);
    const end = polarToCartesian(centerX, centerY, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return [
      "M",
      centerX,
      centerY,
      "L",
      start.x,
      start.y,
      "A",
      radius,
      radius,
      0,
      largeArcFlag,
      0,
      end.x,
      end.y,
      "Z",
    ].join(" ");
  };

  // Función auxiliar para convertir coordenadas polares a cartesianas
  const polarToCartesian = (
    centerX: number,
    centerY: number,
    radius: number,
    angleInDegrees: number
  ) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  // Generar los paths para cada categoría
  let cumulativeAngle = 0;
  const paths = categoriesWithVotes.map((category) => {
    const angle = (category.value / 100) * 360;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;

    const path = createArcPath(startAngle, endAngle, radius, centerX, centerY);

    cumulativeAngle += angle;

    const isSelected =
      selectedCategory === category.key ||
      selectedCategory === "todos" ||
      selectedCategory === null;

    return { ...category, path, isSelected };
  });

  return (
    <div className="w-full pt-6 md:p-4">
      <div className="bg-white rounded-lg shadow-sm p-4 h-full border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">
          Distribución por Categoría
        </h2>

        <div className="flex flex-col md:flex-row items-center justify-center">
          {/* Gráfico circular */}
          <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
              {paths.map((item, index) => (
                <path
                  key={index}
                  d={item.path}
                  fill={item.color}
                  stroke="white"
                  strokeWidth="1"
                  opacity={item.isSelected ? 1 : 0.3}
                  className="transition-opacity duration-300"
                />
              ))}
              {/* SOLUCIÓN 2: Reducir el tamaño del círculo central */}
              <circle
                cx={centerX}
                cy={centerY}
                r={radius * 0.4} // Reducido de 0.6 a 0.4
                fill="white"
              />
              <text
                x={centerX}
                y={centerY}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-2xl font-bold"
              >
                100%
              </text>
            </svg>
          </div>

          {/* Leyenda */}
          <div className="mt-4 md:mt-0 md:ml-6 flex flex-col space-y-2">
            {categoryData.map((item, index) => {
              const isSelected =
                selectedCategory === item.key ||
                selectedCategory === "todos" ||
                selectedCategory === null;
              return (
                <div key={index} className="flex items-center">
                  <div
                    className={`w-4 h-4 ${item.colorClass} rounded-sm mr-2 transition-opacity duration-300`}
                    style={{ opacity: isSelected ? 1 : 0.3 }}
                  ></div>
                  <span
                    className={`text-sm transition-opacity duration-300`}
                    style={{ opacity: isSelected ? 1 : 0.5 }}
                  >
                    {item.name} ({item.value.toFixed(1)}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistributionByCategory;
