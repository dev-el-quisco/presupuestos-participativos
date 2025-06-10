"use client";

import { useState, useEffect } from "react";
import { useYear } from "@/app/context/YearContext";
import { useRouter, usePathname } from "next/navigation";

const Filter = () => {
  const [years, setYears] = useState<number[]>([]);

  const { selectedYear, setSelectedYear } = useYear();

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const maxYear = currentYear + 1;
    const yearsArray: number[] = [];

    for (let year = 2025; year <= maxYear; year++) {
      yearsArray.push(year);
    }

    setYears(yearsArray);
  }, []);

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = e.target.value;
    setSelectedYear(newYear);

    const pathSegments = pathname.split("/").filter(Boolean);
    const yearIndex = pathSegments.indexOf(selectedYear);

    let newPath = pathname;

    if (yearIndex !== -1) {
      const updatedPathSegments = [...pathSegments];
      updatedPathSegments[yearIndex] = newYear;
      newPath = "/" + updatedPathSegments.join("/");
    } else {
      const parts = pathname.split("/");
      if (parts[1] === "dashboard" && parts.length > 2) {
        parts[2] = newYear;
        newPath = parts.join("/");
      } else {
        console.warn(
          "Año no encontrado en la ruta actual para reemplazar. Manteniendo la ruta original con el año actualizado en contexto."
        );
      }
    }

    router.push(newPath);
  };

  return (
    <div className=" bg-white rounded-lg border border-gray-200 mt-3">
      <div className="m-3">
        <div className="flex flex-row space-x-2 items-center">
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
              onChange={handleYearChange}
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
      </div>
    </div>
  );
};

export default Filter;
