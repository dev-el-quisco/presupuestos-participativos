"use client";

import { useYear } from "@/app/context/YearContext";
import { useState, useEffect } from "react";

const DistributionByCategory = () => {
  const { selectedYear } = useYear();
  const [windowWidth, setWindowWidth] = useState(0);

  // Datos para el gráfico de distribución por categoría
  const categoryData = [
    {
      name: "Proyectos Comunales",
      value: 41.9,
      color: "#10B981", // verde
      colorClass: "bg-green-500",
    },
    {
      name: "Proyectos Infantiles",
      value: 32.1,
      color: "#3B82F6", // azul
      colorClass: "bg-blue-500",
    },
    {
      name: "Proyectos Deportivos",
      value: 16.9,
      color: "#F59E0B", // amarillo
      colorClass: "bg-yellow-500",
    },
    {
      name: "Proyectos Culturales",
      value: 9.1,
      color: "#EF4444", // rojo
      colorClass: "bg-red-500",
    },
  ];

  useEffect(() => {
    // Actualizar el ancho de la ventana para hacer el gráfico responsivo
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize(); // Inicializar
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Calcular dimensiones del gráfico
  const size = Math.min(windowWidth > 768 ? 300 : 200, 300);
  const radius = size / 2;
  const centerX = radius;
  const centerY = radius;

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

    return { ...category, path };
  });

  return (
    <div className="w-full md:w-1/2 p-4">
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
            {categoryData.map((item, index) => (
              <div key={index} className="flex items-center">
                <div
                  className={`w-4 h-4 ${item.colorClass} rounded-sm mr-2`}
                ></div>
                <span className="text-sm">
                  {item.name} ({item.value}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistributionByCategory;
