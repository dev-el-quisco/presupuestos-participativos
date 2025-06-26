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

const DistributionByCategory = () => {
  const { selectedYear, isYearReady } = useYear(); // Agregar isYearReady
  const { selectedCategory } = useFilter();
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
  const radius = size / 2;
  const centerX = radius;
  const centerY = radius;

  // Preparar datos para el gráfico
  const categoryData = statisticsData.categories
    .filter((cat) => cat.percentage > 0)
    .map((category) => {
      const colorConfig = getColorConfig(category.name);
      return {
        name: category.name,
        value: category.percentage,
        ...colorConfig,
      };
    });

  // Generar el gráfico circular
  let startAngle = 0;
  const paths = categoryData.map((category) => {
    const angle = (category.value / 100) * 360;
    const endAngle = startAngle + angle;

    // Convertir ángulos a radianes
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    // Calcular puntos del arco
    const x1 = centerX + radius * Math.sin(startRad);
    const y1 = centerY - radius * Math.cos(startRad);
    const x2 = centerX + radius * Math.sin(endRad);
    const y2 = centerY - radius * Math.cos(endRad);

    // Determinar si el arco es mayor a 180 grados
    const largeArcFlag = angle > 180 ? 1 : 0;

    // Crear el path SVG
    const path = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

    // Actualizar el ángulo de inicio para el siguiente sector
    startAngle = endAngle;

    // Determinar si esta categoría está seleccionada
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
            <svg width={size} height={size}>
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
              {/* Círculo central para efecto de dona */}
              <circle cx={centerX} cy={centerY} r={radius * 0.6} fill="white" />
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
