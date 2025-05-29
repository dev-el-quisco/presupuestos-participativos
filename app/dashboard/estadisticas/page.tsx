import Layout from "@/app/dashboard/Layout";
import { IconFilter } from "@tabler/icons-react";
import { IconFileExport } from "@tabler/icons-react";

export default function Estadisticas() {
  return (
    <Layout>
      <div className="p-6 w-full flex flex-col justify-start">
        <h1 className="text-2xl">
          Estadísticas de Presupuestos Participativos
        </h1>
        <p>Análisis detallado de los resultados y métricas de participación</p>
      </div>
    </Layout>
  );
}
