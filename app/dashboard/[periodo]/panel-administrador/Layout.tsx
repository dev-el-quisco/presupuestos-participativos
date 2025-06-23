import React, { ReactNode } from "react";
import Layout from "@/app/dashboard/Layout";
import TabCategoryFilter from "@/app/components/dashboard/TabCategoryFilter";
import Filter from "@/app/components/dashboard/polls/Filter";

interface AdminPanelLayoutProps {
  children: ReactNode;
}

export default function AdminPanelLayout({ children }: AdminPanelLayoutProps) {
  const adminTabs = [
    { name: "Usuarios", path: "/usuarios" },
    { name: "Proyectos", path: "/proyectos" },
    { name: "Sedes", path: "/sedes" },
    { name: "Asignaciones", path: "/asignaciones" },
    { name: "Categorías", path: "/categorias" },
  ];

  return (
    <Layout>
      <div className="p-6 w-full flex flex-col justify-start ">
        <div className="flex flex-col md:flex-row items-start md:items-center md:justify-between space-x-1 pb-4">
          <div>
            <h1 className="text-2xl">
              Panel de Administrador de Presupuestos Participativos
            </h1>
            <p>Gestione usuarios, sedes, mesas y más.</p>
          </div>
          <Filter />
        </div>
        <TabCategoryFilter tabs={adminTabs} />
        {children}
      </div>
    </Layout>
  );
}
