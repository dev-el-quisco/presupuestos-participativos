import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/database";
import { TYPES } from "tedious";
import { verifyToken } from "@/app/lib/auth";

interface MesaWithPermissions {
  id: string;
  nombre: string;
  estado_mesa: boolean;
  sede_id: string;
  periodo: number;
  sede_nombre: string;
  votos_count: number;
  votantes_count: number;
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

    let query = `
      SELECT 
        m.id,
        m.nombre,
        m.estado_mesa,
        m.sede_id,
        m.periodo,
        s.nombre as sede_nombre,
        COUNT(DISTINCT v.id) as votos_count,
        COUNT(DISTINCT vt.id) as votantes_count
      FROM mesas m
      INNER JOIN sedes s ON m.sede_id = s.id
      LEFT JOIN votos v ON m.id = v.id_mesa AND v.periodo = m.periodo
      LEFT JOIN votantes vt ON m.id = vt.id_mesa AND vt.periodo = m.periodo
    `;

    const params: any[] = [];
    const conditions = ["m.periodo = @param1"];
    params.push({ name: "param1", type: TYPES.Int, value: parseInt(periodo) });

    // Filtrar por permisos según el rol
    if (user.rol === "Digitador" || user.rol === "Encargado de Local") {
      query += ` INNER JOIN permisos p ON m.id = p.id_mesa AND p.id_usuario = @param2 AND p.periodo = @param3`;
      params.push(
        { name: "param2", type: TYPES.UniqueIdentifier, value: user.id },
        { name: "param3", type: TYPES.Int, value: parseInt(periodo) }
      );
    }

    query += ` WHERE ` + conditions.join(" AND ");
    query += ` GROUP BY m.id, m.nombre, m.estado_mesa, m.sede_id, m.periodo, s.nombre`;
    query += ` ORDER BY s.nombre, m.nombre`;

    const mesas = await executeQuery<MesaWithPermissions>(query, params);

    return NextResponse.json({
      success: true,
      data: mesas,
      userRole: user.rol,
    });
  } catch (error) {
    console.error("Error al obtener mesas con permisos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
