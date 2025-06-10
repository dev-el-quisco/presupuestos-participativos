import Layout from "@/app/dashboard/[periodo]/panel-administrador/Layout";
import Banner from "@/app/components/dashboard/administrator/boothingplaces/Banner";
import BoothingPlacesList from "@/app/components/dashboard/administrator/boothingplaces/BoothingPlaces";

export default function PollingBooth() {
  return (
    <Layout>
      <div className="p-6 w-full flex flex-col justify-start bg-white shadow-sm border border-gray-200 rounded-lg">
        <h1 className="text-2xl">Mesas de votación</h1>
        <Banner />
        <BoothingPlacesList />
      </div>
    </Layout>
  );
}
