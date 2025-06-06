import Layout from "@/app/dashboard/[periodo]/estadisticas/Layout";
import PollingPlacesComponent from "@/app/components/dashboard/statistics/PollingPlaces/PollingPlaces";

export default function PollingPlaces() {
  return (
    <Layout>
      <h1 className="text-2xl">Sedes</h1>
      <PollingPlacesComponent />
    </Layout>
  );
}
