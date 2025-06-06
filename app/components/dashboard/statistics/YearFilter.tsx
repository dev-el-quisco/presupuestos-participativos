// import { IconFilter } from "@tabler/icons-react";
// import { IconFileExport } from "@tabler/icons-react";

// const YearFilter = () => {
//   return <div>hola</div>;
// };

// export default YearFilter;

"use client";

import { IconFileExport } from "@tabler/icons-react";
import { useState } from "react";

const YearFilter = () => {
  const [periodo, setPeriodo] = useState("2025");

  const totalVotos = 5850;

  const handleExport = () => {
    console.log("Exportando datos...");
  };

  return (
    <div className="flex items-center space-x-4">
      {/* Total de votos */}
      <div className="bg-gray-100 rounded-lg px-4 py-2">
        <div className="flex flex-row items-center justify-center space-x-1">
          <span className="text-sm text-gray-600">Total de votos:</span>
          <span className="text-xl font-bold">{totalVotos}</span>
        </div>
      </div>

      {/* Selector de período */}
      <div className="relative">
        <select
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value)}
          className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-[#30c56c] focus:border-[#30c56c] outline-none"
        >
          <option value="2025">Periodo: 2025</option>
          <option value="2024">Periodo: 2024</option>
          <option value="2023">Periodo: 2023</option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg
            className="fill-current h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>

      {/* Botón de exportar */}
      <button
        onClick={handleExport}
        className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2 hover:bg-[#30c56c] hover:text-[#e3ecea] transition-colors focus:ring-2 focus:ring-[#30c56c] focus:border-[#30c56c] outline-none"
      >
        <IconFileExport size={20} />
        <span>Exportar</span>
      </button>
    </div>
  );
};

export default YearFilter;
