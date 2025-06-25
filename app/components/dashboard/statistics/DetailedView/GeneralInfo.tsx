"use client";

import { IconTrendingUp } from "@tabler/icons-react";
import { useYear } from "@/app/context/YearContext";
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
  const [generalInfo, setGeneralInfo] = useState<GeneralInfoData>({
    topProject: null,
    topSede: null,
    topCategory: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGeneralInfo = async () => {
    if (!isYearReady || !selectedYear) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/statistics/detailed?periodo=${selectedYear}`
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
  }, [isYearReady, selectedYear]);

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center py-8">
        <div className="text-gray-600">Cargando información general...</div>
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

  // Preparar datos para las tarjetas
  const infoCards = [
    {
      title: "Proyecto Más Votado",
      value: generalInfo.topProject?.votes.toLocaleString() || "0",
      description: generalInfo.topProject?.name || "Sin datos",
      subtext: generalInfo.topProject?.category || "N/A",
      color: "text-green-600",
    },
    {
      title: "Sede con Mayor Participación",
      value: generalInfo.topSede?.votes.toLocaleString() || "0",
      description: generalInfo.topSede?.name || "Sin datos",
      subtext: generalInfo.topSede
        ? `${generalInfo.topSede.percentage}% del total`
        : "N/A",
      color: "text-blue-600",
    },
    {
      title: "Categoría Líder",
      value: generalInfo.topCategory?.votes.toLocaleString() || "0",
      description: generalInfo.topCategory?.name || "Sin datos",
      subtext: generalInfo.topCategory
        ? `${generalInfo.topCategory.percentage}% del total`
        : "N/A",
      color: "text-green-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
      {infoCards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 flex flex-col"
        >
          <h3 className="text-lg font-semibold mb-2 flex items-center">
            <IconTrendingUp className="mr-2" size={20} />
            {card.title}
          </h3>
          <div className={`text-3xl font-bold ${card.color} my-2`}>
            {card.value}
          </div>
          <div className="text-md font-medium">{card.description}</div>
          <div className="text-sm text-gray-500 mt-1">{card.subtext}</div>
        </div>
      ))}
    </div>
  );
};

export default GeneralInfo;
