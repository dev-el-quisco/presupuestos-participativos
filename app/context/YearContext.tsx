"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";

type YearContextType = {
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  syncYearWithUrl: (pathname: string) => void;
  isYearReady: boolean;
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
  const [isYearReady, setIsYearReady] = useState(false);

  // Función para sincronizar el año con la URL - SIN dependencia en selectedYear
  const syncYearWithUrl = useCallback((pathname: string) => {
    // Verificar si la ruta comienza con /dashboard
    if (pathname.startsWith("/dashboard/")) {
      // Extraer el año de la URL usando una expresión regular
      const match = pathname.match(/\/dashboard\/([0-9]{4})/);
      if (match && match[1]) {
        const yearFromUrl = match[1];
        // Actualizar el año directamente sin comparar con selectedYear
        setSelectedYear(yearFromUrl);
        setIsYearReady(true);
      } else if (pathname === "/dashboard" || pathname === "/dashboard/") {
        // Si la URL es solo /dashboard sin año, mantener el año actual del contexto
        setIsYearReady(true);
      }
    }
  }, []); // Sin dependencias para evitar bucles infinitos

  // Marcar como listo cuando se inicializa
  useEffect(() => {
    if (!isYearReady) {
      setIsYearReady(true);
    }
  }, [isYearReady]);

  return (
    <YearContext.Provider value={{ selectedYear, setSelectedYear, syncYearWithUrl, isYearReady }}>
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
