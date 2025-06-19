import React from "react";
import Layout from "@/app/dashboard/[periodo]/estadisticas/Layout";
import RoleProtectedRoute from "@/app/components/auth/RoleProtectedRoute";

export default function Statistics() {
  return (
    <RoleProtectedRoute
      allowedRoles={["Administrador", "Digitador", "Encargado de Local"]}
    >
      <Layout>
        <div className="my-8 text-center text-gray-700">
          <h1 className="text-2xl font-semibold">Seleccione una pestaña</h1>
          <p className="mt-2 text-lg">
            Haz clic en una de las pestañas de arriba para ver las estadísticas.
          </p>
        </div>
      </Layout>
    </RoleProtectedRoute>
  );
}
