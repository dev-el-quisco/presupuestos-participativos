"use client";

import Layout from "@/app/dashboard/Layout";

export default function Home() {
  return (
    <Layout>
      <div className="mt-8 text-center text-gray-700">
        <h1 className="text-2xl font-semibold">Seleccionar una tab</h1>
        <p className="mt-2 text-lg">
          Haz clic en una de las pestañas de arriba para navegar por el sistema.
        </p>
      </div>
    </Layout>
  );
}
