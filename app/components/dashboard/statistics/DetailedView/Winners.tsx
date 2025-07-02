"use client";

import { useYear } from "@/app/context/YearContext";
import { useAuth } from "@/app/context/AuthContext";
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
  const { user } = useAuth();
  const [winnersData, setWinnersData] = useState<WinnersData>({
    communalWinner: null,
    sectorWinners: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRequestInProgress, setIsRequestInProgress] = useState(false);

  const fetchWinners = async (retryCount = 0) => {
    if (!isYearReady || !selectedYear || !user?.id || isRequestInProgress) return;

    try {
      setIsRequestInProgress(true);
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("auth_token");
      
      if (!token) {
        setError("Token de autenticación no encontrado");
        return;
      }
  
      // Verificar si el token está próximo a expirar
      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        const timeUntilExpiry = tokenPayload.exp - currentTime;
        
        // Si el token expira en menos de 5 minutos, intentar refrescar
        if (timeUntilExpiry < 300) {
          console.warn('Token próximo a expirar, considera refrescar la sesión');
        }
      } catch (tokenError) {
        console.warn('Error al verificar token:', tokenError);
      }
  
      const response = await fetch(
        `/api/statistics/winners?periodo=${selectedYear}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      if (!response.ok) {
        if (response.status === 401) {
          if (retryCount < 2) {
            console.warn(`Token inválido, reintentando (intento ${retryCount + 1})...`);
            // Esperar un poco más entre reintentos para tokens inválidos
            setIsRequestInProgress(false);
            setTimeout(() => fetchWinners(retryCount + 1), 2000);
            return;
          } else {
            // Después de 2 reintentos, sugerir renovar sesión
            setError("Sesión expirada. Por favor, inicia sesión nuevamente.");
            return;
          }
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
  
      const data = await response.json();
  
      if (data.success) {
        setWinnersData(data.data);
      } else {
        throw new Error(data.error || "Error desconocido");
      }
    } catch (err) {
      console.error("Error fetching winners:", err);
      if (retryCount < 2) {
        console.warn(`Reintentando después de error (intento ${retryCount + 1})...`);
        setIsRequestInProgress(false);
        setTimeout(() => fetchWinners(retryCount + 1), 3000);
      } else {
        setError(err instanceof Error ? err.message : "Error desconocido");
      }
    } finally {
      setLoading(false);
      setIsRequestInProgress(false);
    }
  };

  useEffect(() => {
    // Debounce para evitar múltiples llamadas rápidas
    const timeoutId = setTimeout(() => {
      fetchWinners();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [isYearReady, selectedYear, user?.id]);

  // Mapeo de categorías a colores más suaves
  const categoryColors = {
    "Proyectos Comunales": {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      accent: "bg-emerald-500",
      badge: "bg-emerald-100",
    },
    "Proyectos Infantiles": {
      bg: "bg-yellow-50",
      text: "text-yellow-700",
      border: "border-yellow-200",
      accent: "bg-yellow-500",
      badge: "bg-yellow-100",
    },
    "Proyectos Juveniles": {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
      accent: "bg-blue-500",
      badge: "bg-blue-100",
    },
    "Proyectos Sectoriales": {
      bg: "bg-orange-50",
      text: "text-orange-700",
      border: "border-orange-200",
      accent: "bg-orange-500",
      badge: "bg-orange-100",
    },
  } as const;

  const defaultColor = {
    bg: "bg-gray-50",
    text: "text-gray-700",
    border: "border-gray-200",
    accent: "bg-gray-500",
    badge: "bg-gray-100",
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center py-4 sm:py-6">
        <div className="text-gray-500 text-sm">Cargando ganadores...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex justify-center items-center py-4 sm:py-6">
        <div className="text-red-500 text-sm">Error: {error}</div>
      </div>
    );
  }

  const hasWinners =
    winnersData.communalWinner ||
    Object.keys(winnersData.sectorWinners).length > 0;

  if (!hasWinners) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 border border-gray-200 mb-3 sm:mb-4">
        <h2 className="text-base sm:text-lg font-medium mb-2 flex items-center gap-2">
          🏆 <span>Proyectos Ganadores</span>
        </h2>
        <p className="text-gray-500 text-sm">
          No hay proyectos ganadores para el año {selectedYear}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 border border-gray-200 mb-3 sm:mb-4">
      <h2 className="text-base sm:text-lg font-medium mb-2 flex items-center gap-2">
        🏆 <span>Proyectos Ganadores</span>
      </h2>
      <p className="text-gray-500 text-sm mb-3 sm:mb-4">
        Ganadores por categoría y sector
      </p>

      <div className="space-y-3 sm:space-y-4">
        {/* Ganador Comunal */}
        {winnersData.communalWinner && (
          <div className="border border-emerald-200 rounded-lg p-2 sm:p-3 bg-emerald-50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0"></div>
              <h3 className="text-xs sm:text-sm font-medium text-emerald-700">
                Proyectos Comunales - Ganador General
              </h3>
            </div>
            <div className="bg-white rounded-md p-2 sm:p-3 border border-emerald-100">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1 mb-1">
                      <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded text-xs font-medium flex-shrink-0">
                        {winnersData.communalWinner.id_proyecto}
                      </span>
                      <h4 className="font-medium text-gray-900 text-xs sm:text-sm leading-tight">
                        {winnersData.communalWinner.nombre}
                      </h4>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Mayor cantidad de votos
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm sm:text-base font-semibold text-emerald-600">
                      {winnersData.communalWinner.total_votos.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400">
                      {winnersData.communalWinner.percent_total}%
                    </div>
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
                className={`border ${colors.border} rounded-lg p-2 sm:p-3 ${colors.bg}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`w-2 h-2 ${colors.accent} rounded-full flex-shrink-0`}
                  ></div>
                  <h3
                    className={`text-xs sm:text-sm font-medium ${colors.text}`}
                  >
                    {categoria} - Por Sector
                  </h3>
                </div>
                <div className="space-y-2">
                  {winners.map((winner, index) => (
                    <div
                      key={index}
                      className={`bg-white rounded-md p-2 sm:p-3 border ${colors.border}`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap text-balance items-center gap-1 mb-1">
                              <span
                                className={`${colors.badge} ${colors.text} px-1.5 py-0.5 rounded text-xs font-medium flex-shrink-0`}
                              >
                                {winner.sector}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-1">
                              <span className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded text-xs font-medium flex-shrink-0">
                                {winner.proyecto.id_proyecto}
                              </span>
                              <h4 className="font-medium text-gray-900 text-xs sm:text-sm leading-tight">
                                {winner.proyecto.nombre}
                              </h4>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div
                              className={`text-sm sm:text-base font-semibold ${colors.text}`}
                            >
                              {winner.proyecto.total_votos.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-400">
                              {winner.proyecto.percent_category}%
                            </div>
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
