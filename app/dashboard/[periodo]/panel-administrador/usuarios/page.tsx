"use client";

import { useState } from "react";
import Layout from "@/app/dashboard/[periodo]/panel-administrador/Layout";
import Banner from "@/app/components/dashboard/administrator/users/Banner";
import UsersList from "@/app/components/dashboard/administrator/users/Users";

export default function Users() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const handleUserCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  return (
    <Layout>
      <div className="p-6 w-full flex flex-col justify-start bg-white shadow-sm border border-gray-200 rounded-lg">
        <h1 className="text-2xl mb-2">Usuarios</h1>
        <Banner
          onUserCreated={handleUserCreated}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
        />
        <UsersList searchTerm={searchTerm} refreshTrigger={refreshTrigger} />
      </div>
    </Layout>
  );
}
