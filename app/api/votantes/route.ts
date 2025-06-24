import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/app/lib/database";
import { TYPES } from "tedious";

interface Votante {
  id: string;
  nombre: string;
  direccion: string;
  fecha_nacimiento: string;
  id_mesa: string;
  periodo: number;
  rut: string;
  extranjero: boolean;
}

// GET - Obtener votantes por mesa y periodo
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mesa_id = searchParams.get("mesa_id");
    const periodo = searchParams.get("periodo");

    if (!mesa_id || !periodo) {
      return NextResponse.json(
        { error: "Mesa ID y periodo son requeridos" },
        { status: 400 }
      );
    }

    const query = `
      SELECT 
        id,
        nombre,
        direccion,
        fecha_nacimiento,
        id_mesa,
        periodo,
        rut,
        extranjero
      FROM votantes
      WHERE id_mesa = @param1 AND periodo = @param2
      ORDER BY nombre
    `;

    const params = [
      { name: "param1", type: TYPES.UniqueIdentifier, value: mesa_id },
      { name: "param2", type: TYPES.Int, value: parseInt(periodo) },
    ];

    const votantes = await executeQuery<Votante>(query, params);

    return NextResponse.json({
      success: true,
      data: votantes,
    });
  } catch (error) {
    console.error("Error al obtener votantes:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST - Registrar nuevo votante
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, direccion, fecha_nacimiento, id_mesa, periodo, rut, extranjero } = body;

    // Validaciones
    if (!nombre || !direccion || !fecha_nacimiento || !id_mesa || !periodo || !rut) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    // Función para validar RUT chileno
    const validarRUT = (rut: string): boolean => {
      // Limpiar el RUT
      const rutLimpio = rut.replace(/[^0-9kK]/g, '').toUpperCase();
      
      if (rutLimpio.length < 2) return false;
      
      const cuerpo = rutLimpio.slice(0, -1);
      const dv = rutLimpio.slice(-1);
      
      // Calcular dígito verificador
      let suma = 0;
      let multiplicador = 2;
      
      for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += parseInt(cuerpo[i]) * multiplicador;
        multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
      }
      
      const resto = suma % 11;
      const dvCalculado = resto === 0 ? '0' : resto === 1 ? 'K' : (11 - resto).toString();
      
      return dv === dvCalculado;
    };

    // Función para formatear RUT
    const formatearRUT = (rut: string): string => {
      const rutLimpio = rut.replace(/[^0-9kK]/g, '').toUpperCase();
      if (rutLimpio.length <= 1) return rutLimpio;
      
      const cuerpo = rutLimpio.slice(0, -1);
      const dv = rutLimpio.slice(-1);
      
      // Formatear con puntos
      const cuerpoFormateado = cuerpo.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
      
      return `${cuerpoFormateado}-${dv}`;
    };

    // Validar RUT solo si no es extranjero
    if (!extranjero) {
      if (!validarRUT(rut)) {
        return NextResponse.json(
          { error: "RUT inválido" },
          { status: 400 }
        );
      }
    }

    // Formatear RUT para almacenamiento
    const rutFormateado = extranjero ? rut : formatearRUT(rut);

    // Verificar si el RUT ya está registrado en este periodo (en cualquier mesa)
    const existsQuery = `
      SELECT COUNT(*) as count 
      FROM votantes 
      WHERE rut = @param1 AND periodo = @param2
    `;

    const exists = await executeQuery<{ count: number }>(existsQuery, [
      { name: "param1", type: TYPES.VarChar, value: rutFormateado },
      { name: "param2", type: TYPES.Int, value: parseInt(periodo) },
    ]);

    if (exists[0]?.count > 0) {
      return NextResponse.json(
        { error: "Esta persona ya está registrada en este periodo" },
        { status: 400 }
      );
    }

    // Insertar nuevo votante
    const insertQuery = `
      INSERT INTO votantes (nombre, direccion, fecha_nacimiento, id_mesa, periodo, rut, extranjero) 
      VALUES (@param1, @param2, @param3, @param4, @param5, @param6, @param7)
    `;

    await executeQuery(insertQuery, [
      { name: "param1", type: TYPES.VarChar, value: nombre.trim() },
      { name: "param2", type: TYPES.VarChar, value: direccion.trim() },
      { name: "param3", type: TYPES.DateTime2, value: new Date(fecha_nacimiento) },
      { name: "param4", type: TYPES.UniqueIdentifier, value: id_mesa },
      { name: "param5", type: TYPES.Int, value: parseInt(periodo) },
      { name: "param6", type: TYPES.VarChar, value: rutFormateado },
      { name: "param7", type: TYPES.Bit, value: extranjero || false },
    ]);

    return NextResponse.json({
      success: true,
      message: "Votante registrado exitosamente",
    });
  } catch (error) {
    console.error("Error al registrar votante:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}