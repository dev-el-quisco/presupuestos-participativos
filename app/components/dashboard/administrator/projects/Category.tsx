"use client";
import { IconMoodSmile } from "@tabler/icons-react";
import { IconBallAmericanFootball } from "@tabler/icons-react";
import { IconBook } from "@tabler/icons-react";
import { IconBuildingCommunity } from "@tabler/icons-react";

import { useYear } from "@/app/context/YearContext";

const Category = () => {
  const { selectedYear } = useYear();

  // Datos de categorías con cantidad de proyectos activos
  const categories = [
    {
      id: "comunales",
      name: "Comunales",
      count: 4,
      icon: <IconBuildingCommunity />,
    },
    {
      id: "infantiles",
      name: "Infantiles",
      count: 4,
      icon: <IconMoodSmile />,
    },
    {
      id: "deportivos",
      name: "Deportivos",
      count: 3,
      icon: <IconBallAmericanFootball />,
    },
    {
      id: "culturales",
      name: "Culturales",
      count: 3,
      icon: <IconBook />,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {categories.map((category) => (
        <div
          key={category.id}
          className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 flex items-center"
        >
          <div className="mr-4 text-gray-600">{category.icon}</div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {category.name}
            </h3>
            <p className="text-sm text-gray-500">
              {category.count} proyectos activos
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Category;
