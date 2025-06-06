import Layout from "@/app/dashboard/[periodo]/estadisticas/Layout";
import GeneralInfo from "@/app/components/dashboard/statistics/DetailedView/GeneralInfo";
import Ranking from "@/app/components/dashboard/statistics/DetailedView/Ranking";

export default function DetailedView() {
  return (
    <Layout>
      <div className="p-6 w-full flex flex-col justify-start">
        <h1 className="text-2xl">Información Extra</h1>
        <p>Métricas extra en base a los resultados obtenidos</p>
        <GeneralInfo />
        <Ranking />
      </div>
    </Layout>
  );
}
