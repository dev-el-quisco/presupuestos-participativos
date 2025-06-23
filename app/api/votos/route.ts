import { executeQuery } from "@/app/lib/database";
import { TYPES } from "tedious";
import { NextRequest, NextResponse } from "next/server";

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
        CASE 
          WHEN v.id_proyecto IS NULL THEN v.tipo_voto
          ELSE p.nombre
        END as proyecto_nombre,
        COUNT(*) as cantidad
      FROM votos v
      LEFT JOIN proyectos p ON v.id_proyecto = p.id AND v.periodo = p.periodo
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
        let projectDbId = null;

        // Si es un voto normal (no blanco ni nulo), obtener el ID interno del proyecto
        if (voto.tipo_voto === "Normal" && voto.id_proyecto) {
          const projectQuery = `
            SELECT id as db_id
            FROM proyectos 
            WHERE id_proyecto = @param1 AND periodo = @param2
          `;

          const project = await executeQuery<{ db_id: string }>(projectQuery, [
            { name: "param1", type: TYPES.VarChar, value: voto.id_proyecto },
            { name: "param2", type: TYPES.Int, value: periodo },
          ]);

          if (project.length > 0) {
            projectDbId = project[0].db_id;
          }
        }

        const insertQuery = `
          INSERT INTO votos (periodo, tipo_voto, id_proyecto, id_mesa) 
          VALUES ${Array(voto.cantidad)
            .fill("(@param1, @param2, @param3, @param4)")
            .join(", ")}
        `;

        const params = [];
        for (let i = 0; i < voto.cantidad; i++) {
          params.push(
            { name: "param1", type: TYPES.Int, value: periodo },
            { name: "param2", type: TYPES.VarChar, value: voto.tipo_voto },
            {
              name: "param3",
              type: TYPES.UniqueIdentifier,
              value: projectDbId,
            },
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
