"use client";

import { useYear } from "@/app/context/YearContext";
import { useAuth } from "@/app/hooks/useAuth";
import { useState, useEffect } from "react";

interface SedeData {
  sede: string;
  proyectosComunales: Record<string, number>;
  proyectosInfantiles: Record<string, number>;
  proyectosJuveniles: Record<string, number>;
  proyectosSectoriales: Record<string, number>;
  total: number;
}

interface TotalesData {
  proyectosComunales: Record<string, number>;
  proyectosInfantiles: Record<string, number>;
  proyectosJuveniles: Record<string, number>;
  proyectosSectoriales: Record<string, number>;
  total: number;
}

const PollingPlaces = () => {
  const { selectedYear, isYearReady } = useYear();
  const { user } = useAuth();
  const [sedesData, setSedesData] = useState<SedeData[]>([]);
  const [totales, setTotales] = useState<TotalesData>({
    proyectosComunales: {},
    proyectosInfantiles: {},
    proyectosJuveniles: {},
    proyectosSectoriales: {},
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPollingPlacesData = async () => {
    if (!isYearReady || !selectedYear || !user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `/api/statistics/polling-places?periodo=${selectedYear}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al obtener datos de lugares de votación");
      }

      const data = await response.json();

      if (data.success) {
        setSedesData(data.data.sedes);
        setTotales(data.data.totales);
      } else {
        throw new Error(data.error || "Error desconocido");
      }
    } catch (err) {
      console.error("Error fetching polling places data:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPollingPlacesData();
  }, [isYearReady, selectedYear, user?.id]);

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center py-8">
        <div className="text-gray-600">
          Cargando datos de lugares de votación...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex justify-center items-center py-8">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (sedesData.length === 0) {
    return (
      <div className="w-full flex justify-center items-center py-8">
        <div className="text-gray-600">
          No hay datos disponibles para el año {selectedYear}
        </div>
      </div>
    );
  }

  // Obtener todas las claves únicas para las columnas
  const comunalesKeys = Object.keys(totales.proyectosComunales).sort();
  const infantilesKeys = Object.keys(totales.proyectosInfantiles).sort();
  const juvenilesKeys = Object.keys(totales.proyectosJuveniles).sort();
  const sectorialesKeys = Object.keys(totales.proyectosSectoriales).sort();

  return (
    <div className="w-full overflow-x-auto shadow-md rounded-lg my-6 bg-white">
      <table className="min-w-max w-full text-sm text-left text-gray-700">
        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
          <tr>
            <th className="px-4 py-3 whitespace-nowrap min-w-[120px]">Sede</th>
            {comunalesKeys.length > 0 && (
              <th
                className="px-4 py-3 text-center whitespace-nowrap"
                colSpan={comunalesKeys.length}
              >
                Proyectos Comunales
              </th>
            )}
            {infantilesKeys.length > 0 && (
              <th
                className="px-4 py-3 text-center whitespace-nowrap"
                colSpan={infantilesKeys.length}
              >
                Proyectos Infantiles
              </th>
            )}
            {juvenilesKeys.length > 0 && (
              <th
                className="px-4 py-3 text-center whitespace-nowrap"
                colSpan={juvenilesKeys.length}
              >
                Proyectos Juveniles
              </th>
            )}
            {sectorialesKeys.length > 0 && (
              <th
                className="px-4 py-3 text-center whitespace-nowrap"
                colSpan={sectorialesKeys.length}
              >
                Proyectos Sectoriales
              </th>
            )}
            <th className="px-4 py-3 text-center whitespace-nowrap min-w-[80px]">
              Total
            </th>
          </tr>
          <tr>
            <th className="px-4 py-2 whitespace-nowrap"></th>
            {comunalesKeys.map((key) => (
              <th
                key={key}
                className="px-2 py-2 text-center whitespace-nowrap min-w-[80px]"
              >
                {key}
              </th>
            ))}
            {infantilesKeys.map((key) => (
              <th
                key={key}
                className="px-2 py-2 text-center whitespace-nowrap min-w-[80px]"
              >
                {key}
              </th>
            ))}
            {juvenilesKeys.map((key) => (
              <th
                key={key}
                className="px-2 py-2 text-center whitespace-nowrap min-w-[80px]"
              >
                {key}
              </th>
            ))}
            {sectorialesKeys.map((key) => (
              <th
                key={key}
                className="px-2 py-2 text-center whitespace-nowrap min-w-[80px]"
              >
                {key}
              </th>
            ))}
            <th className="px-2 py-2 text-center whitespace-nowrap">Votos</th>
          </tr>
        </thead>
        <tbody>
          {sedesData.map((sede, index) => (
            <tr
              key={index}
              className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
            >
              <td className="px-4 py-3 font-medium whitespace-nowrap">
                {sede.sede}
              </td>
              {comunalesKeys.map((key) => (
                <td
                  key={key}
                  className="px-2 py-2 text-center whitespace-nowrap"
                >
                  {sede.proyectosComunales[key] || 0}
                </td>
              ))}
              {infantilesKeys.map((key) => (
                <td
                  key={key}
                  className="px-2 py-2 text-center whitespace-nowrap"
                >
                  {sede.proyectosInfantiles[key] || 0}
                </td>
              ))}
              {juvenilesKeys.map((key) => (
                <td
                  key={key}
                  className="px-2 py-2 text-center whitespace-nowrap"
                >
                  {sede.proyectosJuveniles[key] || 0}
                </td>
              ))}
              {sectorialesKeys.map((key) => (
                <td
                  key={key}
                  className="px-2 py-2 text-center whitespace-nowrap"
                >
                  {sede.proyectosSectoriales[key] || 0}
                </td>
              ))}
              <td className="px-2 py-2 text-center font-bold whitespace-nowrap">
                {sede.total}
              </td>
            </tr>
          ))}
          {/* Fila de totales */}
          <tr className="bg-gray-100 font-semibold">
            <td className="px-4 py-3 whitespace-nowrap">TOTAL</td>
            {comunalesKeys.map((key) => (
              <td key={key} className="px-2 py-2 text-center whitespace-nowrap">
                {totales.proyectosComunales[key] || 0}
              </td>
            ))}
            {infantilesKeys.map((key) => (
              <td key={key} className="px-2 py-2 text-center whitespace-nowrap">
                {totales.proyectosInfantiles[key] || 0}
              </td>
            ))}
            {juvenilesKeys.map((key) => (
              <td key={key} className="px-2 py-2 text-center whitespace-nowrap">
                {totales.proyectosJuveniles[key] || 0}
              </td>
            ))}
            {sectorialesKeys.map((key) => (
              <td key={key} className="px-2 py-2 text-center whitespace-nowrap">
                {totales.proyectosSectoriales[key] || 0}
              </td>
            ))}
            <td className="px-2 py-2 text-center font-bold whitespace-nowrap">
              {totales.total}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default PollingPlaces;
