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

    // Extraer el año actual de la URL en lugar de usar selectedYear
    const pathSegments = pathname.split("/").filter(Boolean);
    const currentYearInUrl = pathSegments.find(segment => /^[0-9]{4}$/.test(segment));
    
    let newPath = pathname;

    if (currentYearInUrl) {
      // Reemplazar el año actual en la URL con el nuevo año
      newPath = pathname.replace(`/${currentYearInUrl}`, `/${newYear}`);
    } else {
      // Si no hay año en la URL, agregarlo después de /dashboard
      const parts = pathname.split("/");
      if (parts[1] === "dashboard" && parts.length > 2) {
        parts[2] = newYear;
        newPath = parts.join("/");
      } else if (parts[1] === "dashboard") {
        // Si es solo /dashboard, agregar el año
        newPath = `/dashboard/${newYear}`;
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
        <div className="flex flex-row items-center justify-evenly">
          <label
            htmlFor="periodo"
            className="text-sm font-medium text-gray-700 p-2"
          >
            Periodo de Votación
          </label>
          {years.length > 0 ? (
            <select
              id="periodo"
              className="text-sm font-medium border border-gray-300 rounded-md p-1 focus:ring-2 focus:ring-[#30c56c] focus:border-[#30c56c] outline-none"
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
