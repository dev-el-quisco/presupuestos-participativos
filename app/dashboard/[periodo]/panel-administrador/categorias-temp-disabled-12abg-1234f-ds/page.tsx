"use client";

import { useState } from "react";
import Layout from "@/app/dashboard/[periodo]/panel-administrador/Layout";
import Banner from "@/app/components/dashboard/administrator/categories/Banner";
import Categories from "@/app/components/dashboard/administrator/categories/Categories";

export default function CategoriesPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  const handleCategoryCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  return (
    <Layout>
      <div className="p-6 w-full flex flex-col justify-start bg-white shadow-sm border border-gray-200 rounded-lg">
        <h1 className="text-2xl mb-2">Tipos de Proyectos</h1>
        <Banner
          onCategoryCreated={handleCategoryCreated}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
        />
        <Categories searchTerm={searchTerm} refreshTrigger={refreshTrigger} />
      </div>
    </Layout>
  );
}