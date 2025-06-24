import { NextRequest, NextResponse } from "next/server";
import { TYPES } from "tedious";
import { executeQuery } from "@/app/lib/database";

interface Sector {
  id: string;
  nombre: string;
}

// GET - Obtener sectores
export async function GET(request: NextRequest) {
  try {
    const query = `
      SELECT id, nombre
      FROM sectores
      ORDER BY nombre
    `;

    const sectores = await executeQuery<Sector>(query, []);

    return NextResponse.json({
      success: true,
      sectores,
    });
  } catch (error) {
    console.error("Error al obtener sectores:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST - Crear sector
export async function POST(request: NextRequest) {
  try {
    const { nombre } = await request.json();

    if (!nombre) {
      return NextResponse.json(
        { error: "El nombre es requerido" },
        { status: 400 }
      );
    }

    // Verificar si ya existe un sector con ese nombre
    const checkQuery = `
      SELECT COUNT(*) as count
      FROM sectores
      WHERE nombre = @param1
    `;

    const checkParams = [
      { name: "param1", type: TYPES.VarChar, value: nombre },
    ];

    const existingResult = await executeQuery<{ count: number }>(
      checkQuery,
      checkParams
    );

    if (existingResult[0]?.count > 0) {
      return NextResponse.json(
        { error: "Ya existe un sector con ese nombre" },
        { status: 400 }
      );
    }

    const insertQuery = `
      INSERT INTO sectores (nombre)
      VALUES (@param1)
    `;

    const insertParams = [
      { name: "param1", type: TYPES.VarChar, value: nombre },
    ];

    await executeQuery(insertQuery, insertParams);

    return NextResponse.json(
      { success: true, message: "Sector creado exitosamente" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al crear sector:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar sector
export async function PUT(request: NextRequest) {
  try {
    const { id, nombre } = await request.json();

    if (!id || !nombre) {
      return NextResponse.json(
        { error: "ID y nombre son requeridos" },
        { status: 400 }
      );
    }

    // Verificar si ya existe otro sector con ese nombre
    const checkQuery = `
      SELECT COUNT(*) as count
      FROM sectores
      WHERE nombre = @param1 AND id != @param2
    `;

    const checkParams = [
      { name: "param1", type: TYPES.VarChar, value: nombre },
      { name: "param2", type: TYPES.UniqueIdentifier, value: id },
    ];

    const existingResult = await executeQuery<{ count: number }>(
      checkQuery,
      checkParams
    );

    if (existingResult[0]?.count > 0) {
      return NextResponse.json(
        { error: "Ya existe un sector con ese nombre" },
        { status: 400 }
      );
    }

    const updateQuery = `
      UPDATE sectores
      SET nombre = @param1
      WHERE id = @param2
    `;

    const updateParams = [
      { name: "param1", type: TYPES.VarChar, value: nombre },
      { name: "param2", type: TYPES.UniqueIdentifier, value: id },
    ];

    await executeQuery(updateQuery, updateParams);

    return NextResponse.json({
      success: true,
      message: "Sector actualizado exitosamente",
    });
  } catch (error) {
    console.error("Error al actualizar sector:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar sector
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID es requerido" },
        { status: 400 }
      );
    }

    // Verificar si hay proyectos asociados a este sector
    const checkProjectsQuery = `
      SELECT COUNT(*) as count
      FROM proyectos
      WHERE id_sector = @param1
    `;

    const checkParams = [
      { name: "param1", type: TYPES.UniqueIdentifier, value: id },
    ];

    const projectsResult = await executeQuery<{ count: number }>(
      checkProjectsQuery,
      checkParams
    );

    if (projectsResult[0]?.count > 0) {
      return NextResponse.json(
        {
          error:
            "No se puede eliminar el sector porque tiene proyectos asociados",
        },
        { status: 400 }
      );
    }

    const deleteQuery = `
      DELETE FROM sectores
      WHERE id = @param1
    `;

    await executeQuery(deleteQuery, checkParams);

    return NextResponse.json({
      success: true,
      message: "Sector eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar sector:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}