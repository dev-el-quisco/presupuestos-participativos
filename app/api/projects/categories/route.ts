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

    // Obtener tipos de proyecto desde la base de datos
    const typesQuery = `
      SELECT id, nombre
      FROM tipo_proyectos
      ORDER BY nombre
    `;

    const projectTypes = await executeQuery<{ id: string; nombre: string }>(
      typesQuery,
      []
    );

    // Obtener conteo de proyectos por categoría
    const projectsResponse = await fetch(
      `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/api/projects?periodo=${periodo}`,
      { cache: "no-store" }
    );

    let projectCounts: Record<string, number> = {};

    if (projectsResponse.ok) {
      const projectsData = await projectsResponse.json();
      if (projectsData.success) {
        // Contar proyectos por tipo
        projectsData.projects.forEach((project: any) => {
          const tipo = project.id_tipo_proyecto;
          projectCounts[tipo] = (projectCounts[tipo] || 0) + 1;
        });
      }
    }

    // Combinar tipos de proyecto con conteos dinámicos
    const categories: CategoryData[] = projectTypes.map((type) => ({
      id: type.id,
      name: type.nombre,
      count: projectCounts[type.id] || 0,
    }));

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
