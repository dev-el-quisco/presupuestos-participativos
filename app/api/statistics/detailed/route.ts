import { executeQuery } from "@/app/lib/database";
import { TYPES } from "tedious";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/app/lib/auth";

interface ProjectRanking {
  id: string;
  id_proyecto: string;
  nombre: string;
  tipo_proyecto_nombre: string;
  total_votos: number;
  percent_total: number;
  percent_category: number;
}

interface SedeParticipation {
  sede_nombre: string;
  total_votos: number;
  percent_total: number;
}

interface CategoryLeader {
  tipo_proyecto_nombre: string;
  total_votos: number;
  percent_total: number;
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
    let sedeJoinCondition = "";
    let sedeWhereCondition = "";
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

      // Para la consulta de sede, usar un JOIN diferente
      sedeJoinCondition = `
        INNER JOIN permisos perm_sede ON m.id = perm_sede.id_mesa AND perm_sede.id_usuario = @param2 AND perm_sede.periodo = @param3
      `;
      sedeWhereCondition = "AND m.estado_mesa = 0";

      params.push(
        { name: "param2", type: TYPES.UniqueIdentifier, value: user.id },
        { name: "param3", type: TYPES.Int, value: parseInt(periodo) }
      );
    } else {
      // Para Administrador: solo mesas cerradas
      mesaJoinCondition =
        "INNER JOIN mesas mesa_filter ON v.id_mesa = mesa_filter.id";
      mesaWhereCondition = "AND mesa_filter.estado_mesa = 0";
      sedeJoinCondition = "";
      sedeWhereCondition = "AND m.estado_mesa = 0";
    }

    // Aplicar el mismo filtro a todas las consultas SQL existentes...
    // 1. Consulta de ranking de proyectos - CORREGIDA
    const projectsRankingQuery = `
      WITH ProjectVotes AS (
        SELECT 
          p.id,
          p.id_proyecto,
          p.nombre,
          tp.nombre as tipo_proyecto_nombre,
          COUNT(v.id) as total_votos
        FROM proyectos p
        LEFT JOIN tipo_proyectos tp ON p.id_tipo_proyecto = tp.id
        LEFT JOIN votos v ON p.id = v.id_proyecto AND v.periodo = p.periodo AND v.tipo_voto = 'Normal'
        ${mesaJoinCondition}
        WHERE p.periodo = @param1 ${mesaWhereCondition}
        GROUP BY p.id, p.id_proyecto, p.nombre, tp.nombre
      ),
      TotalVotes AS (
        SELECT SUM(total_votos) as grand_total
        FROM ProjectVotes
      ),
      CategoryTotals AS (
        SELECT 
          tipo_proyecto_nombre,
          SUM(total_votos) as category_total
        FROM ProjectVotes
        GROUP BY tipo_proyecto_nombre
      )
      SELECT 
        pv.id,
        pv.id_proyecto,
        pv.nombre,
        pv.tipo_proyecto_nombre,
        pv.total_votos,
        CASE 
          WHEN tv.grand_total > 0 THEN ROUND((CAST(pv.total_votos AS FLOAT) / tv.grand_total) * 100, 1)
          ELSE 0
        END as percent_total,
        CASE 
          WHEN ct.category_total > 0 THEN ROUND((CAST(pv.total_votos AS FLOAT) / ct.category_total) * 100, 1)
          ELSE 0
        END as percent_category
      FROM ProjectVotes pv
      CROSS JOIN TotalVotes tv
      LEFT JOIN CategoryTotals ct ON pv.tipo_proyecto_nombre = ct.tipo_proyecto_nombre
      WHERE pv.total_votos > 0
      ORDER BY pv.total_votos DESC
    `;

    const projectsRanking = await executeQuery<ProjectRanking>(
      projectsRankingQuery,
      params
    );

    // 2. Consulta de participación por sede - CORREGIDA
    const sedeParticipationQuery = `
      WITH SedeVotes AS (
        SELECT 
          s.nombre as sede_nombre,
          COUNT(v.id) as total_votos
        FROM sedes s
        LEFT JOIN mesas m ON s.id = m.sede_id AND m.periodo = @param1
        LEFT JOIN votos v ON m.id = v.id_mesa AND v.periodo = @param1 AND v.tipo_voto = 'Normal'
        ${sedeJoinCondition}
        WHERE 1=1 ${sedeWhereCondition}
        GROUP BY s.id, s.nombre
      ),
      TotalVotes AS (
        SELECT SUM(total_votos) as grand_total
        FROM SedeVotes
      )
      SELECT TOP 1
        sv.sede_nombre,
        sv.total_votos,
        CASE 
          WHEN tv.grand_total > 0 THEN ROUND((CAST(sv.total_votos AS FLOAT) / tv.grand_total) * 100, 1)
          ELSE 0
        END as percent_total
      FROM SedeVotes sv
      CROSS JOIN TotalVotes tv
      WHERE sv.total_votos > 0
      ORDER BY sv.total_votos DESC
    `;

    const sedeParticipation = await executeQuery<SedeParticipation>(
      sedeParticipationQuery,
      params
    );

    // 3. Consulta de categoría líder - CORREGIDA
    const categoryLeaderQuery = `
      WITH CategoryVotes AS (
        SELECT 
          tp.nombre as tipo_proyecto_nombre,
          COUNT(v.id) as total_votos
        FROM tipo_proyectos tp
        LEFT JOIN proyectos p ON tp.id = p.id_tipo_proyecto AND p.periodo = @param1
        LEFT JOIN votos v ON p.id = v.id_proyecto AND v.periodo = @param1 AND v.tipo_voto = 'Normal'
        ${mesaJoinCondition}
        WHERE 1=1 ${mesaWhereCondition}
        GROUP BY tp.id, tp.nombre
      ),
      TotalVotes AS (
        SELECT SUM(total_votos) as grand_total
        FROM CategoryVotes
      )
      SELECT TOP 1
        cv.tipo_proyecto_nombre,
        cv.total_votos,
        CASE 
          WHEN tv.grand_total > 0 THEN ROUND((CAST(cv.total_votos AS FLOAT) / tv.grand_total) * 100, 1)
          ELSE 0
        END as percent_total
      FROM CategoryVotes cv
      CROSS JOIN TotalVotes tv
      WHERE cv.total_votos > 0
      ORDER BY cv.total_votos DESC
    `;

    const categoryLeader = await executeQuery<CategoryLeader>(
      categoryLeaderQuery,
      params
    );

    // Obtener proyecto más votado
    const topProject = projectsRanking.length > 0 ? projectsRanking[0] : null;

    return NextResponse.json({
      success: true,
      data: {
        projectsRanking: projectsRanking.map((project, index) => ({
          position: index + 1,
          id: project.id_proyecto,
          title: project.nombre,
          category: `Proyectos ${project.tipo_proyecto_nombre}`,
          categoryId: project.tipo_proyecto_nombre.toLowerCase(),
          votes: project.total_votos,
          percentTotal: project.percent_total,
          percentCategory: project.percent_category,
        })),
        generalInfo: {
          topProject: topProject
            ? {
                votes: topProject.total_votos,
                name: `${topProject.id_proyecto}: ${topProject.nombre}`,
                category: `Proyectos ${topProject.tipo_proyecto_nombre}`,
              }
            : null,
          topSede:
            sedeParticipation.length > 0
              ? {
                  votes: sedeParticipation[0].total_votos,
                  name: sedeParticipation[0].sede_nombre,
                  percentage: sedeParticipation[0].percent_total,
                }
              : null,
          topCategory:
            categoryLeader.length > 0
              ? {
                  votes: categoryLeader[0].total_votos,
                  name: `Proyectos ${categoryLeader[0].tipo_proyecto_nombre}`,
                  percentage: categoryLeader[0].percent_total,
                }
              : null,
        },
      },
    });
  } catch (error) {
    console.error("Error al obtener datos detallados:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
