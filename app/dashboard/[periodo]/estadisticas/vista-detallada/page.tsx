import Layout from "@/app/dashboard/[periodo]/estadisticas/Layout";
import GeneralInfo from "@/app/components/dashboard/statistics/DetailedView/GeneralInfo";
import Ranking from "@/app/components/dashboard/statistics/DetailedView/Ranking";
import Winners from "@/app/components/dashboard/statistics/DetailedView/Winners";

export default function DetailedView() {
  return (
    <Layout>
      <div className="p-6 w-full flex flex-col justify-start bg-white shadow-sm border border-gray-200 rounded-lg">
        <h1 className="text-2xl">Información Extra</h1>
        <p>Métricas extra en base a los resultados obtenidos</p>
        <GeneralInfo />
        <Winners />
        <Ranking />
      </div>
    </Layout>
  );
}
