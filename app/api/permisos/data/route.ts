import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/database";
import { TYPES } from "tedious";

// GET - Obtener datos para asignaciones (sedes, mesas, usuarios)
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

    // Obtener sedes
    const sedesQuery = `SELECT id, nombre FROM sedes ORDER BY nombre`;
    const sedes = await executeQuery(sedesQuery, []);

    // Obtener mesas del periodo
    const mesasQuery = `
      SELECT m.id, m.nombre, m.sede_id, s.nombre as sede_nombre
      FROM mesas m
      INNER JOIN sedes s ON m.sede_id = s.id
      WHERE m.periodo = @param1
      ORDER BY s.nombre, m.nombre
    `;
    const mesasParams = [{ type: TYPES.Int, value: parseInt(periodo) }];
    const mesas = await executeQuery(mesasQuery, mesasParams);

    // Obtener usuarios activos
    const usuariosQuery = `
      SELECT id, nombre, usuario, rol
      FROM usuarios 
      WHERE estado = 'Activa'
      ORDER BY nombre
    `;
    const usuarios = await executeQuery(usuariosQuery, []);

    return NextResponse.json({
      success: true,
      data: {
        sedes,
        mesas,
        usuarios,
      },
    });
  } catch (error) {
    console.error("Error al obtener datos:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
