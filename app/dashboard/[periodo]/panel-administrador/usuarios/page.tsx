import Layout from "@/app/dashboard/[periodo]/panel-administrador/Layout";
import Banner from "@/app/components/dashboard/administrator/users/Banner";
import UsersList from "@/app/components/dashboard/administrator/users/Users";

export default function Users() {
  return (
    <Layout>
      <div className="p-6 w-full flex flex-col justify-start">
        <h1 className="text-2xl">Usuarios</h1>
        <Banner />
        <UsersList />
      </div>
    </Layout>
  );
}
