"use client";

import { IconFilter } from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { useYear } from "@/app/context/YearContext";

const Filter = () => {
  const [years, setYears] = useState<number[]>([]);
  const [sede, setSede] = useState("");
  
  // Usar el contexto global de año
  const { selectedYear, setSelectedYear } = useYear();

  useEffect(() => {
    // Calcular años disponibles
    const currentYear = new Date().getFullYear();
    const maxYear = currentYear + 1;
    const yearsArray = [];

    for (let year = 2025; year <= maxYear; year++) {
      yearsArray.push(year);
    }

    setYears(yearsArray);
  }, []);

  const handleFilter = () => {
    // Placeholder para futura implementación
    console.log("Filtrando por:", { year: selectedYear, sede });
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-md p-6 mb-6 mt-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div className="flex flex-col">
          <label
            htmlFor="periodo"
            className="text-sm font-medium text-gray-700 mb-1"
          >
            Periodo de Votación
          </label>
          {years.length > 0 ? (
            <select
              id="periodo"
              className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-[#30c56c] focus:border-[#30c56c] outline-none"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {years.map((y) => (
                <option key={y} value={y.toString()}>
                  {y}
                </option>
              ))}
            </select>
          ) : (
            <div className="border border-gray-300 rounded-md p-2 animate-pulse bg-gray-100 h-10" />
          )}
        </div>

        <div className="flex flex-col">
          <label
            htmlFor="sede"
            className="text-sm font-medium text-gray-700 mb-1"
          >
            Sede de Votación
          </label>
          <select
            id="sede"
            className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-[#30c56c] focus:border-[#30c56c] outline-none"
            value={sede}
            onChange={(e) => setSede(e.target.value)}
          >
            <option value="">Seleccionar sede</option>
            <option value="escuela_central">Escuela Central</option>
            <option value="centro_comunitario">Centro Comunitario</option>
            <option value="municipalidad">Municipalidad</option>
          </select>
        </div>

        <button
          onClick={handleFilter}
          className="flex items-center justify-center gap-2 bg-[#2c3e4a] text-white py-2 px-4 rounded-md hover:bg-[#30c56c] hover:text-[#e3ecea] transition-colors focus:ring-2 focus:ring-[#30c56c] focus:border-[#30c56c] outline-none"
        >
          <IconFilter size={18} />
          Filtrar
        </button>
      </div>
    </div>
  );
};

export default Filter;
