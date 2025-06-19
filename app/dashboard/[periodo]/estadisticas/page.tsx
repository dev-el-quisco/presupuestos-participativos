import React from "react";
import Layout from "@/app/dashboard/[periodo]/estadisticas/Layout";
import RoleProtectedRoute from "@/app/components/auth/RoleProtectedRoute";

export default function Statistics() {
  return (
    <RoleProtectedRoute allowedRoles={["Administrador", "Digitador"]}>
      <Layout>
        <h1>Seleccione una pestaña</h1>
      </Layout>
    </RoleProtectedRoute>
  );
}
