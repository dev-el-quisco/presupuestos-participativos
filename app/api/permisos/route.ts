import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/database";
import { TYPES } from "tedious";

interface Permiso {
  id: string;
  periodo: number;
  id_sede: string;
  id_mesa: string;
  id_usuario: string;
  sede_nombre?: string;
  mesa_nombre?: string;
  usuario_nombre?: string;
}

interface PermisoWithDetails extends Permiso {
  sede_nombre: string;
  mesa_nombre: string;
  usuario_nombre: string;
  usuariosAsignados: number;
}

// GET - Obtener permisos por periodo
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
        p.id,
        p.periodo,
        p.id_sede,
        p.id_mesa,
        p.id_usuario,
        s.nombre as sede_nombre,
        m.nombre as mesa_nombre,
        u.nombre as usuario_nombre,
        (
          SELECT COUNT(*) 
          FROM permisos p2 
          WHERE p2.id_mesa = p.id_mesa 
          AND p2.periodo = p.periodo
        ) as usuariosAsignados
      FROM permisos p
      INNER JOIN sedes s ON p.id_sede = s.id
      INNER JOIN mesas m ON p.id_mesa = m.id
      INNER JOIN usuarios u ON p.id_usuario = u.id
      WHERE p.periodo = @param1
      ORDER BY s.nombre, m.nombre, u.nombre
    `;

    const params = [{ type: TYPES.Int, value: parseInt(periodo) }];
    const permisos = await executeQuery<PermisoWithDetails>(query, params);

    return NextResponse.json({ success: true, data: permisos });
  } catch (error) {
    console.error("Error al obtener permisos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo permiso
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { periodo, id_sede, id_mesa, id_usuario } = body;

    if (!periodo || !id_sede || !id_mesa || !id_usuario) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    // Verificar si ya existe el permiso
    const checkQuery = `
      SELECT id FROM permisos 
      WHERE periodo = @param1 
      AND id_sede = @param2 
      AND id_mesa = @param3 
      AND id_usuario = @param4
    `;

    const checkParams = [
      { type: TYPES.Int, value: parseInt(periodo) },
      { type: TYPES.UniqueIdentifier, value: id_sede },
      { type: TYPES.UniqueIdentifier, value: id_mesa },
      { type: TYPES.UniqueIdentifier, value: id_usuario },
    ];

    const existing = await executeQuery(checkQuery, checkParams);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "El permiso ya existe" },
        { status: 400 }
      );
    }

    const insertQuery = `
      INSERT INTO permisos (periodo, id_sede, id_mesa, id_usuario)
      VALUES (@param1, @param2, @param3, @param4)
    `;

    await executeQuery(insertQuery, checkParams);

    return NextResponse.json({
      success: true,
      message: "Permiso creado exitosamente",
    });
  } catch (error) {
    console.error("Error al crear permiso:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar permiso
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID del permiso es requerido" },
        { status: 400 }
      );
    }

    const deleteQuery = `DELETE FROM permisos WHERE id = @param1`;
    const params = [{ type: TYPES.UniqueIdentifier, value: id }];

    await executeQuery(deleteQuery, params);

    return NextResponse.json({
      success: true,
      message: "Permiso eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar permiso:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}