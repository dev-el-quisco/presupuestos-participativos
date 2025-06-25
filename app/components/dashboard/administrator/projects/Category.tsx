"use client";

import {
  IconMoodSmile,
  IconBallAmericanFootball,
  IconMap,
  IconX,
  IconLocationPin,
} from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { useYear } from "@/app/context/YearContext";

interface CategoryData {
  id: string;
  name: string;
  count: number;
}

const Category = () => {
  const { selectedYear, isYearReady } = useYear(); // Agregar isYearReady
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  // Iconos para cada categoría
  const categoryIcons: Record<string, React.ReactElement> = {
    Comunales: <IconMap />,
    Infantiles: <IconMoodSmile />,
    Juveniles: <IconBallAmericanFootball />,
    Sectoriales: <IconLocationPin />,
  };

  // Datos estáticos como fallback
  const staticCategories = [
    {
      id: "comunales",
      name: "Comunales",
      count: 0,
    },
    {
      id: "infantiles",
      name: "Infantiles",
      count: 0,
    },
    {
      id: "juveniles",
      name: "Juveniles",
      count: 0,
    },
    {
      id: "sectoriales",
      name: "Sectoriales",
      count: 0,
    },
  ];

  const fetchCategoryData = async () => {
    if (!isYearReady || !selectedYear) return; // Verificar isYearReady

    try {
      setLoading(true);
      const response = await fetch(
        `/api/projects/categories?periodo=${selectedYear}`
      );
      const data = await response.json();

      if (data.success && data.categories) {
        setCategories(data.categories);
      } else {
        setCategories(staticCategories);
      }
    } catch (error) {
      console.error("Error al cargar categorías:", error);
      setCategories(staticCategories);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isYearReady && selectedYear) {
      // Verificar isYearReady
      fetchCategoryData();
    }
  }, [selectedYear, isYearReady]); // Agregar isYearReady a dependencias

  // Exponer función globalmente para actualizar desde otros componentes
  useEffect(() => {
    (window as any).updateCategoryData = fetchCategoryData;

    return () => {
      delete (window as any).updateCategoryData;
    };
  }, [selectedYear, isYearReady]); // Agregar isYearReady a dependencias

  // Escuchar eventos personalizados para actualizar automáticamente
  useEffect(() => {
    const handleProjectUpdate = () => {
      fetchCategoryData();
    };

    // Agregar listeners para eventos personalizados
    window.addEventListener("projectCreated", handleProjectUpdate);
    window.addEventListener("projectUpdated", handleProjectUpdate);
    window.addEventListener("projectDeleted", handleProjectUpdate);

    return () => {
      window.removeEventListener("projectCreated", handleProjectUpdate);
      window.removeEventListener("projectUpdated", handleProjectUpdate);
      window.removeEventListener("projectDeleted", handleProjectUpdate);
    };
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 flex items-center animate-pulse"
          >
            <div className="mr-4 w-6 h-6 bg-gray-300 rounded"></div>
            <div>
              <div className="h-4 bg-gray-300 rounded w-20 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-24"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {categories.map((category) => (
        <div
          key={category.id}
          className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 flex flex-col md:flex-row items-center justify-center md:justify-start"
        >
          <div className="md:mr-4 text-gray-600">
            {categoryIcons[category.name] || <IconX />}
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {category.name}
            </h3>
            <p className="text-sm text-gray-500">
              {category.count} proyecto{category.count !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Category;
