"use client";

import { IconFilter } from "@tabler/icons-react";
import { useState } from "react";

const Filter = () => {
  const [year, setYear] = useState("2025");
  const [sede, setSede] = useState("");

  const handleFilter = () => {
    // Placeholder para futura implementación
    console.log("Filtrando por:", { year, sede });
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
          <select
            id="periodo"
            className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-[#30c56c] focus:border-[#30c56c] outline-none"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
          </select>
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
