"use client";

import { useState } from "react";
import Layout from "@/app/dashboard/[periodo]/panel-administrador/Layout";
import Banner from "@/app/components/dashboard/administrator/sectors/Banner";
import Sectors from "@/app/components/dashboard/administrator/sectors/Sectors";

export default function SectorsPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSectorCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  return (
    <Layout>
      <div className="p-6 w-full flex flex-col justify-start bg-white shadow-sm border border-gray-200 rounded-lg">
        <h1 className="text-2xl mb-2">Sectores</h1>
        <Banner
          onSectorCreated={handleSectorCreated}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
        />
        <Sectors searchTerm={searchTerm} refreshTrigger={refreshTrigger} />
      </div>
    </Layout>
  );
}
