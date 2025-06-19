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
        <h1>Seleccione una tab</h1>
      </Layout>
    </RoleProtectedRoute>
  );
}
