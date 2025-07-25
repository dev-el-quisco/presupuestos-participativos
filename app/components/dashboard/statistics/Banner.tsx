"use client";
import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { IconFileExport } from "@tabler/icons-react";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import { useAuth } from "@/app/hooks/useAuth";

interface BannerProps {
  totalVotos: number;
  years: number[];
  selectedYear: string;
  setSelectedYear: (year: string) => void;
}

interface TotalesData {
  proyectosComunales: Record<string, number>;
  proyectosInfantiles: Record<string, number>;
  proyectosJuveniles: Record<string, number>;
  proyectosSectoriales: Record<string, number>;
  total: Record<string, number>;
}

interface CommunalWinner {
  id_proyecto: string;
  nombre: string;
  total_votos: number;
  percent_total: number;
}

interface SectorWinner {
  categoria: string;
  sector: string;
  proyecto: {
    id_proyecto: string;
    nombre: string;
    total_votos: number;
    percent_category: number;
  };
}

interface WinnersData {
  communalWinner: CommunalWinner | null;
  sectorWinners: Record<string, SectorWinner[]>;
}

interface MesaStatusData {
  totalMesas: number;
  mesasCerradas: number;
  todasCerradas: boolean;
  mesasAbiertas: number;
  totalVotantes: number; // Agregar esta línea
}

const Banner: React.FC<BannerProps> = ({
  totalVotos,
  years,
  selectedYear,
  setSelectedYear,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const [winnersData, setWinnersData] = useState<WinnersData>({
    communalWinner: null,
    sectorWinners: {},
  });
  const [mesaStatus, setMesaStatus] = useState<MesaStatusData>({
    totalMesas: 0,
    mesasCerradas: 0,
    todasCerradas: false,
    mesasAbiertas: 0,
    totalVotantes: 0, // Agregar esta línea
  });

  // Función para obtener el estado de las mesas
  const fetchMesaStatus = async () => {
    if (!user?.id) return;

    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `/api/statistics/mesa-status?periodo=${selectedYear}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al obtener estado de mesas");
      }

      const data = await response.json();

      if (data.success) {
        setMesaStatus(data.data);
      }
    } catch (err) {
      console.error("Error fetching mesa status:", err);
      setMesaStatus({
        totalMesas: 0,
        mesasCerradas: 0,
        todasCerradas: false,
        mesasAbiertas: 0,
        totalVotantes: 0, // Agregar esta línea
      });
    }
  };

  // Función para obtener datos de ganadores
  const fetchWinners = async () => {
    try {
      const response = await fetch(
        `/api/statistics/winners?periodo=${selectedYear}`
      );

      if (!response.ok) {
        throw new Error("Error al obtener proyectos ganadores");
      }

      const data = await response.json();

      if (data.success) {
        setWinnersData(data.data);
      }
    } catch (err) {
      console.error("Error fetching winners:", err);
    }
  };

  // Efecto para cargar datos cuando cambia el año
  useEffect(() => {
    if (selectedYear && user?.id) {
      // Solo llamar a mesa-status, no a winners (lo maneja Winners.tsx)
      fetchMesaStatus();
    }
  }, [selectedYear, user?.id]);

  const exportPollingPlacesData = async () => {
    try {
      toast.loading("Exportando datos...", { id: "export" });

      // Obtener el token de autorización
      const token = localStorage.getItem("auth_token");

      if (!token) {
        throw new Error("No se encontró token de autorización");
      }

      // Obtener datos de sedes y totales
      const response = await fetch(
        `/api/statistics/polling-places?periodo=${selectedYear}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error("Error al obtener los datos");
      }

      const { sedes, totales } = data.data;

      // Obtener datos de ganadores
      const winnersResponse = await fetch(
        `/api/statistics/winners?periodo=${selectedYear}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      let winnersData: WinnersData = {
        communalWinner: null,
        sectorWinners: {},
      };

      if (winnersResponse.ok) {
        const winnersResult = await winnersResponse.json();
        if (winnersResult.success) {
          // Actualiza la variable local, no solo el estado
          winnersData = winnersResult.data;
          setWinnersData(winnersResult.data);
        }
      }

      // Validar que los datos existan
      if (!sedes || !totales) {
        throw new Error("Datos incompletos recibidos del servidor");
      }

      // Obtener todas las claves de proyectos con validaciones adicionales
      const comunalesKeys = Object.keys(totales?.proyectosComunales || {});
      const infantilesKeys = Object.keys(totales?.proyectosInfantiles || {});
      const juvenilesKeys = Object.keys(totales?.proyectosJuveniles || {});
      const sectorialesKeys = Object.keys(totales?.proyectosSectoriales || {});

      // Validar que al menos tengamos algunos datos
      if (
        comunalesKeys.length === 0 &&
        infantilesKeys.length === 0 &&
        juvenilesKeys.length === 0 &&
        sectorialesKeys.length === 0
      ) {
        throw new Error("No hay datos de proyectos disponibles para exportar");
      }

      // Ordenar las claves
      comunalesKeys.sort();
      infantilesKeys.sort();
      juvenilesKeys.sort();
      sectorialesKeys.sort();

      // === HOJA PRINCIPAL ===
      const mainData = [
        ["RESULTADOS POR SEDE Y POR PROYECTO - PERIODO " + selectedYear],
        [""],
        // Primera fila de encabezado: Solo las categorías
        [
          "SEDE",
          ...Array(comunalesKeys.length).fill("PROYECTOS COMUNALES"),
          ...Array(infantilesKeys.length).fill("PROYECTOS INFANTILES"),
          ...Array(juvenilesKeys.length).fill("PROYECTOS JUVENILES"),
          ...Array(sectorialesKeys.length).fill("PROYECTOS SECTORIALES"),
          "VOTOS BLANCOS",
          "VOTOS NULOS",
          "TOTAL VOTOS",
        ],
        // Segunda fila de encabezado: Solo los nombres de los proyectos
        [
          "", // Celda vacía debajo de SEDE
          ...comunalesKeys,
          ...infantilesKeys,
          ...juvenilesKeys,
          ...sectorialesKeys,
          "", // Celda vacía debajo de VOTOS BLANCOS
          "", // Celda vacía debajo de VOTOS NULOS
          "", // Celda vacía debajo de TOTAL VOTOS
        ],
        ...sedes.map((sede: any) => [
          sede.sede,
          ...comunalesKeys.map((key) => sede.proyectosComunales[key] || 0),
          ...infantilesKeys.map((key) => sede.proyectosInfantiles[key] || 0),
          ...juvenilesKeys.map((key) => sede.proyectosJuveniles[key] || 0),
          ...sectorialesKeys.map((key) => sede.proyectosSectoriales[key] || 0),
          sede.votosBlancos || 0,
          sede.votosNulos || 0,
          sede.total || 0,
        ]),
        [""],
        [
          "TOTAL",
          ...comunalesKeys.map((key) => totales.proyectosComunales[key] || 0),
          ...infantilesKeys.map((key) => totales.proyectosInfantiles[key] || 0),
          ...juvenilesKeys.map((key) => totales.proyectosJuveniles[key] || 0),
          ...sectorialesKeys.map(
            (key) => totales.proyectosSectoriales[key] || 0
          ),
          totales.votosBlancos || 0,
          totales.votosNulos || 0,
          totales.total || 0,
        ],
      ];

      const wsMain = XLSX.utils.aoa_to_sheet(mainData);

      // Configurar anchos de columna dinámicamente
      const totalColumns =
        1 + // SEDE
        comunalesKeys.length +
        infantilesKeys.length +
        juvenilesKeys.length +
        sectorialesKeys.length +
        3; // VOTOS BLANCOS + VOTOS NULOS + TOTAL VOTOS

      wsMain["!cols"] = [
        { wch: 25 }, // Columna SEDE
        ...Array(totalColumns - 4).fill({ wch: 18 }), // Columnas de proyectos
        { wch: 15 }, // Columna VOTOS BLANCOS
        { wch: 15 }, // Columna VOTOS NULOS
        { wch: 15 }, // Columna TOTAL VOTOS
      ];

      // Estilos mejorados con colores
      const headerStyle = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "2E75B6" } }, // Azul más oscuro
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        },
      };

      const evenRowStyle = {
        fill: { fgColor: { rgb: "FFFFFF" } }, // Blanco
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        },
      };

      const oddRowStyle = {
        fill: { fgColor: { rgb: "E8F1FF" } }, // Azul muy claro
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        },
      };

      const totalRowStyle = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "2E75B6" } }, // Mismo color que encabezado
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        },
      };

      // Aplicar estilos a las filas de encabezado (filas 3 y 4, índices 2 y 3)
      for (let headerRow = 2; headerRow <= 3; headerRow++) {
        for (let col = 0; col < totalColumns; col++) {
          const cellRef = XLSX.utils.encode_cell({ r: headerRow, c: col });
          if (!wsMain[cellRef]) wsMain[cellRef] = { v: "" };
          wsMain[cellRef].s = headerStyle;
        }
      }

      // Aplicar estilos intercalados a las filas de datos
      const dataStartRow = 4; // Después de las dos filas de encabezado
      const dataEndRow = mainData.length - 3; // Antes de la fila vacía y total

      for (let row = dataStartRow; row <= dataEndRow; row++) {
        const isEvenRow = (row - dataStartRow) % 2 === 0;
        const rowStyle = isEvenRow ? evenRowStyle : oddRowStyle;

        for (let col = 0; col < totalColumns; col++) {
          const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
          if (!wsMain[cellRef]) wsMain[cellRef] = { v: "" };
          wsMain[cellRef].s = rowStyle;
        }
      }

      // Aplicar estilos a la fila de totales (última fila)
      const totalRowIndex = mainData.length - 1;
      for (let col = 0; col < totalColumns; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: totalRowIndex, c: col });
        if (!wsMain[cellRef]) wsMain[cellRef] = { v: "" };
        wsMain[cellRef].s = totalRowStyle;
      }

      // Crear el libro de trabajo
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, wsMain, "Resultados por Sede");

      // Configurar combinaciones de celdas
      wsMain["!merges"] = [];

      // Combinar celda SEDE verticalmente (filas 3 y 4)
      wsMain["!merges"].push({
        s: { r: 2, c: 0 },
        e: { r: 3, c: 0 },
      });

      // Combinar celda TOTAL VOTOS verticalmente (filas 3 y 4)
      const totalVotosCol = totalColumns - 1;
      wsMain["!merges"].push({
        s: { r: 2, c: totalVotosCol },
        e: { r: 3, c: totalVotosCol },
      });

      // Combinar celdas horizontalmente para cada categoría en la primera fila de encabezado
      let currentCol = 1;

      // PROYECTOS COMUNALES
      if (comunalesKeys.length > 1) {
        wsMain["!merges"].push({
          s: { r: 2, c: currentCol },
          e: { r: 2, c: currentCol + comunalesKeys.length - 1 },
        });
      }
      currentCol += comunalesKeys.length;

      // PROYECTOS INFANTILES
      if (infantilesKeys.length > 1) {
        wsMain["!merges"].push({
          s: { r: 2, c: currentCol },
          e: { r: 2, c: currentCol + infantilesKeys.length - 1 },
        });
      }
      currentCol += infantilesKeys.length;

      // PROYECTOS JUVENILES
      if (juvenilesKeys.length > 1) {
        wsMain["!merges"].push({
          s: { r: 2, c: currentCol },
          e: { r: 2, c: currentCol + juvenilesKeys.length - 1 },
        });
      }
      currentCol += juvenilesKeys.length;

      // PROYECTOS SECTORIALES
      if (sectorialesKeys.length > 1) {
        wsMain["!merges"].push({
          s: { r: 2, c: currentCol },
          e: { r: 2, c: currentCol + sectorialesKeys.length - 1 },
        });
      }

      // === HOJA DE RESUMEN ===
      // const resumenData = [
      //   ["RESUMEN POR CATEGORÍAS - PERIODO " + selectedYear],
      //   [""],
      //   ["Categoría", "Total Votos"],
      //   [
      //     "Proyectos Comunales",
      //     Object.values(
      //       totales.proyectosComunales as Record<string, number>
      //     ).reduce((a: number, b: number) => a + b, 0),
      //   ],
      //   [
      //     "Proyectos Infantiles",
      //     Object.values(
      //       totales.proyectosInfantiles as Record<string, number>
      //     ).reduce((a: number, b: number) => a + b, 0),
      //   ],
      //   [
      //     "Proyectos Juveniles",
      //     Object.values(
      //       totales.proyectosJuveniles as Record<string, number>
      //     ).reduce((a: number, b: number) => a + b, 0),
      //   ],
      //   [
      //     "Proyectos Sectoriales",
      //     Object.values(
      //       totales.proyectosSectoriales as Record<string, number>
      //     ).reduce((a: number, b: number) => a + b, 0),
      //   ],
      //   [""],
      //   [
      //     "TOTAL GENERAL",
      //     Object.values(totales.total as Record<string, number>).reduce(
      //       (a: number, b: number) => a + b,
      //       0
      //     ),
      //   ],
      // ];

      // const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
      // wsResumen["!cols"] = [{ wch: 25 }, { wch: 15 }];

      // Aplicar estilos al resumen
      // const resumenHeaderStyle = {
      //   font: { bold: true, color: { rgb: "FFFFFF" } },
      //   fill: { fgColor: { rgb: "70AD47" } },
      //   alignment: { horizontal: "center", vertical: "center" },
      //   border: {
      //     top: { style: "thin" },
      //     bottom: { style: "thin" },
      //     left: { style: "thin" },
      //     right: { style: "thin" },
      //   },
      // };

      // // Aplicar estilos a los encabezados del resumen (fila 3)
      // for (let col = 0; col < 2; col++) {
      //   const cellRef = XLSX.utils.encode_cell({ r: 2, c: col });
      //   if (!wsResumen[cellRef]) wsResumen[cellRef] = { v: "" };
      //   wsResumen[cellRef].s = resumenHeaderStyle;
      // }

      // // Aplicar estilos a la fila de total general (fila 9)
      // for (let col = 0; col < 2; col++) {
      //   const cellRef = XLSX.utils.encode_cell({ r: 8, c: col });
      //   if (!wsResumen[cellRef]) wsResumen[cellRef] = { v: "" };
      //   wsResumen[cellRef].s = totalRowStyle;
      // }

      // XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen");

      // === NUEVA HOJA DE GANADORES ===
      const ganadoresData = [
        ["PROYECTOS GANADORES - PERIODO " + selectedYear],
        [""],
        [
          "Categoría",
          "Sector",
          "ID Proyecto",
          "Nombre Proyecto",
          "Total Votos",
          "Porcentaje",
        ],
      ];

      // Agregar ganador comunal (verificación mejorada)
      if (
        winnersData.communalWinner &&
        winnersData.communalWinner.id_proyecto
      ) {
        ganadoresData.push([
          "Proyectos Comunales",
          "General",
          winnersData.communalWinner.id_proyecto,
          winnersData.communalWinner.nombre,
          winnersData.communalWinner.total_votos.toString(),
          winnersData.communalWinner.percent_total + "%",
        ]);
      }

      // Agregar ganadores por sector (sintaxis corregida)
      if (
        winnersData.sectorWinners &&
        Object.keys(winnersData.sectorWinners).length > 0
      ) {
        Object.entries(winnersData.sectorWinners).forEach(
          ([categoria, winners]) => {
            // Verificar que winners sea un array válido
            if (Array.isArray(winners)) {
              winners.forEach((winner) => {
                // Verificar estructura del ganador
                if (winner?.proyecto?.id_proyecto) {
                  ganadoresData.push([
                    categoria,
                    winner.sector || "", // Manejar posible undefined
                    winner.proyecto.id_proyecto,
                    winner.proyecto.nombre || "",
                    winner.proyecto.total_votos?.toString() || "0",
                    (winner.proyecto.percent_category || 0) + "%",
                  ]);
                }
              });
            }
          }
        );
      }

      const wsGanadores = XLSX.utils.aoa_to_sheet(ganadoresData);
      wsGanadores["!cols"] = [
        { wch: 20 }, // Categoría
        { wch: 15 }, // Sector
        { wch: 15 }, // ID Proyecto
        { wch: 40 }, // Nombre Proyecto
        { wch: 12 }, // Total Votos
        { wch: 12 }, // Porcentaje
      ];

      // Aplicar estilos a la hoja de ganadores
      const ganadoresHeaderStyle = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "D4AF37" } }, // Dorado para ganadores
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        },
      };

      // Aplicar estilos a los encabezados de ganadores (fila 3)
      for (let col = 0; col < 6; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: 2, c: col });
        if (!wsGanadores[cellRef]) wsGanadores[cellRef] = { v: "" };
        wsGanadores[cellRef].s = ganadoresHeaderStyle;
      }

      // Aplicar estilos intercalados a las filas de datos de ganadores
      for (let row = 3; row < ganadoresData.length; row++) {
        const isEvenRow = (row - 3) % 2 === 0;
        const rowStyle = isEvenRow ? evenRowStyle : oddRowStyle;

        for (let col = 0; col < 6; col++) {
          const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
          if (!wsGanadores[cellRef]) wsGanadores[cellRef] = { v: "" };
          wsGanadores[cellRef].s = rowStyle;
        }
      }

      XLSX.utils.book_append_sheet(wb, wsGanadores, "Ganadores");

      // === HOJAS ADICIONALES POR CATEGORÍA ===
      // Proyectos Comunales
      if (comunalesKeys.length > 0) {
        const comunalesData = [
          ["PROYECTOS COMUNALES - PERIODO " + selectedYear],
          [""],
          ["Sede", ...comunalesKeys.sort(), "Total Comunales"],
          ...sedes.map((sede: any) => [
            sede.sede,
            ...comunalesKeys
              .sort()
              .map((key) => sede.proyectosComunales[key] || 0),
            comunalesKeys.reduce(
              (sum, key) => sum + (sede.proyectosComunales[key] || 0),
              0
            ),
          ]),
          [""],
          [
            "TOTALES",
            ...comunalesKeys
              .sort()
              .map((key) => totales.proyectosComunales[key] || 0),
            Object.values(
              totales.proyectosComunales as Record<string, number>
            ).reduce((a: number, b: number) => a + b, 0),
          ],
        ];

        const wsComunales = XLSX.utils.aoa_to_sheet(comunalesData);
        wsComunales["!cols"] = [
          { wch: 25 },
          ...comunalesKeys.map(() => ({ wch: 12 })),
          { wch: 15 },
        ];
        XLSX.utils.book_append_sheet(wb, wsComunales, "Proyectos Comunales");
      }

      // Proyectos Infantiles
      if (infantilesKeys.length > 0) {
        const infantilesData = [
          ["PROYECTOS INFANTILES - PERIODO " + selectedYear],
          [""],
          ["Sede", ...infantilesKeys.sort(), "Total Infantiles"],
          ...sedes.map((sede: any) => [
            sede.sede,
            ...infantilesKeys
              .sort()
              .map((key) => sede.proyectosInfantiles[key] || 0),
            infantilesKeys.reduce(
              (sum, key) => sum + (sede.proyectosInfantiles[key] || 0),
              0
            ),
          ]),
          [""],
          [
            "TOTALES",
            ...infantilesKeys
              .sort()
              .map((key) => totales.proyectosInfantiles[key] || 0),
            Object.values(
              totales.proyectosInfantiles as Record<string, number>
            ).reduce((a: number, b: number) => a + b, 0),
          ],
        ];

        const wsInfantiles = XLSX.utils.aoa_to_sheet(infantilesData);
        wsInfantiles["!cols"] = [
          { wch: 25 },
          ...infantilesKeys.map(() => ({ wch: 12 })),
          { wch: 15 },
        ];
        XLSX.utils.book_append_sheet(wb, wsInfantiles, "Proyectos Infantiles");
      }

      // Proyectos Juveniles
      if (juvenilesKeys.length > 0) {
        const juvenilesData = [
          ["PROYECTOS JUVENILES - PERIODO " + selectedYear],
          [""],
          ["Sede", ...juvenilesKeys.sort(), "Total Juveniles"],
          ...sedes.map((sede: any) => [
            sede.sede,
            ...juvenilesKeys
              .sort()
              .map((key) => sede.proyectosJuveniles[key] || 0),
            juvenilesKeys.reduce(
              (sum, key) => sum + (sede.proyectosJuveniles[key] || 0),
              0
            ),
          ]),
          [""],
          [
            "TOTALES",
            ...juvenilesKeys
              .sort()
              .map((key) => totales.proyectosJuveniles[key] || 0),
            Object.values(
              totales.proyectosJuveniles as Record<string, number>
            ).reduce((a: number, b: number) => a + b, 0),
          ],
        ];

        const wsJuveniles = XLSX.utils.aoa_to_sheet(juvenilesData);
        wsJuveniles["!cols"] = [
          { wch: 25 },
          ...juvenilesKeys.map(() => ({ wch: 12 })),
          { wch: 15 },
        ];
        XLSX.utils.book_append_sheet(wb, wsJuveniles, "Proyectos Juveniles");
      }

      // Proyectos Sectoriales
      if (sectorialesKeys.length > 0) {
        const sectorialesData = [
          ["PROYECTOS SECTORIALES - PERIODO " + selectedYear],
          [""],
          ["Sede", ...sectorialesKeys.sort(), "Total Sectoriales"],
          ...sedes.map((sede: any) => [
            sede.sede,
            ...sectorialesKeys
              .sort()
              .map((key) => sede.proyectosSectoriales[key] || 0),
            sectorialesKeys.reduce(
              (sum, key) => sum + (sede.proyectosSectoriales[key] || 0),
              0
            ),
          ]),
          [""],
          [
            "TOTALES",
            ...sectorialesKeys
              .sort()
              .map((key) => totales.proyectosSectoriales[key] || 0),
            Object.values(
              totales.proyectosSectoriales as Record<string, number>
            ).reduce((a: number, b: number) => a + b, 0),
          ],
        ];

        const wsSectoriales = XLSX.utils.aoa_to_sheet(sectorialesData);
        wsSectoriales["!cols"] = [
          { wch: 25 },
          ...sectorialesKeys.map(() => ({ wch: 12 })),
          { wch: 15 },
        ];
        XLSX.utils.book_append_sheet(
          wb,
          wsSectoriales,
          "Proyectos Sectoriales"
        );
      }

      // Generar y descargar el archivo
      const fileName = `resultados_presupuestos_participativos_${selectedYear}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast.success("Datos exportados exitosamente", { id: "export" });
    } catch (error) {
      console.error("Error al exportar:", error);
      toast.error("Error al exportar los datos", { id: "export" });
    }
  };

  const handleExport = () => {
    if (!mesaStatus.todasCerradas) {
      toast.error(
        "No se puede exportar hasta que todas las mesas asignadas estén cerradas"
      );
      return;
    }
    exportPollingPlacesData();
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

      {/* Nuevo contador de votantes */}
      <div className="bg-gray-100 rounded-lg px-4 py-2 w-fit">
        <div className="flex flex-row items-center justify-start space-x-1">
          <span className="text-sm text-gray-600 hidden md:block">
            Total de votantes:{" "}
          </span>
          <span className="text-sm text-gray-600 block md:hidden">
            Votantes:{" "}
          </span>
          <span className="text-xl font-bold">{mesaStatus.totalVotantes}</span>
        </div>
      </div>

      {/* Indicador de estado de mesas */}
      <div className="bg-gray-100 rounded-lg px-4 py-2 w-fit">
        <div className="flex flex-row items-center justify-start space-x-1">
          <span className="text-sm text-gray-600 hidden md:block">
            Mesas cerradas:{" "}
          </span>
          <span className="text-sm text-gray-600 block md:hidden">Mesas: </span>
          <span
            className={`text-xl font-bold ${
              mesaStatus.todasCerradas ? "text-green-600" : "text-orange-600"
            }`}
          >
            {mesaStatus.mesasCerradas}/{mesaStatus.totalMesas}
          </span>
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
          disabled={!mesaStatus.todasCerradas}
          className={`flex items-center space-x-2 border border-gray-300 rounded-lg px-4 py-2 transition-colors focus:ring-2 focus:ring-[#30c56c] focus:border-[#30c56c] outline-none ${
            mesaStatus.todasCerradas
              ? "bg-white hover:bg-[#30c56c] hover:text-[#e3ecea] cursor-pointer"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          <IconFileExport size={20} />
          <span>Exportar</span>
        </button>
      </div>
    </div>
  );
};

export default Banner;
