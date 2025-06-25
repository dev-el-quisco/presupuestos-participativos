"use client";

import { useState, useEffect } from "react";

const Banner = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("todos");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const categories = [
    { id: "todos", name: "Todos" },
    { id: "Comunales", name: "Comunales" },
    { id: "Infantiles", name: "Infantiles" },
    { id: "Juveniles", name: "Juveniles" },
    { id: "Sectoriales", name: "Sectoriales" },
  ];

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setDropdownOpen(false);
    // Comunicar el cambio de categoría al componente de lista
    if ((window as any).handleCategoryFilter) {
      (window as any).handleCategoryFilter(categoryId);
    }
  };

  // Exponer función para obtener categoría actual
  useEffect(() => {
    (window as any).getCurrentCategory = () => selectedCategory;

    return () => {
      delete (window as any).getCurrentCategory;
    };
  }, [selectedCategory]);

  const handleNewProject = () => {
    if ((window as any).handleCreateProject) {
      (window as any).handleCreateProject();
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center w-full gap-4">
      <div className="relative flex flex-row items-end justify-between md:justify-end-safe space-x-2 w-full">
        <div>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center justify-between w-full sm:w-56 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#30c56c]"
          >
            <span>
              {categories.find((cat) => cat.id === selectedCategory)?.name ||
                "Seleccionar categoría"}
            </span>
            <svg
              className={`w-4 h-4 ml-2 transition-transform ${
                dropdownOpen ? "rotate-180" : ""
              }`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="absolute z-10 w-full sm:w-56 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
              <ul className="py-1 text-sm text-gray-700">
                {categories.map((category) => (
                  <li key={category.id}>
                    <button
                      onClick={() => handleCategoryChange(category.id)}
                      className={`flex items-center w-full px-4 py-2 hover:bg-gray-100 ${
                        selectedCategory === category.id ? "bg-gray-100" : ""
                      }`}
                    >
                      {selectedCategory === category.id && (
                        <svg
                          className="w-4 h-4 mr-2"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                      {category.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <button
          onClick={handleNewProject}
          className="flex items-center space-x-2 bg-[#30c56c] text-white rounded-lg px-4 py-2 hover:bg-[#28a85b] transition-colors focus:ring-2 focus:ring-[#30c56c] focus:ring-opacity-50 outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          <span className="hidden md:block">Nuevo Proyecto</span>
          <span className="block md:hidden">Nuevo</span>
        </button>
      </div>
    </div>
  );
};

export default Banner;
