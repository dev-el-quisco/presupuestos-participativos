import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/database";
import { TYPES } from "tedious";
import { verifyToken } from "@/app/lib/auth";

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
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Token de autorización requerido" },
        { status: 401 }
      );
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const periodo = searchParams.get("periodo");

    if (!periodo) {
      return NextResponse.json(
        { error: "Periodo es requerido" },
        { status: 400 }
      );
    }

    // Construir condiciones de filtro para mesas
    let mesaJoinCondition = "";
    let mesaWhereCondition = "";
    const params: any[] = [
      { name: "param1", type: TYPES.Int, value: parseInt(periodo) },
    ];

    // Filtrar por mesas cerradas y permisos según el rol
    if (
      user.rol === "Digitador" ||
      user.rol === "Ministro de Fe" ||
      user.rol === "Encargado de Local"
    ) {
      mesaJoinCondition = `
        INNER JOIN mesas mesa_filter ON v.id_mesa = mesa_filter.id 
        INNER JOIN permisos perm ON mesa_filter.id = perm.id_mesa AND perm.id_usuario = @param2 AND perm.periodo = @param3
      `;
      mesaWhereCondition = "AND mesa_filter.estado_mesa = 0";
      params.push(
        { name: "param2", type: TYPES.UniqueIdentifier, value: user.id },
        { name: "param3", type: TYPES.Int, value: parseInt(periodo) }
      );
    } else {
      // Para Administrador: solo mesas cerradas
      mesaJoinCondition =
        "INNER JOIN mesas mesa_filter ON v.id_mesa = mesa_filter.id";
      mesaWhereCondition = "AND mesa_filter.estado_mesa = 0";
    }

    // Obtener estadísticas por tipo de proyecto
    const statisticsQuery = `
      SELECT 
        tp.id as tipo_proyecto_id,
        tp.nombre as tipo_proyecto_nombre,
        COALESCE(vote_counts.total_votos, 0) as total_votos,
        COALESCE(project_counts.total_proyectos, 0) as total_proyectos
      FROM tipo_proyectos tp
      LEFT JOIN (
        SELECT 
          p.id_tipo_proyecto,
          COUNT(DISTINCT p.id) as total_proyectos
        FROM proyectos p
        WHERE p.periodo = @param1
        GROUP BY p.id_tipo_proyecto
      ) project_counts ON tp.id = project_counts.id_tipo_proyecto
      LEFT JOIN (
        SELECT 
          p.id_tipo_proyecto,
          COUNT(v.id) as total_votos
        FROM proyectos p
        LEFT JOIN votos v ON p.id = v.id_proyecto AND v.periodo = @param1
        ${mesaJoinCondition}
        WHERE p.periodo = @param1 ${mesaWhereCondition}
        GROUP BY p.id_tipo_proyecto
      ) vote_counts ON tp.id = vote_counts.id_tipo_proyecto
      ORDER BY tp.nombre
    `;

    const statistics = await executeQuery<VoteStatistics>(
      statisticsQuery,
      params
    );

    // Obtener votos nulos y blancos por separado
    const specialVotesQuery = `
      SELECT COUNT(v.id) as votos_especiales
      FROM votos v
      ${mesaJoinCondition}
      WHERE v.periodo = @param1 AND v.tipo_voto IN ('Nulo', 'Blanco') ${mesaWhereCondition}
    `;

    const specialVotesResult = await executeQuery<{ votos_especiales: number }>(
      specialVotesQuery,
      params
    );

    const votosEspeciales = specialVotesResult[0]?.votos_especiales || 0;

    // Calcular totales incluyendo votos especiales
    const totalVotes = statistics.reduce(
      (sum, stat) => sum + stat.total_votos,
      0
    ) + votosEspeciales;
    const totalProjects = statistics.reduce(
      (sum, stat) => sum + stat.total_proyectos,
      0
    );

    // Formatear datos para el frontend
    const formattedStats = statistics.map((stat) => ({
      id: stat.tipo_proyecto_id,
      name: stat.tipo_proyecto_nombre,
      count: stat.total_votos,
      projects: stat.total_proyectos,
      percentage: totalVotes > 0 ? (stat.total_votos / totalVotes) * 100 : 0,
    }));

    // Obtener proyectos con votos para el ranking (mantener solo votos normales para el ranking)
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
      ${mesaJoinCondition}
      WHERE p.periodo = @param1 ${mesaWhereCondition}
      GROUP BY p.id, p.id_proyecto, p.nombre, tp.nombre
      HAVING COUNT(v.id) > 0
      ORDER BY COUNT(v.id) DESC
    `;

    const projects = await executeQuery<ProjectWithVotes>(
      projectsQuery,
      params
    );

    return NextResponse.json({
      success: true,
      statistics: {
        categories: formattedStats,
        totalVotes,
        totalProjects,
        projects,
      },
    });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
