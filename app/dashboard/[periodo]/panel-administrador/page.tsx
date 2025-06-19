import React from "react";
import Layout from "@/app/dashboard/[periodo]/panel-administrador/Layout";
import RoleProtectedRoute from "@/app/components/auth/RoleProtectedRoute";
import { IconUsers } from "@tabler/icons-react";
import { IconMapPin } from "@tabler/icons-react";
import { IconCategory } from "@tabler/icons-react";

export default function PanelAdministrador() {
  return (
    <RoleProtectedRoute allowedRoles={["Administrador"]}>
      <Layout>
        <div className="my-8 text-center text-gray-700">
          <h1 className="text-2xl font-semibold">Seleccione una pestaña</h1>
          <p className="mt-2 text-lg">
            Haz clic en una de las pestañas de arriba para administrar el sistema.
          </p>
        </div>
      </Layout>
    </RoleProtectedRoute>
  );
}
