import Layout from "@/app/dashboard/panel-administrador/Layout";
import Banner from "@/app/components/dashboard/administrator/pollingplaces/Banner";
import PollingPlacesList from "@/app/components/dashboard/administrator/pollingplaces/PollingPlaces";

export default function PollingPlaces() {
  return (
    <Layout>
      <div className="p-6 w-full flex flex-col justify-start bg-white shadow-sm border border-gray-200 rounded-lg">
        <h1 className="text-2xl">Sedes</h1>
        <Banner />
        <PollingPlacesList />
      </div>
    </Layout>
  );
}
