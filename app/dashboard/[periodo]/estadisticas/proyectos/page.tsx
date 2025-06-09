import Layout from "@/app/dashboard/[periodo]/estadisticas/Layout";
import ProjectsList from "@/app/components/dashboard/statistics/Projects/ProjectsList";
import MostVoted from "@/app/components/dashboard/statistics/Projects/MostVoted";
import DistributionByCategory from "@/app/components/dashboard/statistics/Projects/DistributionByCategory";
import Filter from "@/app/components/dashboard/statistics/Projects/Filter";
import { FilterProvider } from "@/app/context/FilterContext";

export default function Projects() {
  return (
    <Layout>
      <div className="p-6 w-full flex flex-col justify-center bg-white shadow-sm border border-gray-200 rounded-lg">
        <h1 className="text-2xl">Resultados por Proyecto</h1>
        <p>
          Votos recibidos por cada proyecto entre todas las sedes y mesas de
          votación
        </p>
        <FilterProvider>
          <Filter />
          <div className="flex flex-row justify-between">
            <ProjectsList />
            <div className="flex flex-col w-full">
              <DistributionByCategory />
              <MostVoted />
            </div>
          </div>
        </FilterProvider>
      </div>
    </Layout>
  );
}
