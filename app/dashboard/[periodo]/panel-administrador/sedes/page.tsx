import Layout from "@/app/dashboard/[periodo]/panel-administrador/Layout";
import { IconPlus } from "@tabler/icons-react";
import PollingPlacesList from "@/app/components/dashboard/administrator/pollingplaces/PollingPlaces";
import toast from "react-hot-toast";

export default function PollingPlaces() {
  return (
    <Layout>
      <div className="p-6 w-full flex flex-col justify-start bg-white shadow-sm border border-gray-200 rounded-lg">
        <div className="flex flex-row items-center justify-between mb-4">
          <h1 className="text-2xl">Sedes</h1>
          <button
            type="button"
            className="flex items-center justify-center bg-white border border-gray-300 rounded-lg px-4 py-2 hover:bg-[#30c56c] hover:text-[#e3ecea] transition-colors focus:ring-2 focus:ring-[#30c56c] focus:border-[#30c56c] outline-none text-sm focus:outline-none"
          >
            <IconPlus className="w-5 h-5 mr-2" />
            Nueva Sede
          </button>
        </div>
        <PollingPlacesList />
      </div>
    </Layout>
  );
}
