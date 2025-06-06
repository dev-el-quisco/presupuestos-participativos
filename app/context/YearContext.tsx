"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";

type YearContextType = {
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  syncYearWithUrl: (pathname: string) => void;
};

const YearContext = createContext<YearContextType | undefined>(undefined);

export function YearProvider({
  children,
  initialYear,
}: {
  children: ReactNode;
  initialYear?: string;
}) {
  const currentYear = new Date().getFullYear().toString();
  const [selectedYear, setSelectedYear] = useState(initialYear || currentYear);

  // Función para sincronizar el año con la URL
  const syncYearWithUrl = (pathname: string) => {
    // Verificar si la ruta comienza con /dashboard
    if (pathname.startsWith("/dashboard/")) {
      // Extraer el año de la URL usando una expresión regular
      const match = pathname.match(/\/dashboard\/([0-9]{4})/);
      if (match && match[1]) {
        const yearFromUrl = match[1];
        // Solo actualizar si es diferente al año actual en el contexto
        if (yearFromUrl !== selectedYear) {
          setSelectedYear(yearFromUrl);
        }
      } else if (pathname === "/dashboard" || pathname === "/dashboard/") {
        // Si la URL es solo /dashboard sin año, mantener el año actual del contexto
        // No es necesario hacer nada aquí, ya que el estado ya tiene el año correcto
      }
    }
  };

  return (
    <YearContext.Provider value={{ selectedYear, setSelectedYear, syncYearWithUrl }}>
      {children}
    </YearContext.Provider>
  );
}

export function useYear() {
  const context = useContext(YearContext);
  if (context === undefined) {
    throw new Error("useYear debe ser usado dentro de un YearProvider");
  }
  return context;
}
