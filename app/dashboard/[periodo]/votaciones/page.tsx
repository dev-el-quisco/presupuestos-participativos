import Layout from "@/app/dashboard/Layout";
import Filter from "@/app/components/dashboard/polls/Filter";
import Content from "@/app/components/dashboard/polls/Content";

export default function Votaciones() {
  return (
    <Layout>
      <div className="p-6 w-full flex flex-col justify-start">
        <div className="flex flex-row items-center justify-between pb-4">
          <div>
            <h1 className="text-2xl">
              Votaciones de Presupuestos Participativos
            </h1>
            <p>
              Gestione las votaciones y registre los votos de los ciudadanos
            </p>
          </div>
          <Filter />
        </div>
        <div className="bg-white">
          <Content />
        </div>
      </div>
    </Layout>
  );
}
