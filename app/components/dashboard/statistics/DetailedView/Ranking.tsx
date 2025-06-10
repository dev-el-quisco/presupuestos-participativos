const Ranking = () => {
  // Datos para el ranking de proyectos
  const projectsRanking = [
    {
      position: 1,
      id: "C1",
      title: "Mejoramiento de plazas públicas",
      category: "Proyectos Comunales",
      categoryId: "comunales",
      votes: 1155,
      percentTotal: 19.7,
      percentCategory: 47.1,
    },
    {
      position: 2,
      id: "I1",
      title: "Instalación de juegos infantiles",
      category: "Proyectos Infantiles",
      categoryId: "infantiles",
      votes: 687,
      percentTotal: 11.7,
      percentCategory: 36.6,
    },
    {
      position: 3,
      id: "I2",
      title: "Talleres educativos para niños",
      category: "Proyectos Infantiles",
      categoryId: "infantiles",
      votes: 542,
      percentTotal: 9.3,
      percentCategory: 28.9,
    },
    {
      position: 4,
      id: "C2",
      title: "Iluminación LED en calles principales",
      category: "Proyectos Comunales",
      categoryId: "comunales",
      votes: 481,
      percentTotal: 8.2,
      percentCategory: 19.6,
    },
    {
      position: 5,
      id: "D1",
      title: "Construcción de canchas deportivas",
      category: "Proyectos Deportivos",
      categoryId: "deportivos",
      votes: 456,
      percentTotal: 7.8,
      percentCategory: 46.2,
    },
    {
      position: 6,
      id: "C3",
      title: "Creación de áreas verdes",
      category: "Proyectos Comunales",
      categoryId: "comunales",
      votes: 428,
      percentTotal: 7.3,
      percentCategory: 17.4,
    },
    {
      position: 7,
      id: "C4",
      title: "Sistema de seguridad vecinal",
      category: "Proyectos Comunales",
      categoryId: "comunales",
      votes: 389,
      percentTotal: 6.6,
      percentCategory: 15.9,
    },
    {
      position: 8,
      id: "I3",
      title: "Biblioteca infantil comunitaria",
      category: "Proyectos Infantiles",
      categoryId: "infantiles",
      votes: 389,
      percentTotal: 6.6,
      percentCategory: 20.7,
    },
    {
      position: 9,
      id: "D2",
      title: "Equipamiento deportivo comunitario",
      category: "Proyectos Deportivos",
      categoryId: "deportivos",
      votes: 321,
      percentTotal: 5.5,
      percentCategory: 32.5,
    },
    {
      position: 10,
      id: "I4",
      title: "Programa de actividades recreativas",
      category: "Proyectos Infantiles",
      categoryId: "infantiles",
      votes: 258,
      percentTotal: 4.4,
      percentCategory: 13.8,
    },
  ];

  // 1. Definir tipo para las claves de categorías
  type CategoryKey = "comunales" | "infantiles" | "deportivos" | "culturales";

  // 2. Mapeo de categorías a colores pasteles con aserción 'as const'
  const categoryColors = {
    comunales: {
      bg: "bg-green-100",
      text: "text-green-800",
    },
    infantiles: {
      bg: "bg-blue-100",
      text: "text-blue-800",
    },
    deportivos: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
    },
    culturales: {
      bg: "bg-red-100",
      text: "text-red-800",
    },
  } as const;

  // Color por defecto para categorías no encontradas
  const defaultColor = {
    bg: "bg-gray-100",
    text: "text-gray-800",
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h2 className="text-xl mb-4">Ranking Completo de Proyectos</h2>
      <p className="text-gray-600 mb-6">
        Todos los proyectos ordenados por cantidad de votos
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border border-gray-200 rounded-lg">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 rounded-lg border border-gray-200">
            <tr className="rounded-lg">
              <th className="px-4 py-3 text-center">Posición</th>
              <th className="px-4 py-3">Proyecto</th>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3 text-right">Votos</th>
              <th className="px-4 py-3 text-right">% del Total</th>
              <th className="px-4 py-3 text-right">% de Categoría</th>
            </tr>
          </thead>
          <tbody className="rounded-lg">
            {projectsRanking.map((project) => {
              // 3. Verificar si la clave es válida
              const categoryKey = project.categoryId as CategoryKey;
              const categoryColor = categoryColors[categoryKey] || defaultColor;

              return (
                <tr
                  key={project.id}
                  className="border-b hover:bg-gray-50 border border-gray-200"
                >
                  <td className="px-4 py-3 text-center">
                    <div
                      className={`w-8 h-8 rounded-full ${
                        project.position <= 3 ? "bg-blue-500" : "bg-gray-200"
                      } flex items-center justify-center mx-auto text-white font-medium`}
                    >
                      {project.position}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium">{project.title}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${categoryColor.bg} ${categoryColor.text}`}
                    >
                      {project.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-bold">
                    {project.votes}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {project.percentTotal}%
                  </td>
                  <td className="px-4 py-3 text-right">
                    {project.percentCategory}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Ranking;
