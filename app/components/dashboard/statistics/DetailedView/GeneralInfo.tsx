import { IconTrendingUp } from "@tabler/icons-react";

const GeneralInfo = () => {
  // Datos para las tarjetas de información general
  const infoCards = [
    {
      title: "Proyecto Más Votado",
      value: "1,155",
      description: "C1: Mejoramiento de plazas públicas",
      subtext: "Proyectos Comunales",
      color: "text-green-600",
    },
    {
      title: "Sede con Mayor Participación",
      value: "1,294",
      description: "Ex Hotel Italia",
      subtext: "22.3% del total",
      color: "text-blue-600",
    },
    {
      title: "Categoría Líder",
      value: "2,453",
      description: "Proyectos Comunales",
      subtext: "42.3% del total",
      color: "text-green-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
      {infoCards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 flex flex-col"
        >
          <h3 className="text-lg font-semibold mb-2 flex items-center">
            <IconTrendingUp className="mr-2" size={20} />
            {card.title}
          </h3>
          <div className={`text-3xl font-bold ${card.color} my-2`}>
            {card.value}
          </div>
          <div className="text-md font-medium">{card.description}</div>
          <div className="text-sm text-gray-500 mt-1">{card.subtext}</div>
        </div>
      ))}
    </div>
  );
};

export default GeneralInfo;
