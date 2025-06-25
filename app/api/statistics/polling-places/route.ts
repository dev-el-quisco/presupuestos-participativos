import { executeQuery } from "@/app/lib/database";
import { TYPES } from "tedious";
import { NextRequest, NextResponse } from "next/server";

interface SedeStatistics {
  sede_id: string;
  sede_nombre: string;
  proyecto_id: string;
  proyecto_nombre: string;
  tipo_proyecto_nombre: string;
  total_votos: number;
}

interface FormattedSedeData {
  sede: string;
  proyectosComunales: Record<string, number>;
  proyectosInfantiles: Record<string, number>;
  proyectosJuveniles: Record<string, number>;
  proyectosSectoriales: Record<string, number>;
  total: number;
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

    // Primero obtener todas las sedes
    const sedesQuery = `
      SELECT DISTINCT s.id as sede_id, s.nombre as sede_nombre
      FROM sedes s
      INNER JOIN mesas m ON s.id = m.sede_id AND m.periodo = @param1
      ORDER BY s.nombre
    `;

    const sedes = await executeQuery<{ sede_id: string; sede_nombre: string }>(
      sedesQuery,
      [{ name: "param1", type: TYPES.Int, value: parseInt(periodo) }]
    );

    // Obtener todos los proyectos del período (incluso sin votos)
    const proyectosQuery = `
      SELECT 
        p.id_proyecto as proyecto_id,
        p.nombre as proyecto_nombre,
        tp.nombre as tipo_proyecto_nombre
      FROM proyectos p
      INNER JOIN tipo_proyectos tp ON p.id_tipo_proyecto = tp.id
      WHERE p.periodo = @param1
      ORDER BY tp.nombre, p.id_proyecto
    `;

    const proyectos = await executeQuery<{
      proyecto_id: string;
      proyecto_nombre: string;
      tipo_proyecto_nombre: string;
    }>(proyectosQuery, [
      { name: "param1", type: TYPES.Int, value: parseInt(periodo) },
    ]);

    // Obtener estadísticas de votos por sede y proyecto
    const votosQuery = `
      SELECT 
        s.id as sede_id,
        s.nombre as sede_nombre,
        p.id_proyecto as proyecto_id,
        p.nombre as proyecto_nombre,
        tp.nombre as tipo_proyecto_nombre,
        COUNT(v.id) as total_votos
      FROM sedes s
      INNER JOIN mesas m ON s.id = m.sede_id AND m.periodo = @param1
      LEFT JOIN votos v ON m.id = v.id_mesa AND v.periodo = @param1 AND v.tipo_voto = 'Normal'
      LEFT JOIN proyectos p ON v.id_proyecto = p.id AND p.periodo = @param1
      LEFT JOIN tipo_proyectos tp ON p.id_tipo_proyecto = tp.id
      WHERE p.id IS NOT NULL AND tp.id IS NOT NULL
      GROUP BY s.id, s.nombre, p.id_proyecto, p.nombre, tp.nombre
      ORDER BY s.nombre, tp.nombre, p.id_proyecto
    `;

    const statistics = await executeQuery<SedeStatistics>(votosQuery, [
      { name: "param1", type: TYPES.Int, value: parseInt(periodo) },
    ]);

    // Formatear datos para el frontend
    const sedesMap = new Map<string, FormattedSedeData>();

    // Inicializar estructura para cada sede (incluso las que no tienen votos)
    sedes.forEach((sede) => {
      sedesMap.set(sede.sede_nombre, {
        sede: sede.sede_nombre,
        proyectosComunales: {},
        proyectosInfantiles: {},
        proyectosJuveniles: {},
        proyectosSectoriales: {},
        total: 0,
      });
    });

    // Inicializar todos los proyectos con 0 votos en todas las sedes
    proyectos.forEach((proyecto) => {
      const tipoNombre = proyecto.tipo_proyecto_nombre.toLowerCase();
      const proyectoId = proyecto.proyecto_id;

      sedes.forEach((sede) => {
        const sedeData = sedesMap.get(sede.sede_nombre);
        if (sedeData) {
          if (tipoNombre.includes("comunal")) {
            sedeData.proyectosComunales[proyectoId] = 0;
          } else if (tipoNombre.includes("infantil")) {
            sedeData.proyectosInfantiles[proyectoId] = 0;
          } else if (tipoNombre.includes("juvenil")) {
            sedeData.proyectosJuveniles[proyectoId] = 0;
          } else if (tipoNombre.includes("sectorial")) {
            sedeData.proyectosSectoriales[proyectoId] = 0;
          }
        }
      });
    });

    // Llenar datos de votos reales
    statistics.forEach((stat) => {
      const sedeData = sedesMap.get(stat.sede_nombre);
      if (sedeData) {
        const tipoNombre = stat.tipo_proyecto_nombre.toLowerCase();
        const proyectoId = stat.proyecto_id;

        // Categorizar por tipo de proyecto según los nombres en la BD
        if (tipoNombre.includes("comunal")) {
          sedeData.proyectosComunales[proyectoId] = stat.total_votos;
        } else if (tipoNombre.includes("infantil")) {
          sedeData.proyectosInfantiles[proyectoId] = stat.total_votos;
        } else if (tipoNombre.includes("juvenil")) {
          // Mapear deportivos a juveniles según tu nueva categorización
          sedeData.proyectosJuveniles[proyectoId] = stat.total_votos;
        } else if (tipoNombre.includes("sectorial")) {
          // Mapear culturales a sectoriales según tu nueva categorización
          sedeData.proyectosSectoriales[proyectoId] = stat.total_votos;
        }

        sedeData.total += stat.total_votos;
      }
    });

    // Calcular totales generales
    const totales = {
      proyectosComunales: {} as Record<string, number>,
      proyectosInfantiles: {} as Record<string, number>,
      proyectosJuveniles: {} as Record<string, number>,
      proyectosSectoriales: {} as Record<string, number>,
      total: 0,
    };

    // Inicializar totales con todos los proyectos
    proyectos.forEach((proyecto) => {
      const tipoNombre = proyecto.tipo_proyecto_nombre.toLowerCase();
      const proyectoId = proyecto.proyecto_id;

      if (tipoNombre.includes("comunal")) {
        totales.proyectosComunales[proyectoId] = 0;
      } else if (tipoNombre.includes("infantil")) {
        totales.proyectosInfantiles[proyectoId] = 0;
      } else if (tipoNombre.includes("juvenil")) {
        totales.proyectosJuveniles[proyectoId] = 0;
      } else if (tipoNombre.includes("sectorial")) {
        totales.proyectosSectoriales[proyectoId] = 0;
      }
    });

    // Sumar votos reales a los totales
    Array.from(sedesMap.values()).forEach((sede) => {
      Object.entries(sede.proyectosComunales).forEach(([key, value]) => {
        totales.proyectosComunales[key] =
          (totales.proyectosComunales[key] || 0) + value;
      });
      Object.entries(sede.proyectosInfantiles).forEach(([key, value]) => {
        totales.proyectosInfantiles[key] =
          (totales.proyectosInfantiles[key] || 0) + value;
      });
      Object.entries(sede.proyectosJuveniles).forEach(([key, value]) => {
        totales.proyectosJuveniles[key] =
          (totales.proyectosJuveniles[key] || 0) + value;
      });
      Object.entries(sede.proyectosSectoriales).forEach(([key, value]) => {
        totales.proyectosSectoriales[key] =
          (totales.proyectosSectoriales[key] || 0) + value;
      });
      totales.total += sede.total;
    });

    return NextResponse.json({
      success: true,
      data: {
        sedes: Array.from(sedesMap.values()),
        totales,
      },
    });
  } catch (error) {
    console.error("Error al obtener estadísticas por sede:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
