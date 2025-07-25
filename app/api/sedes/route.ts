import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/database";
import { TYPES } from "tedious";

interface Sede {
  id: string;
  nombre: string;
}

interface SedeWithMesas extends Sede {
  mesasCount: number;
}

// GET - Obtener todas las sedes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const periodo = searchParams.get("periodo");
    
    let query: string;
    let params: any[] = [];
    
    if (periodo) {
      // Si se proporciona período, filtrar mesas por período
      query = `
        SELECT 
          s.id,
          s.nombre,
          COUNT(m.id) as mesasCount
        FROM sedes s
        LEFT JOIN mesas m ON s.id = m.sede_id AND m.periodo = @param1
        GROUP BY s.id, s.nombre
        ORDER BY s.nombre
      `;
      params = [{ name: "param1", type: TYPES.Int, value: parseInt(periodo) }];
    } else {
      // Si no se proporciona período, contar todas las mesas
      query = `
        SELECT 
          s.id,
          s.nombre,
          COUNT(m.id) as mesasCount
        FROM sedes s
        LEFT JOIN mesas m ON s.id = m.sede_id
        GROUP BY s.id, s.nombre
        ORDER BY s.nombre
      `;
    }

    const sedes = await executeQuery<SedeWithMesas>(query, params);

    return NextResponse.json({
      success: true,
      data: sedes,
    });
  } catch (error) {
    console.error("Error al obtener sedes:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST - Crear nueva sede
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre } = body;

    if (!nombre || nombre.trim() === "") {
      return NextResponse.json(
        { error: "El nombre es requerido" },
        { status: 400 }
      );
    }

    // Verificar si ya existe una sede con ese nombre
    const existsQuery = `
      SELECT COUNT(*) as count 
      FROM sedes 
      WHERE LOWER(nombre) = LOWER(@param1)
    `;

    const exists = await executeQuery<{ count: number }>(existsQuery, [
      { name: "param1", type: TYPES.VarChar, value: nombre.trim() },
    ]);

    if (exists[0]?.count > 0) {
      return NextResponse.json(
        { error: "Ya existe una sede con ese nombre" },
        { status: 400 }
      );
    }

    // Insertar nueva sede
    const insertQuery = `
      INSERT INTO sedes (nombre) 
      VALUES (@param1)
    `;

    await executeQuery(insertQuery, [
      { name: "param1", type: TYPES.VarChar, value: nombre.trim() },
    ]);

    return NextResponse.json({
      success: true,
      message: "Sede creada exitosamente",
    });
  } catch (error) {
    console.error("Error al crear sede:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar sede
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const body = await request.json();
    const { nombre } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID es requerido" },
        { status: 400 }
      );
    }

    if (!nombre || nombre.trim() === "") {
      return NextResponse.json(
        { error: "El nombre es requerido" },
        { status: 400 }
      );
    }

    // Verificar si la sede existe
    const existsQuery = `
      SELECT COUNT(*) as count 
      FROM sedes 
      WHERE id = @param1
    `;

    const exists = await executeQuery<{ count: number }>(existsQuery, [
      { name: "param1", type: TYPES.UniqueIdentifier, value: id },
    ]);

    if (exists[0]?.count === 0) {
      return NextResponse.json(
        { error: "Sede no encontrada" },
        { status: 404 }
      );
    }

    // Verificar si ya existe otra sede con ese nombre
    const duplicateQuery = `
      SELECT COUNT(*) as count 
      FROM sedes 
      WHERE LOWER(nombre) = LOWER(@param1) AND id != @param2
    `;

    const duplicate = await executeQuery<{ count: number }>(duplicateQuery, [
      { name: "param1", type: TYPES.VarChar, value: nombre.trim() },
      { name: "param2", type: TYPES.UniqueIdentifier, value: id },
    ]);

    if (duplicate[0]?.count > 0) {
      return NextResponse.json(
        { error: "Ya existe otra sede con ese nombre" },
        { status: 400 }
      );
    }

    // Actualizar sede
    const updateQuery = `
      UPDATE sedes 
      SET nombre = @param1 
      WHERE id = @param2
    `;

    await executeQuery(updateQuery, [
      { name: "param1", type: TYPES.VarChar, value: nombre.trim() },
      { name: "param2", type: TYPES.UniqueIdentifier, value: id },
    ]);

    return NextResponse.json({
      success: true,
      message: "Sede actualizada exitosamente",
    });
  } catch (error) {
    console.error("Error al actualizar sede:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar sede
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const periodo = searchParams.get("periodo");

    if (!id || !periodo) {
      return NextResponse.json(
        { error: "ID y periodo son requeridos" },
        { status: 400 }
      );
    }

    // Verificar si la sede existe
    const existsQuery = `
      SELECT COUNT(*) as count 
      FROM sedes 
      WHERE id = @param1
    `;

    const exists = await executeQuery<{ count: number }>(existsQuery, [
      { name: "param1", type: TYPES.UniqueIdentifier, value: id },
    ]);

    if (exists[0]?.count === 0) {
      return NextResponse.json(
        { error: "Sede no encontrada" },
        { status: 404 }
      );
    }

    // Verificar si hay mesas con votos en cualquier año
    const mesasWithVotesQuery = `
      SELECT COUNT(*) as count
      FROM mesas m
      INNER JOIN votos v ON m.id = v.id_mesa
      WHERE m.sede_id = @param1
    `;

    const mesasWithVotes = await executeQuery<{ count: number }>(mesasWithVotesQuery, [
      { name: "param1", type: TYPES.UniqueIdentifier, value: id },
    ]);

    if (mesasWithVotes[0]?.count > 0) {
      return NextResponse.json(
        {
          error: "No se puede eliminar la sede porque tiene mesas con votos registrados",
        },
        { status: 400 }
      );
    }

    // Primero eliminar permisos asociados a las mesas de esta sede
    const deletePermisosFromMesasQuery = `
      DELETE FROM permisos 
      WHERE id_mesa IN (
        SELECT id FROM mesas WHERE sede_id = @param1
      )
    `;

    await executeQuery(deletePermisosFromMesasQuery, [
      { name: "param1", type: TYPES.UniqueIdentifier, value: id },
    ]);

    // Luego eliminar permisos asociados directamente a la sede
    const deletePermisosFromSedeQuery = `
      DELETE FROM permisos 
      WHERE id_sede = @param1
    `;

    await executeQuery(deletePermisosFromSedeQuery, [
      { name: "param1", type: TYPES.UniqueIdentifier, value: id },
    ]);

    // Finalmente eliminar la sede (las mesas se eliminan automáticamente por CASCADE)
    const deleteQuery = `
      DELETE FROM sedes 
      WHERE id = @param1
    `;

    await executeQuery(deleteQuery, [
      { name: "param1", type: TYPES.UniqueIdentifier, value: id },
    ]);

    return NextResponse.json({
      success: true,
      message: "Sede eliminada exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar sede:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}