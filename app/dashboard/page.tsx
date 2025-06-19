"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/app/dashboard/Layout";
import { useAuth } from "@/app/hooks/useAuth";
import { useYear } from "@/app/context/YearContext";

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { selectedYear } = useYear();

  useEffect(() => {
    // Esperar a que termine de cargar la autenticación
    if (isLoading || !user) return;

    // Definir permisos por rol (mismo que en tabselect.tsx)
    const rolePermissions = {
      'Administrador': ['votaciones', 'estadisticas', 'admin'],
      'Digitador': ['votaciones'],
      'Encargado de Local': ['votaciones', 'estadisticas'],
      'Ministro de Fe': ['estadisticas']
    };

    // Obtener permisos del usuario actual
    const userPermissions = user?.rol ? rolePermissions[user.rol as keyof typeof rolePermissions] || [] : [];

    // Determinar la primera tab disponible según el orden de prioridad
    let redirectPath = '';
    
    if (userPermissions.includes('votaciones')) {
      redirectPath = `/dashboard/${selectedYear}/votaciones`;
    } else if (userPermissions.includes('estadisticas')) {
      redirectPath = `/dashboard/${selectedYear}/estadisticas`;
    } else if (userPermissions.includes('admin')) {
      redirectPath = `/dashboard/${selectedYear}/panel-administrador`;
    }

    // Redirigir si hay una ruta disponible
    if (redirectPath) {
      router.push(redirectPath);
    }
  }, [user, isLoading, selectedYear, router]);

  // Mostrar loading mientras se determina la redirección
  if (isLoading) {
    return (
      <Layout>
        <div className="my-8 text-center text-gray-700">
          <h1 className="text-2xl font-semibold">Cargando...</h1>
          <p className="mt-2 text-lg">
            Verificando permisos de usuario...
          </p>
        </div>
      </Layout>
    );
  }

  // Fallback en caso de que no haya permisos (no debería ocurrir con ProtectedRoute)
  return (
    <Layout>
      <div className="my-8 text-center text-gray-700">
        <h1 className="text-2xl font-semibold">Acceso Denegado</h1>
        <p className="mt-2 text-lg">
          No tienes permisos para acceder a ninguna sección del dashboard.
        </p>
      </div>
    </Layout>
  );
}
