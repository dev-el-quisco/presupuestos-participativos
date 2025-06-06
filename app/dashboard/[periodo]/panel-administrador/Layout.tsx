import React, { ReactNode } from "react";
import Layout from "@/app/dashboard/Layout";
import TabCategoryFilter from "@/app/components/dashboard/TabCategoryFilter";

interface AdminPanelLayoutProps {
  children: ReactNode;
}

export default function AdminPanelLayout({ children }: AdminPanelLayoutProps) {
  const adminTabs = [
    { name: "General", path: "" },
    { name: "Usuarios", path: "/usuarios" },
    { name: "Sedes", path: "/sedes" },
    { name: "Mesas", path: "/mesas" }
  ];

  return (
    <Layout>
      <div className="p-6 w-full flex flex-col justify-start">
        <h1 className="text-2xl">
          Panel de Administrador de Presupuestos Participativos
        </h1>
        <p>Gestione usuarios, sedes, mesas y más.</p>
        <TabCategoryFilter tabs={adminTabs} />
        {children}
      </div>
    </Layout>
  );
}
