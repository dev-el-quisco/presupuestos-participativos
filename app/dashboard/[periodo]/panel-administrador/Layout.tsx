import React, { ReactNode } from "react";
import Layout from "@/app/dashboard/Layout";

interface AdminPanelLayoutProps {
  children: ReactNode;
}

export default function AdminPanelLayout({ children }: AdminPanelLayoutProps) {
  return (
    <Layout>
      <div className="p-6 w-full flex flex-col justify-start">
        <h1 className="text-2xl">
          Panel de Administrador de Presupuestos Participativos
        </h1>
        <p>Gestione usuarios, sedes, mesas y más.</p>
        {children}
      </div>
    </Layout>
  );
}
