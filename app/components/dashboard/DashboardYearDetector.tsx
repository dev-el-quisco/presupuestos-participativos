"use client";

import { usePathname } from "next/navigation";
import { useYear } from "@/app/context/YearContext";
import { useEffect } from "react";

export default function DashboardYearDetector() {
  const pathname = usePathname();
  const { syncYearWithUrl } = useYear();

  useEffect(() => {
    // Sincronizar el año con la URL cuando cambia la ruta
    syncYearWithUrl(pathname);
  }, [pathname, syncYearWithUrl]);

  // Este componente no renderiza nada visible
  return null;
}