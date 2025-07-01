import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/database";
import { TYPES } from "tedious";
import { verifyToken } from "@/app/lib/auth";

interface MesaStatus {
  id: string;
  nombre: string;
  estado_mesa: boolean;
  sede_nombre: string;
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
        s.nombre as sede_nombre
      FROM mesas m
      INNER JOIN sedes s ON m.sede_id = s.id
    `;

    const params: any[] = [];
    const conditions = ["m.periodo = @param1"];
    params.push({ name: "param1", type: TYPES.Int, value: parseInt(periodo) });

    // Filtrar por permisos según el rol
    if (user.rol === "Digitador") {
      query += ` INNER JOIN permisos p ON m.id = p.id_mesa AND p.id_usuario = @param2 AND p.periodo = @param3`;
      params.push(
        { name: "param2", type: TYPES.UniqueIdentifier, value: user.id },
        { name: "param3", type: TYPES.Int, value: parseInt(periodo) }
      );
    }

    query += ` WHERE ` + conditions.join(" AND ");
    query += ` ORDER BY s.nombre, m.nombre`;

    const mesas = await executeQuery<MesaStatus>(query, params);

    const totalMesas = mesas.length;
    const mesasCerradas = mesas.filter(mesa => !mesa.estado_mesa).length;
    const todasCerradas = totalMesas > 0 && mesasCerradas === totalMesas;

    return NextResponse.json({
      success: true,
      data: {
        mesas,
        totalMesas,
        mesasCerradas,
        todasCerradas,
        mesasAbiertas: totalMesas - mesasCerradas
      }
    });
  } catch (error) {
    console.error("Error al obtener estado de mesas:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}