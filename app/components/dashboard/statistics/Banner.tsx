"use client";

import { IconFileExport } from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { useYear } from "@/app/context/YearContext";
import { useRouter, usePathname } from "next/navigation";

const Banner = () => {
  const [years, setYears] = useState<number[]>([]);

  const { selectedYear, setSelectedYear } = useYear();

  const router = useRouter();
  const pathname = usePathname();

  const totalVotos = 5850;

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const maxYear = currentYear + 1;
    const yearsArray: number[] = [];

    for (let year = 2025; year <= maxYear; year++) {
      yearsArray.push(year);
    }

    setYears(yearsArray);
  }, []);

  const handleExport = () => {
    console.log("Exportando datos para el año:", selectedYear);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = e.target.value;
    setSelectedYear(newYear);

    const pathSegments = pathname.split("/").filter(Boolean);

    let currentCategory = "general";

    const estadisticasIndex = pathSegments.indexOf("estadisticas");

    if (
      estadisticasIndex !== -1 &&
      estadisticasIndex + 1 < pathSegments.length
    ) {
      currentCategory = pathSegments[estadisticasIndex + 1];
    } else if (
      estadisticasIndex !== -1 &&
      estadisticasIndex + 1 === pathSegments.length
    ) {
      currentCategory = "general";
    }

    const newUrl = `/dashboard/${newYear}/estadisticas/${currentCategory}`;

    router.push(newUrl);
  };

  return (
    <div className="flex flex-col lg:flex-row lg:space-x-2 space-y-2 lg:space-y-0 w-full justify-end my-auto">
      <div className="bg-gray-100 rounded-lg px-4 py-2 w-fit">
        <div className="flex flex-row items-center justify-start space-x-1">
          <span className="text-sm text-gray-600 hidden md:block">
            Total de votos:{" "}
          </span>
          <span className="text-sm text-gray-600 block md:hidden">Votos: </span>
          <span className="text-xl font-bold">{totalVotos}</span>
        </div>
      </div>

      <div className="flex flex-row justify-between space-x-2">
        {years.length > 0 && (
          <div className="relative">
            <select
              value={selectedYear}
              onChange={handleYearChange}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 hover:bg-[#d4f3e4] focus:ring-2 focus:ring-[#30c56c] focus:border-[#30c56c] outline-none"
            >
              {years.map((year) => (
                <option key={year} value={year.toString()}>
                  Periodo: {year}
                </option>
              ))}
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
        )}

        <button
          onClick={handleExport}
          className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2 hover:bg-[#30c56c] hover:text-[#e3ecea] transition-colors focus:ring-2 focus:ring-[#30c56c] focus:border-[#30c56c] outline-none"
        >
          <IconFileExport size={20} />
          <span>Exportar</span>
        </button>
      </div>
    </div>
  );
};

export default Banner;
