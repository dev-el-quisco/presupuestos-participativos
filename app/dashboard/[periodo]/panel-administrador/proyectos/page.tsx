import Layout from "@/app/dashboard/[periodo]/panel-administrador/Layout";
import Banner from "@/app/components/dashboard/administrator/projects/Banner";
import Category from "@/app/components/dashboard/administrator/projects/Category";
import ProjectsListComponent from "@/app/components/dashboard/administrator/projects/ProjectsListComponent";

export default function PollingPlaces() {
  return (
    <Layout>
      <div className="p-6 w-full flex flex-col justify-start bg-white shadow-sm border border-gray-200 rounded-lg">
        <div className="flex flex-row items-center justify-between mb-4">
          <h1 className="text-2xl">Proyectos</h1>
          <Banner />
        </div>
        <Category />
        <ProjectsListComponent />
      </div>
    </Layout>
  );
}
