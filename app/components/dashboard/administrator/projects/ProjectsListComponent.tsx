import { IconEdit } from "@tabler/icons-react";
import { IconTrash } from "@tabler/icons-react";

// Define the types for your project categories and the Project object
type ProjectType = "Comunales" | "Infantiles" | "Deportivos" | "Culturales";

interface Project {
  id: string;
  name: string;
  type: ProjectType;
  sector: string;
  votes: number;
}

const ProjectsListComponent = () => {
  // Datos de ejemplo para los proyectos
  const projects: Project[] = [
    {
      id: "C1",
      name: "Mejoramiento de plazas públicas",
      type: "Comunales",
      sector: "Norte",
      votes: 1155,
    },
    {
      id: "I1",
      name: "Instalación de juegos infantiles",
      type: "Infantiles",
      sector: "Centro",
      votes: 687,
    },
  ];

  // Mapeo de categorías a colores
  const categoryColors: Record<ProjectType, string> = {
    Comunales: "bg-green-100 text-green-800",
    Infantiles: "bg-blue-100 text-blue-800",
    Deportivos: "bg-yellow-100 text-yellow-800",
    Culturales: "bg-red-100 text-red-800",
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">Nombre del Proyecto</th>
              <th className="px-6 py-3">Tipo</th>
              <th className="px-6 py-3">Sector</th>
              <th className="px-6 py-3">Votos</th>
              <th className="px-6 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr
                key={project.id}
                className="border-b border-gray-200 hover:bg-gray-200"
              >
                <td className="px-6 py-4 font-medium">{project.id}</td>
                <td className="px-6 py-4">{project.name}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      categoryColors[project.type] ||
                      "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {project.type}
                  </span>
                </td>
                <td className="px-6 py-4">{project.sector}</td>
                <td className="px-6 py-4 font-medium">
                  {project.votes.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end space-x-2">
                    <button
                      className="p-1.5 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      title="Editar"
                    >
                      <IconEdit className="w-5 h-5 text-blue-600" />
                    </button>
                    <button
                      className="p-1.5 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                      title="Eliminar"
                    >
                      <IconTrash className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProjectsListComponent;
