import { executeQuery } from "@/app/lib/database";
import { TYPES } from "tedious";
import { NextRequest, NextResponse } from "next/server";

interface WinnerProject {
  id_proyecto: string;
  nombre: string;
  tipo_proyecto_nombre: string;
  sector_nombre: string | null;
  total_votos: number;
  percent_total: number;
  percent_category: number;
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const periodo = searchParams.get("periodo");

    if (!periodo) {
      return NextResponse.json(
        { error: "Periodo es requerido" },
        { status: 400 }
      );
    }

    // 1. Obtener ganador de proyectos comunales (el más votado)
    const communalWinnerQuery = `
      WITH CommunalVotes AS (
        SELECT 
          p.id_proyecto,
          p.nombre,
          COUNT(v.id) as total_votos
        FROM proyectos p
        INNER JOIN tipo_proyectos tp ON p.id_tipo_proyecto = tp.id
        LEFT JOIN votos v ON p.id = v.id_proyecto AND v.periodo = @param1 AND v.tipo_voto = 'Normal'
        WHERE p.periodo = @param1 AND LOWER(tp.nombre) LIKE '%comunal%'
        GROUP BY p.id_proyecto, p.nombre
      ),
      TotalVotes AS (
        SELECT SUM(total_votos) as grand_total
        FROM CommunalVotes
      )
      SELECT TOP 1
        cv.id_proyecto,
        cv.nombre,
        cv.total_votos,
        CASE 
          WHEN tv.grand_total > 0 THEN ROUND((CAST(cv.total_votos AS FLOAT) / tv.grand_total) * 100, 1)
          ELSE 0
        END as percent_total
      FROM CommunalVotes cv
      CROSS JOIN TotalVotes tv
      WHERE cv.total_votos > 0
      ORDER BY cv.total_votos DESC
    `;

    const communalWinner = await executeQuery<CommunalWinner>(
      communalWinnerQuery,
      [{ name: "param1", type: TYPES.Int, value: parseInt(periodo) }]
    );

    // 2. Obtener ganadores por sector para otras categorías
    const sectorWinnersQuery = `
      WITH ProjectVotes AS (
        SELECT 
          p.id_proyecto,
          p.nombre,
          tp.nombre as tipo_proyecto_nombre,
          s.nombre as sector_nombre,
          COUNT(v.id) as total_votos
        FROM proyectos p
        INNER JOIN tipo_proyectos tp ON p.id_tipo_proyecto = tp.id
        LEFT JOIN sectores s ON p.id_sector = s.id
        LEFT JOIN votos v ON p.id = v.id_proyecto AND v.periodo = @param1 AND v.tipo_voto = 'Normal'
        WHERE p.periodo = @param1 
          AND LOWER(tp.nombre) NOT LIKE '%comunal%'
          AND s.id IS NOT NULL
        GROUP BY p.id_proyecto, p.nombre, tp.nombre, s.nombre
      ),
      CategoryTotals AS (
        SELECT 
          tipo_proyecto_nombre,
          SUM(total_votos) as category_total
        FROM ProjectVotes
        GROUP BY tipo_proyecto_nombre
      ),
      RankedProjects AS (
        SELECT 
          pv.*,
          ct.category_total,
          ROW_NUMBER() OVER (PARTITION BY pv.tipo_proyecto_nombre, pv.sector_nombre ORDER BY pv.total_votos DESC) as rn
        FROM ProjectVotes pv
        LEFT JOIN CategoryTotals ct ON pv.tipo_proyecto_nombre = ct.tipo_proyecto_nombre
      )
      SELECT 
        rp.id_proyecto,
        rp.nombre,
        rp.tipo_proyecto_nombre,
        rp.sector_nombre,
        rp.total_votos,
        CASE 
          WHEN rp.category_total > 0 THEN ROUND((CAST(rp.total_votos AS FLOAT) / rp.category_total) * 100, 1)
          ELSE 0
        END as percent_category
      FROM RankedProjects rp
      WHERE rp.rn = 1 AND rp.total_votos > 0
      ORDER BY rp.tipo_proyecto_nombre, rp.sector_nombre
    `;

    const sectorWinners = await executeQuery<WinnerProject>(
      sectorWinnersQuery,
      [{ name: "param1", type: TYPES.Int, value: parseInt(periodo) }]
    );

    // Formatear datos para el frontend
    const formattedSectorWinners: SectorWinner[] = sectorWinners.map(
      (winner) => ({
        categoria: `Proyectos ${winner.tipo_proyecto_nombre}`,
        sector: winner.sector_nombre || "Sin sector",
        proyecto: {
          id_proyecto: winner.id_proyecto,
          nombre: winner.nombre,
          total_votos: winner.total_votos,
          percent_category: winner.percent_category,
        },
      })
    );

    // Agrupar por categoría
    const winnersByCategory = formattedSectorWinners.reduce((acc, winner) => {
      if (!acc[winner.categoria]) {
        acc[winner.categoria] = [];
      }
      acc[winner.categoria].push(winner);
      return acc;
    }, {} as Record<string, SectorWinner[]>);

    return NextResponse.json({
      success: true,
      data: {
        communalWinner: communalWinner.length > 0 ? communalWinner[0] : null,
        sectorWinners: winnersByCategory,
      },
    });
  } catch (error) {
    console.error("Error al obtener proyectos ganadores:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
