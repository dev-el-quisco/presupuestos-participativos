import Layout from "@/app/dashboard/[periodo]/estadisticas/Layout";
import ProjectsList from "@/app/components/dashboard/statistics/Projects/ProjectsList";
import MostVoted from "@/app/components/dashboard/statistics/Projects/MostVoted";
import DistributionByCaegory from "@/app/components/dashboard/statistics/Projects/DistributionByCategory";
import Filter from "@/app/components/dashboard/statistics/Projects/Filter";

export default function Projects() {
  return (
    <Layout>
      <div className="p-6 w-full flex flex-col justify-center">
        <h1 className="text-2xl">Proyectos</h1>
        <Filter />
        <ProjectsList />
        <div className="flex flex-row items-center justify-evenly">
          <MostVoted />
          <DistributionByCaegory />
        </div>
      </div>
    </Layout>
  );
}
