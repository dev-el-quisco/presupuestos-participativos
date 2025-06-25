"use client";

import { useYear } from "@/app/context/YearContext";
import { useState, useEffect } from "react";

interface CommunalWinner {
  id_proyecto: string;
  nombre: string;
  total_votos: number;
  percent_total: number;
}

interface SectorWinner {
  categoria: string;
  sector: string;
  proyecto: {
    id_proyecto: string;
    nombre: string;
    total_votos: number;
    percent_category: number;
  };
}

interface WinnersData {
  communalWinner: CommunalWinner | null;
  sectorWinners: Record<string, SectorWinner[]>;
}

const Winners = () => {
  const { selectedYear, isYearReady } = useYear();
  const [winnersData, setWinnersData] = useState<WinnersData>({
    communalWinner: null,
    sectorWinners: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWinners = async () => {
    if (!isYearReady || !selectedYear) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/statistics/winners?periodo=${selectedYear}`
      );

      if (!response.ok) {
        throw new Error("Error al obtener proyectos ganadores");
      }

      const data = await response.json();

      if (data.success) {
        setWinnersData(data.data);
      } else {
        throw new Error(data.error || "Error desconocido");
      }
    } catch (err) {
      console.error("Error fetching winners:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWinners();
  }, [isYearReady, selectedYear]);

  // Mapeo de categorías a colores más suaves
  const categoryColors = {
    "Proyectos Comunales": {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      accent: "bg-emerald-500",
    },
    "Proyectos Infantiles": {
      bg: "bg-yellow-50",
      text: "text-yellow-700",
      border: "border-yellow-200",
      accent: "bg-yellow-500",
    },
    "Proyectos Juveniles": {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
      accent: "bg-blue-500",
    },
    "Proyectos Sectoriales": {
      bg: "bg-orange-50",
      text: "text-orange-700",
      border: "border-orange-200",
      accent: "bg-orange-500",
    },
  } as const;

  const defaultColor = {
    bg: "bg-gray-50",
    text: "text-gray-700",
    border: "border-gray-200",
    accent: "bg-gray-500",
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center py-6">
        <div className="text-gray-500 text-sm">Cargando ganadores...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex justify-center items-center py-6">
        <div className="text-red-500 text-sm">Error: {error}</div>
      </div>
    );
  }

  const hasWinners =
    winnersData.communalWinner ||
    Object.keys(winnersData.sectorWinners).length > 0;

  if (!hasWinners) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 mb-4">
        <h2 className="text-lg font-medium mb-2 flex items-center gap-2">
          🏆 <span>Proyectos Ganadores</span>
        </h2>
        <p className="text-gray-500 text-sm">
          No hay proyectos ganadores para el año {selectedYear}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 mb-4">
      <h2 className="text-lg font-medium mb-2 flex items-center gap-2">
        🏆 <span>Proyectos Ganadores</span>
      </h2>
      <p className="text-gray-500 text-sm mb-4">
        Ganadores por categoría y sector
      </p>

      <div className="space-y-4">
        {/* Ganador Comunal */}
        {winnersData.communalWinner && (
          <div className="border border-emerald-200 rounded-lg p-3 bg-emerald-50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <h3 className="text-sm font-medium text-emerald-700">
                Proyectos Comunales - Ganador General
              </h3>
            </div>
            <div className="bg-white rounded-md p-3 border border-emerald-100">
              <div className="flex justify-between items-center">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 text-sm truncate">
                    {winnersData.communalWinner.id_proyecto}:{" "}
                    {winnersData.communalWinner.nombre}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Mayor cantidad de votos
                  </p>
                </div>
                <div className="text-right ml-3 flex-shrink-0">
                  <div className="text-sm font-semibold text-emerald-600">
                    {winnersData.communalWinner.total_votos.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400">
                    {winnersData.communalWinner.percent_total}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ganadores por Sector */}
        {Object.entries(winnersData.sectorWinners).map(
          ([categoria, winners]) => {
            const categoryKey = categoria as keyof typeof categoryColors;
            const colors = categoryColors[categoryKey] || defaultColor;

            return (
              <div
                key={categoria}
                className={`border ${colors.border} rounded-lg p-3 ${colors.bg}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`w-2 h-2 ${colors.accent} rounded-full`}
                  ></div>
                  <h3 className={`text-sm font-medium ${colors.text}`}>
                    {categoria} - Por Sector
                  </h3>
                </div>
                <div className="grid gap-2">
                  {winners.map((winner, index) => (
                    <div
                      key={index}
                      className={`bg-white rounded-md p-3 border ${colors.border}`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`px-2 py-0.5 rounded text-xs ${colors.bg} ${colors.text} border ${colors.border}`}
                            >
                              {winner.sector}
                            </span>
                          </div>
                          <h4 className="font-medium text-gray-900 text-sm truncate">
                            {winner.proyecto.id_proyecto}:{" "}
                            {winner.proyecto.nombre}
                          </h4>
                        </div>
                        <div className="text-right ml-3 flex-shrink-0">
                          <div
                            className={`text-sm font-semibold ${colors.text}`}
                          >
                            {winner.proyecto.total_votos.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-400">
                            {winner.proyecto.percent_category}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
};

export default Winners;
