"use client";

import { IconTrendingUp } from "@tabler/icons-react";
import { useYear } from "@/app/context/YearContext";
import { useAuth } from "@/app/context/AuthContext";
import { useState, useEffect } from "react";

interface GeneralInfoData {
  topProject: {
    votes: number;
    name: string;
    category: string;
  } | null;
  topSede: {
    votes: number;
    name: string;
    percentage: number;
  } | null;
  topCategory: {
    votes: number;
    name: string;
    percentage: number;
  } | null;
}

const GeneralInfo = () => {
  const { selectedYear, isYearReady } = useYear();
  const { user } = useAuth();
  const [generalInfo, setGeneralInfo] = useState<GeneralInfoData>({
    topProject: null,
    topSede: null,
    topCategory: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGeneralInfo = async () => {
    if (!isYearReady || !selectedYear || !user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `/api/statistics/detailed?periodo=${selectedYear}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al obtener información general");
      }

      const data = await response.json();

      if (data.success) {
        setGeneralInfo(data.data.generalInfo);
      } else {
        throw new Error(data.error || "Error desconocido");
      }
    } catch (err) {
      console.error("Error fetching general info:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGeneralInfo();
  }, [isYearReady, selectedYear, user?.id]);

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center py-4 sm:py-8">
        <div className="text-gray-600 text-sm sm:text-base">
          Cargando información general...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex justify-center items-center py-4 sm:py-8">
        <div className="text-red-600 text-sm sm:text-base">Error: {error}</div>
      </div>
    );
  }

  // Preparar datos para las tarjetas
  const infoCards = [
    {
      title: "Proyecto Más Votado",
      value: `${(generalInfo.topProject?.votes ?? 0).toLocaleString()} ${
        generalInfo.topProject?.votes === 1 ? "voto" : "votos"
      }`,
      description: generalInfo.topProject?.name || "Sin datos",
      subtext: generalInfo.topProject?.category || "N/A",
      color: "text-green-600",
    },
    {
      title: "Sede con Mayor Participación",
      value: `${(generalInfo.topSede?.votes ?? 0).toLocaleString()} ${
        generalInfo.topSede?.votes === 1 ? "votante" : "votantes"
      }`,
      description: generalInfo.topSede?.name || "Sin datos",
      subtext: generalInfo.topSede
        ? `${generalInfo.topSede.percentage}% del total de votantes`
        : "N/A",
      color: "text-blue-600",
    },
    {
      title: "Categoría Líder",
      value: `${(generalInfo.topCategory?.votes ?? 0).toLocaleString()} ${
        generalInfo.topCategory?.votes === 1 ? "voto" : "votos"
      }`,
      description: generalInfo.topCategory?.name || "Sin datos",
      subtext: generalInfo.topCategory
        ? `${generalInfo.topCategory.percentage}% del total de votos`
        : "N/A",
      color: "text-green-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 my-4 sm:my-6">
      {infoCards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-sm p-3 sm:p-6 border border-gray-200 flex flex-col"
        >
          <h3 className="text-sm sm:text-lg font-semibold mb-1 sm:mb-2 flex items-center">
            <IconTrendingUp className="mr-1 sm:mr-2" size={16} />
            <span className="text-xs sm:text-base leading-tight">
              {card.title}
            </span>
          </h3>
          <div
            className={`text-xl sm:text-3xl font-bold ${card.color} my-1 sm:my-2`}
          >
            {card.value}
          </div>
          <div className="text-sm sm:text-md font-medium leading-tight">
            {card.description}
          </div>
          <div className="text-xs sm:text-sm text-gray-500 mt-1">
            {card.subtext}
          </div>
        </div>
      ))}
    </div>
  );
};

export default GeneralInfo;
