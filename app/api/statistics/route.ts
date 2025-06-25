import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/database";
import { TYPES } from "tedious";

interface VoteStatistics {
  tipo_proyecto_id: string;
  tipo_proyecto_nombre: string;
  total_votos: number;
  total_proyectos: number;
}

interface ProjectWithVotes {
  id: string;
  id_proyecto: string;
  nombre: string;
  tipo_proyecto_nombre: string;
  votos_count: number;
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

    // Obtener estadísticas por tipo de proyecto
    const statisticsQuery = `
      SELECT 
        tp.id as tipo_proyecto_id,
        tp.nombre as tipo_proyecto_nombre,
        COUNT(v.id) as total_votos,
        COUNT(DISTINCT p.id) as total_proyectos
      FROM tipo_proyectos tp
      LEFT JOIN proyectos p ON tp.id = p.id_tipo_proyecto AND p.periodo = @param1
      LEFT JOIN votos v ON p.id = v.id_proyecto AND v.periodo = @param1 AND v.tipo_voto = 'Normal'
      GROUP BY tp.id, tp.nombre
      ORDER BY tp.nombre
    `;

    const statistics = await executeQuery<VoteStatistics>(statisticsQuery, [
      { name: "param1", type: TYPES.Int, value: parseInt(periodo) },
    ]);

    // Calcular totales
    const totalVotes = statistics.reduce((sum, stat) => sum + stat.total_votos, 0);
    const totalProjects = statistics.reduce((sum, stat) => sum + stat.total_proyectos, 0);

    // Formatear datos para el frontend
    const formattedStats = statistics.map(stat => ({
      id: stat.tipo_proyecto_id,
      name: stat.tipo_proyecto_nombre,
      count: stat.total_votos,
      projects: stat.total_proyectos,
      percentage: totalVotes > 0 ? ((stat.total_votos / totalVotes) * 100) : 0
    }));

    // Obtener proyectos con votos para el ranking
    const projectsQuery = `
      SELECT 
        p.id,
        p.id_proyecto,
        p.nombre,
        tp.nombre as tipo_proyecto_nombre,
        COUNT(v.id) as votos_count
      FROM proyectos p
      LEFT JOIN tipo_proyectos tp ON p.id_tipo_proyecto = tp.id
      LEFT JOIN votos v ON p.id = v.id_proyecto AND v.periodo = p.periodo AND v.tipo_voto = 'Normal'
      WHERE p.periodo = @param1
      GROUP BY p.id, p.id_proyecto, p.nombre, tp.nombre
      HAVING COUNT(v.id) > 0
      ORDER BY COUNT(v.id) DESC
    `;

    const projects = await executeQuery<ProjectWithVotes>(projectsQuery, [
      { name: "param1", type: TYPES.Int, value: parseInt(periodo) },
    ]);

    return NextResponse.json({
      success: true,
      statistics: {
        categories: formattedStats,
        totalVotes,
        totalProjects,
        projects
      }
    });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}