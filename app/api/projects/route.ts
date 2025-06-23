import { NextRequest, NextResponse } from "next/server";
import { TYPES } from "tedious";
import { executeQuery } from "@/app/lib/database";

interface CreateProjectRequest {
  id_proyecto: string;
  nombre: string;
  id_tipo_proyecto: string;
  periodo: number;
}

interface UpdateProjectRequest {
  db_id: string;
  id_proyecto: string;
  nombre: string;
  id_tipo_proyecto: string;
}

interface ProjectFromDB {
  db_id: string;
  id_proyecto: string;
  nombre: string;
  id_tipo_proyecto: string;
  tipo_proyecto_nombre: string;
  periodo: number;
  votos_count: number;
}

// GET - Obtener proyectos por periodo
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

    const query = `
      SELECT 
        p.id as db_id,
        p.id_proyecto,
        p.nombre,
        p.id_tipo_proyecto,
        tp.nombre as tipo_proyecto_nombre,
        p.periodo,
        COUNT(v.id) as votos_count
      FROM proyectos p
      LEFT JOIN tipo_proyectos tp ON p.id_tipo_proyecto = tp.id
      LEFT JOIN votos v ON p.id_proyecto = v.id_proyecto AND v.periodo = p.periodo
      WHERE p.periodo = @param1
      GROUP BY p.id, p.id_proyecto, p.nombre, p.id_tipo_proyecto, tp.nombre, p.periodo
      ORDER BY p.id_proyecto
    `;

    const projects = await executeQuery<ProjectFromDB>(query, [
      { name: "param1", type: TYPES.Int, value: parseInt(periodo) },
    ]);

    return NextResponse.json({
      success: true,
      projects,
    });
  } catch (error) {
    console.error("Error al obtener proyectos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo proyecto
export async function POST(request: NextRequest) {
  try {
    const body: CreateProjectRequest = await request.json();
    const { id_proyecto, nombre, id_tipo_proyecto, periodo } = body;

    if (!id_proyecto || !nombre || !id_tipo_proyecto || !periodo) {
      return NextResponse.json(
        {
          error:
            "ID proyecto, nombre, tipo de proyecto y periodo son requeridos",
        },
        { status: 400 }
      );
    }

    // Validar que el tipo de proyecto exista
    const typeQuery = `
      SELECT COUNT(*) as count 
      FROM tipo_proyectos 
      WHERE id = @param1
    `;

    const typeExists = await executeQuery<{ count: number }>(typeQuery, [
      { name: "param1", type: TYPES.UniqueIdentifier, value: id_tipo_proyecto },
    ]);

    if (typeExists[0]?.count === 0) {
      return NextResponse.json(
        { error: "Tipo de proyecto no válido" },
        { status: 400 }
      );
    }

    // Verificar si el ID_PROYECTO ya existe en el periodo
    const existingQuery = `
      SELECT COUNT(*) as count 
      FROM proyectos 
      WHERE id_proyecto = @param1 AND periodo = @param2
    `;

    const existing = await executeQuery<{ count: number }>(existingQuery, [
      { name: "param1", type: TYPES.VarChar, value: id_proyecto },
      { name: "param2", type: TYPES.Int, value: periodo },
    ]);

    if (existing[0]?.count > 0) {
      return NextResponse.json(
        {
          error: "Ya existe un proyecto con este ID en el periodo seleccionado",
        },
        { status: 400 }
      );
    }

    // Insertar proyecto
    const insertQuery = `
      INSERT INTO proyectos (id_proyecto, nombre, id_tipo_proyecto, periodo)
      VALUES (@param1, @param2, @param3, @param4)
    `;

    const params = [
      { name: "param1", type: TYPES.VarChar, value: id_proyecto },
      { name: "param2", type: TYPES.VarChar, value: nombre },
      { name: "param3", type: TYPES.UniqueIdentifier, value: id_tipo_proyecto },
      { name: "param4", type: TYPES.Int, value: periodo },
    ];

    await executeQuery(insertQuery, params);

    return NextResponse.json({
      success: true,
      message: "Proyecto creado exitosamente",
    });
  } catch (error) {
    console.error("Error al crear proyecto:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar proyecto
export async function PUT(request: NextRequest) {
  try {
    const body: UpdateProjectRequest = await request.json();
    const { db_id, id_proyecto, nombre, id_tipo_proyecto } = body;

    if (!db_id || !id_proyecto || !nombre || !id_tipo_proyecto) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    // Validar que el tipo de proyecto exista
    const typeQuery = `
      SELECT COUNT(*) as count 
      FROM tipo_proyectos 
      WHERE id = @param1
    `;

    const typeExists = await executeQuery<{ count: number }>(typeQuery, [
      { name: "param1", type: TYPES.UniqueIdentifier, value: id_tipo_proyecto },
    ]);

    if (typeExists[0]?.count === 0) {
      return NextResponse.json(
        { error: "Tipo de proyecto no válido" },
        { status: 400 }
      );
    }

    // Obtener el proyecto actual
    const currentQuery = `
      SELECT id_proyecto, periodo FROM proyectos WHERE id = @param1
    `;
    const currentProject = await executeQuery<{
      id_proyecto: string;
      periodo: number;
    }>(currentQuery, [
      { name: "param1", type: TYPES.UniqueIdentifier, value: db_id },
    ]);

    if (currentProject.length === 0) {
      return NextResponse.json(
        { error: "Proyecto no encontrado" },
        { status: 404 }
      );
    }

    // Si se cambió el ID_PROYECTO, verificar que no exista otro proyecto con el nuevo ID
    if (currentProject[0].id_proyecto !== id_proyecto) {
      const existingQuery = `
        SELECT COUNT(*) as count 
        FROM proyectos 
        WHERE id_proyecto = @param1 AND periodo = @param2 AND id != @param3
      `;

      const existing = await executeQuery<{ count: number }>(existingQuery, [
        { name: "param1", type: TYPES.VarChar, value: id_proyecto },
        { name: "param2", type: TYPES.Int, value: currentProject[0].periodo },
        { name: "param3", type: TYPES.UniqueIdentifier, value: db_id },
      ]);

      if (existing[0]?.count > 0) {
        return NextResponse.json(
          { error: "Ya existe un proyecto con este ID en el periodo" },
          { status: 400 }
        );
      }
    }

    // Actualizar proyecto
    const updateQuery = `
      UPDATE proyectos 
      SET id_proyecto = @param1, nombre = @param2, id_tipo_proyecto = @param3
      WHERE id = @param4
    `;

    const params = [
      { name: "param1", type: TYPES.VarChar, value: id_proyecto },
      { name: "param2", type: TYPES.VarChar, value: nombre },
      { name: "param3", type: TYPES.UniqueIdentifier, value: id_tipo_proyecto },
      { name: "param4", type: TYPES.UniqueIdentifier, value: db_id },
    ];

    await executeQuery(updateQuery, params);

    return NextResponse.json({
      success: true,
      message: "Proyecto actualizado exitosamente",
    });
  } catch (error) {
    console.error("Error al actualizar proyecto:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar proyecto
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id_proyecto = searchParams.get("id_proyecto");
    const periodo = searchParams.get("periodo");

    if (!id_proyecto || !periodo) {
      return NextResponse.json(
        { error: "ID proyecto y periodo son requeridos" },
        { status: 400 }
      );
    }

    // Primero obtener el ID interno del proyecto
    const projectQuery = `
      SELECT id as db_id
      FROM proyectos 
      WHERE id_proyecto = @param1 AND periodo = @param2
    `;

    const project = await executeQuery<{ db_id: string }>(projectQuery, [
      { name: "param1", type: TYPES.VarChar, value: id_proyecto },
      { name: "param2", type: TYPES.Int, value: parseInt(periodo) },
    ]);

    if (project.length === 0) {
      return NextResponse.json(
        { error: "Proyecto no encontrado" },
        { status: 404 }
      );
    }

    // Verificar si existen votos para este proyecto usando el ID interno
    const votesQuery = `
      SELECT COUNT(*) as count 
      FROM votos 
      WHERE id_proyecto = @param1
    `;

    const votes = await executeQuery<{ count: number }>(votesQuery, [
      { name: "param1", type: TYPES.UniqueIdentifier, value: project[0].db_id },
    ]);

    if (votes[0]?.count > 0) {
      return NextResponse.json(
        {
          error:
            "No se puede eliminar el proyecto porque tiene votos registrados",
        },
        { status: 400 }
      );
    }

    // Eliminar proyecto
    const deleteQuery = `
      DELETE FROM proyectos 
      WHERE id_proyecto = @param1 AND periodo = @param2
    `;

    await executeQuery(deleteQuery, [
      { name: "param1", type: TYPES.VarChar, value: id_proyecto },
      { name: "param2", type: TYPES.Int, value: parseInt(periodo) },
    ]);

    return NextResponse.json({
      success: true,
      message: "Proyecto eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar proyecto:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
