import Layout from "@/app/dashboard/[periodo]/panel-administrador/Layout";
import Assignments from "@/app/components/dashboard/administrator/assignments/Assignments";
import { IconPlus } from "@tabler/icons-react";
import toast from "react-hot-toast";

export default function PollingPlaces() {
  return (
    <Layout>
      <div className="p-6 w-full flex flex-col justify-start bg-white shadow-sm border border-gray-200 rounded-lg space-y-3">
        <div className="flex flex-row items-center justify-between">
          <h1 className="text-2xl">Asignaciones</h1>
          <button
            type="button"
            className="flex items-center justify-center bg-white border border-gray-300 rounded-lg px-4 py-2 hover:bg-[#30c56c] hover:text-[#e3ecea] transition-colors focus:ring-2 focus:ring-[#30c56c] focus:border-[#30c56c] outline-none text-sm focus:outline-none"
          >
            <IconPlus className="w-5 h-5 mr-2" />
            Nueva Asignación
          </button>
        </div>
        <Assignments />
      </div>
    </Layout>
  );
}
