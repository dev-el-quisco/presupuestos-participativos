import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/database";
import { TYPES } from "tedious";

interface Voto {
  id: string;
  periodo: number;
  tipo_voto: string;
  id_proyecto: string;
  id_mesa: string;
}

interface VotoRequest {
  periodo: number;
  id_mesa: string;
  votos: {
    id_proyecto?: string;
    tipo_voto: string;
    cantidad: number;
  }[];
}

// GET - Obtener votos por mesa y periodo
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mesa_id = searchParams.get("mesa_id");
    const periodo = searchParams.get("periodo");

    if (!mesa_id || !periodo) {
      return NextResponse.json(
        { error: "Mesa ID y periodo son requeridos" },
        { status: 400 }
      );
    }

    const query = `
      SELECT 
        v.tipo_voto,
        v.id_proyecto,
        p.nombre as proyecto_nombre,
        COUNT(*) as cantidad
      FROM votos v
      LEFT JOIN proyectos p ON v.id_proyecto = p.id_proyecto AND v.periodo = p.periodo
      WHERE v.id_mesa = @param1 AND v.periodo = @param2
      GROUP BY v.tipo_voto, v.id_proyecto, p.nombre
      ORDER BY v.tipo_voto, p.nombre
    `;

    const params = [
      { name: "param1", type: TYPES.UniqueIdentifier, value: mesa_id },
      { name: "param2", type: TYPES.Int, value: parseInt(periodo) },
    ];

    const votos = await executeQuery(query, params);

    return NextResponse.json({
      success: true,
      data: votos,
    });
  } catch (error) {
    console.error("Error al obtener votos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST - Registrar votos
export async function POST(request: NextRequest) {
  try {
    const body: VotoRequest = await request.json();
    const { periodo, id_mesa, votos } = body;

    if (!periodo || !id_mesa || !votos || votos.length === 0) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    // Insertar cada voto individualmente según la cantidad
    for (const voto of votos) {
      if (voto.cantidad > 0) {
        const insertQuery = `
          INSERT INTO votos (periodo, tipo_voto, id_proyecto, id_mesa) 
          VALUES ${Array(voto.cantidad).fill('(@param1, @param2, @param3, @param4)').join(', ')}
        `;

        const params = [];
        for (let i = 0; i < voto.cantidad; i++) {
          params.push(
            { name: "param1", type: TYPES.Int, value: periodo },
            { name: "param2", type: TYPES.VarChar, value: voto.tipo_voto },
            { name: "param3", type: TYPES.VarChar, value: voto.id_proyecto || null },
            { name: "param4", type: TYPES.UniqueIdentifier, value: id_mesa }
          );
        }

        await executeQuery(insertQuery, params);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Votos registrados exitosamente",
    });
  } catch (error) {
    console.error("Error al registrar votos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}