import Layout from "@/app/dashboard/[periodo]/panel-administrador/Layout";
import AssignmentsList from "@/app/components/dashboard/administrator/assignments/AssignmentsList";

export default function Assignments() {
  return (
    <Layout>
      <div className="p-6 w-full flex flex-col justify-start bg-white shadow-sm border border-gray-200 rounded-lg space-y-3">
        <div className="flex flex-row items-center justify-between">
          <h1 className="text-2xl">Asignaciones</h1>
        </div>
        <AssignmentsList />
      </div>
    </Layout>
  );
}
