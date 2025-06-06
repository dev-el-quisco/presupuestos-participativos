import Layout from "@/app/dashboard/[periodo]/estadisticas/Layout";
import PollingPlacesComponent from "@/app/components/dashboard/statistics/PollingPlaces/PollingPlaces";

export default function PollingPlaces() {
  return (
    <Layout>
      <div className="p-6 w-full flex flex-col justify-start bg-white shadow-sm border border-gray-200 rounded-lg">
        <h1 className="text-2xl">Resultados por Sede y por Proyecto</h1>
        <p>Votos recibidos por cada proyecto en cada sede de votación</p>
        <PollingPlacesComponent />
      </div>
    </Layout>
  );
}
