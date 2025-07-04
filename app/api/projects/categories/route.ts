import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/database";
import { TYPES } from "tedious";

interface CategoryData {
  id: string;
  name: string;
  count: number;
}

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

    // Consulta directa para obtener tipos de proyecto con conteo de proyectos
    const categoriesQuery = `
      SELECT 
        tp.id,
        tp.nombre as name,
        COUNT(p.id) as count
      FROM tipo_proyectos tp
      LEFT JOIN proyectos p ON tp.id = p.id_tipo_proyecto AND p.periodo = @param1
      GROUP BY tp.id, tp.nombre
      ORDER BY tp.nombre
    `;

    const categories = await executeQuery<CategoryData>(categoriesQuery, [
      { name: "param1", type: TYPES.Int, value: parseInt(periodo) },
    ]);

    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
