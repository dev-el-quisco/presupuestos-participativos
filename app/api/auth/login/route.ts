import { NextRequest, NextResponse } from "next/server";
import { TYPES } from "tedious";
import { executeQuery } from "@/app/lib/database";
import { comparePassword, generateToken, UserPayload } from "@/app/lib/auth";

interface LoginRequest {
  usuario: string;
  password: string;
}

interface UserFromDB {
  id: string;
  nombre: string;
  usuario: string;
  rol: string;
  estado: string;
  email: string;
  contraseña: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { usuario, password } = body;

    if (!usuario || !password) {
      return NextResponse.json(
        { error: "Usuario y contraseña son requeridos" },
        { status: 400 }
      );
    }

    const query = `
      SELECT id, nombre, usuario, rol, estado, email, contraseña
      FROM usuarios 
      WHERE usuario = @param1
    `;

    const parameters = [{ type: TYPES.VarChar, value: usuario }];

    const users = await executeQuery<UserFromDB>(query, parameters);

    if (users.length === 0) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    const user = users[0];

    if (user.estado !== "Activa") {
      return NextResponse.json(
        { error: "Usuario inactivo. Contacte al administrador." },
        { status: 401 }
      );
    }

    const isPasswordValid = await comparePassword(password, user.contraseña);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    // Generar JWT
    const userPayload: UserPayload = {
      id: user.id,
      usuario: user.usuario,
      nombre: user.nombre,
      rol: user.rol,
      email: user.email,
    };

    const token = generateToken(userPayload);

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        usuario: user.usuario,
        rol: user.rol,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
