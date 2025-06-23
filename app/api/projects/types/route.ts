import { NextRequest, NextResponse } from "next/server";
import { TYPES } from "tedious";
import { executeQuery } from "@/app/lib/database";

interface ProjectType {
  id: string;
  nombre: string;
}

// GET - Obtener tipos de proyecto
export async function GET(request: NextRequest) {
  try {
    const query = `
      SELECT 
        id,
        nombre
      FROM tipo_proyectos
      ORDER BY nombre
    `;

    const projectTypes = await executeQuery<ProjectType>(query, []);

    return NextResponse.json({
      success: true,
      projectTypes,
    });
  } catch (error) {
    console.error("Error al obtener tipos de proyecto:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo tipo de proyecto
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre } = body;

    if (!nombre) {
      return NextResponse.json(
        { error: "Nombre es requerido" },
        { status: 400 }
      );
    }

    // Verificar si ya existe
    const existingQuery = `
      SELECT COUNT(*) as count 
      FROM tipo_proyectos 
      WHERE nombre = @param1
    `;

    const existing = await executeQuery<{ count: number }>(existingQuery, [
      { name: "param1", type: TYPES.VarChar, value: nombre },
    ]);

    if (existing[0]?.count > 0) {
      return NextResponse.json(
        { error: "Ya existe un tipo de proyecto con este nombre" },
        { status: 400 }
      );
    }

    // Insertar nuevo tipo
    const insertQuery = `
      INSERT INTO tipo_proyectos (nombre)
      VALUES (@param1)
    `;

    await executeQuery(insertQuery, [
      { name: "param1", type: TYPES.VarChar, value: nombre },
    ]);

    return NextResponse.json({
      success: true,
      message: "Tipo de proyecto creado exitosamente",
    });
  } catch (error) {
    console.error("Error al crear tipo de proyecto:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
