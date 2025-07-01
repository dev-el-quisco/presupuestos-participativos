import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/database";
import { TYPES } from "tedious";

interface Mesa {
  id: string;
  nombre: string;
  estado_mesa: boolean;
  sede_id: string;
  periodo: number;
  sede_nombre?: string;
}

// GET - Obtener todas las mesas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const periodo = searchParams.get("periodo");
    const sede_id = searchParams.get("sede_id");

    let query = `
      SELECT 
        m.id,
        m.nombre,
        m.estado_mesa,
        m.sede_id,
        m.periodo,
        s.nombre as sede_nombre
      FROM mesas m
      INNER JOIN sedes s ON m.sede_id = s.id
    `;

    const params: any[] = [];
    const conditions: string[] = [];

    if (periodo) {
      conditions.push("m.periodo = @param" + (params.length + 1));
      params.push({
        name: "param" + (params.length + 1),
        type: TYPES.Int,
        value: parseInt(periodo),
      });
    }

    if (sede_id) {
      conditions.push("m.sede_id = @param" + (params.length + 1));
      params.push({
        name: "param" + (params.length + 1),
        type: TYPES.UniqueIdentifier,
        value: sede_id,
      });
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY s.nombre, m.nombre";

    const mesas = await executeQuery<Mesa>(query, params);

    return NextResponse.json({
      success: true,
      data: mesas,
    });
  } catch (error) {
    console.error("Error al obtener mesas:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST - Crear nueva mesa
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, sede_id, periodo } = body; // Eliminamos estado_mesa del destructuring

    if (!nombre || nombre.trim() === "") {
      return NextResponse.json(
        { error: "El nombre es requerido" },
        { status: 400 }
      );
    }

    if (!sede_id) {
      return NextResponse.json(
        { error: "La sede es requerida" },
        { status: 400 }
      );
    }

    if (!periodo) {
      return NextResponse.json(
        { error: "El periodo es requerido" },
        { status: 400 }
      );
    }

    // Verificar si la sede existe
    const sedeExistsQuery = `
      SELECT COUNT(*) as count 
      FROM sedes 
      WHERE id = @param1
    `;

    const sedeExists = await executeQuery<{ count: number }>(sedeExistsQuery, [
      { name: "param1", type: TYPES.UniqueIdentifier, value: sede_id },
    ]);

    if (sedeExists[0]?.count === 0) {
      return NextResponse.json(
        { error: "La sede seleccionada no existe" },
        { status: 400 }
      );
    }

    // Verificar si ya existe una mesa con ese nombre en la misma sede y periodo
    const existsQuery = `
      SELECT COUNT(*) as count 
      FROM mesas 
      WHERE LOWER(nombre) = LOWER(@param1) AND sede_id = @param2 AND periodo = @param3
    `;

    const exists = await executeQuery<{ count: number }>(existsQuery, [
      { name: "param1", type: TYPES.VarChar, value: nombre.trim() },
      { name: "param2", type: TYPES.UniqueIdentifier, value: sede_id },
      { name: "param3", type: TYPES.Int, value: parseInt(periodo) },
    ]);

    if (exists[0]?.count > 0) {
      return NextResponse.json(
        {
          error:
            "Ya existe una mesa con ese nombre en esta sede para este periodo",
        },
        { status: 400 }
      );
    }

    // Insertar nueva mesa (siempre activa)
    const insertQuery = `
      INSERT INTO mesas (nombre, sede_id, periodo, estado_mesa) 
      VALUES (@param1, @param2, @param3, @param4)
    `;

    await executeQuery(insertQuery, [
      { name: "param1", type: TYPES.VarChar, value: nombre.trim() },
      { name: "param2", type: TYPES.UniqueIdentifier, value: sede_id },
      { name: "param3", type: TYPES.Int, value: parseInt(periodo) },
      { name: "param4", type: TYPES.Bit, value: true }, // Siempre true
    ]);

    return NextResponse.json({
      success: true,
      message: "Mesa creada exitosamente",
    });
  } catch (error) {
    console.error("Error al crear mesa:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar mesa
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const body = await request.json();
    const { nombre, estado_mesa, sede_id, periodo } = body;

    if (!id) {
      return NextResponse.json({ error: "ID es requerido" }, { status: 400 });
    }

    // Verificar si la mesa existe
    const existsQuery = `
      SELECT sede_id, periodo, estado_mesa, nombre
      FROM mesas 
      WHERE id = @param1
    `;

    const mesa = await executeQuery<{
      sede_id: string;
      periodo: number;
      estado_mesa: boolean;
      nombre: string;
    }>(existsQuery, [
      { name: "param1", type: TYPES.UniqueIdentifier, value: id },
    ]);

    if (mesa.length === 0) {
      return NextResponse.json(
        { error: "Mesa no encontrada" },
        { status: 404 }
      );
    }

    const mesaActual = mesa[0];

    // Si se está intentando cerrar la mesa (estado_mesa = false), validar votos vs votantes
    if (estado_mesa === false && mesaActual.estado_mesa === true) {
      // Obtener cantidad de votantes registrados
      const votantesQuery = `
        SELECT COUNT(*) as total_votantes
        FROM votantes 
        WHERE id_mesa = @param1 AND periodo = @param2
      `;

      const votantesResult = await executeQuery<{ total_votantes: number }>(
        votantesQuery,
        [
          { name: "param1", type: TYPES.UniqueIdentifier, value: id },
          { name: "param2", type: TYPES.Int, value: mesaActual.periodo },
        ]
      );

      // Obtener cantidad de votos registrados
      const votosQuery = `
        SELECT COUNT(*) as total_votos
        FROM votos 
        WHERE id_mesa = @param1 AND periodo = @param2
      `;

      const votosResult = await executeQuery<{ total_votos: number }>(
        votosQuery,
        [
          { name: "param1", type: TYPES.UniqueIdentifier, value: id },
          { name: "param2", type: TYPES.Int, value: mesaActual.periodo },
        ]
      );

      const totalVotantes = votantesResult[0]?.total_votantes || 0;
      const totalVotos = votosResult[0]?.total_votos || 0;

      if (totalVotos !== totalVotantes) {
        return NextResponse.json(
          {
            error: `No se puede cerrar la mesa. Votos registrados: ${totalVotos}, Votantes registrados: ${totalVotantes}`,
          },
          { status: 400 }
        );
      }
    }

    // Si se proporciona un nombre, validar duplicados
    if (nombre && nombre.trim() !== "" && nombre.trim() !== mesaActual.nombre) {
      const duplicateQuery = `
        SELECT COUNT(*) as count 
        FROM mesas 
        WHERE LOWER(nombre) = LOWER(@param1) AND sede_id = @param2 AND periodo = @param3 AND id != @param4
      `;

      const duplicate = await executeQuery<{ count: number }>(duplicateQuery, [
        { name: "param1", type: TYPES.VarChar, value: nombre.trim() },
        {
          name: "param2",
          type: TYPES.UniqueIdentifier,
          value: mesaActual.sede_id,
        },
        { name: "param3", type: TYPES.Int, value: mesaActual.periodo },
        { name: "param4", type: TYPES.UniqueIdentifier, value: id },
      ]);

      if (duplicate[0]?.count > 0) {
        return NextResponse.json(
          {
            error:
              "Ya existe otra mesa con ese nombre en esta sede para este periodo",
          },
          { status: 400 }
        );
      }
    }

    // Construir la consulta de actualización dinámicamente
    const updateFields = [];
    const updateParams = [];
    let paramCount = 1;

    if (nombre && nombre.trim() !== "") {
      updateFields.push(`nombre = @param${paramCount}`);
      updateParams.push({
        name: `param${paramCount}`,
        type: TYPES.VarChar,
        value: nombre.trim(),
      });
      paramCount++;
    }

    if (estado_mesa !== undefined) {
      updateFields.push(`estado_mesa = @param${paramCount}`);
      updateParams.push({
        name: `param${paramCount}`,
        type: TYPES.Bit,
        value: estado_mesa,
      });
      paramCount++;
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: "No hay campos para actualizar" },
        { status: 400 }
      );
    }

    // Agregar el ID al final
    updateParams.push({
      name: `param${paramCount}`,
      type: TYPES.UniqueIdentifier,
      value: id,
    });

    const updateQuery = `
      UPDATE mesas 
      SET ${updateFields.join(", ")}
      WHERE id = @param${paramCount}
    `;

    await executeQuery(updateQuery, updateParams);

    return NextResponse.json({
      success: true,
      message: "Mesa actualizada exitosamente",
    });
  } catch (error) {
    console.error("Error al actualizar mesa:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar mesa
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

    // Verificar si la mesa existe
    const existsQuery = `
      SELECT COUNT(*) as count 
      FROM mesas 
      WHERE id = @param1
    `;

    const exists = await executeQuery<{ count: number }>(existsQuery, [
      { name: "param1", type: TYPES.UniqueIdentifier, value: id },
    ]);

    if (exists[0]?.count === 0) {
      return NextResponse.json(
        { error: "Mesa no encontrada" },
        { status: 404 }
      );
    }

    // Verificar si hay votos asociados a esta mesa en el periodo especificado
    const votesQuery = `
      SELECT COUNT(*) as count
      FROM votos v
      WHERE v.id_mesa = @param1 AND v.periodo = @param2
    `;

    const votes = await executeQuery<{ count: number }>(votesQuery, [
      { name: "param1", type: TYPES.UniqueIdentifier, value: id },
      { name: "param2", type: TYPES.Int, value: parseInt(periodo) },
    ]);

    if (votes[0]?.count > 0) {
      return NextResponse.json(
        {
          error:
            "No se puede eliminar la mesa porque tiene votos registrados en este periodo",
        },
        { status: 400 }
      );
    }

    // Eliminar mesa
    const deleteQuery = `
      DELETE FROM mesas 
      WHERE id = @param1
    `;

    await executeQuery(deleteQuery, [
      { name: "param1", type: TYPES.UniqueIdentifier, value: id },
    ]);

    return NextResponse.json({
      success: true,
      message: "Mesa eliminada exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar mesa:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
