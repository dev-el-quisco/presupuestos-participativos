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

// PUT - Actualizar tipo de proyecto
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, nombre } = body;

    if (!id || !nombre) {
      return NextResponse.json(
        { error: "ID y nombre son requeridos" },
        { status: 400 }
      );
    }

    // Verificar si el tipo existe
    const existsQuery = `
      SELECT COUNT(*) as count 
      FROM tipo_proyectos 
      WHERE id = @param1
    `;

    const exists = await executeQuery<{ count: number }>(existsQuery, [
      { name: "param1", type: TYPES.UniqueIdentifier, value: id },
    ]);

    if (exists[0]?.count === 0) {
      return NextResponse.json(
        { error: "Tipo de proyecto no encontrado" },
        { status: 404 }
      );
    }

    // Verificar si ya existe otro tipo con el mismo nombre
    const duplicateQuery = `
      SELECT COUNT(*) as count 
      FROM tipo_proyectos 
      WHERE nombre = @param1 AND id != @param2
    `;

    const duplicate = await executeQuery<{ count: number }>(duplicateQuery, [
      { name: "param1", type: TYPES.VarChar, value: nombre },
      { name: "param2", type: TYPES.UniqueIdentifier, value: id },
    ]);

    if (duplicate[0]?.count > 0) {
      return NextResponse.json(
        { error: "Ya existe un tipo de proyecto con este nombre" },
        { status: 400 }
      );
    }

    // Actualizar tipo
    const updateQuery = `
      UPDATE tipo_proyectos 
      SET nombre = @param1
      WHERE id = @param2
    `;

    await executeQuery(updateQuery, [
      { name: "param1", type: TYPES.VarChar, value: nombre },
      { name: "param2", type: TYPES.UniqueIdentifier, value: id },
    ]);

    return NextResponse.json({
      success: true,
      message: "Tipo de proyecto actualizado exitosamente",
    });
  } catch (error) {
    console.error("Error al actualizar tipo de proyecto:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar tipo de proyecto
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

    // Verificar si el tipo existe
    const existsQuery = `
      SELECT COUNT(*) as count 
      FROM tipo_proyectos 
      WHERE id = @param1
    `;

    const exists = await executeQuery<{ count: number }>(existsQuery, [
      { name: "param1", type: TYPES.UniqueIdentifier, value: id },
    ]);

    if (exists[0]?.count === 0) {
      return NextResponse.json(
        { error: "Tipo de proyecto no encontrado" },
        { status: 404 }
      );
    }

    // Verificar si hay proyectos asociados que tengan votos
    const projectsWithVotesQuery = `
      SELECT COUNT(*) as count
      FROM proyectos p
      INNER JOIN votos v ON p.id = v.id_proyecto
      WHERE p.id_tipo_proyecto = @param1
    `;

    const projectsWithVotes = await executeQuery<{ count: number }>(
      projectsWithVotesQuery,
      [{ name: "param1", type: TYPES.UniqueIdentifier, value: id }]
    );

    if (projectsWithVotes[0]?.count > 0) {
      return NextResponse.json(
        {
          error:
            "No se puede eliminar el tipo de proyecto porque tiene proyectos con votos asociados",
        },
        { status: 400 }
      );
    }

    // Eliminar tipo de proyecto
    const deleteQuery = `
      DELETE FROM tipo_proyectos 
      WHERE id = @param1
    `;

    await executeQuery(deleteQuery, [
      { name: "param1", type: TYPES.UniqueIdentifier, value: id },
    ]);

    return NextResponse.json({
      success: true,
      message: "Tipo de proyecto eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar tipo de proyecto:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
