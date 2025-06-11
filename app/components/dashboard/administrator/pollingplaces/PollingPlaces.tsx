"use client";

import { IconEdit } from "@tabler/icons-react";
import { IconTrash } from "@tabler/icons-react";
import { IconPlus } from "@tabler/icons-react";
import {
  IconChevronDown,
  IconChevronRight,
  IconDotsVertical,
  IconMapPin,
} from "@tabler/icons-react";
import { useState } from "react";

const PollingPlaces = () => {
  // Estado para controlar qué sede está expandida (solo una a la vez)
  const [expandedSede, setExpandedSede] = useState<string | null>(null);
  // Estado para controlar qué menú de opciones está visible
  const [visibleMenu, setVisibleMenu] = useState<string | null>(null);

  // Datos de ejemplo para las sedes y mesas
  const sedesData = [
    {
      id: "1",
      nombre: "Sede Social Quisco Norte",
      direccion: "Av. Principal 123, Sector Norte",
      mesas: [
        { id: "1", nombre: "Mesa 1", estado: "Abierta" },
        { id: "2", nombre: "Mesa 2", estado: "Abierta" },
        { id: "3", nombre: "Mesa 3", estado: "Cerrada" },
      ],
    },
    {
      id: "2",
      nombre: "Sede Social Cordillera",
      direccion: "Calle Secundaria 456, Sector Centro",
      mesas: [
        { id: "4", nombre: "Mesa 1", estado: "Abierta" },
        { id: "5", nombre: "Mesa 2", estado: "Abierta" },
      ],
    },
    {
      id: "3",
      nombre: "Ex Hotel Italia",
      direccion: "Plaza Central s/n, Centro Histórico",
      mesas: [
        { id: "6", nombre: "Mesa 1", estado: "Abierta" },
        { id: "7", nombre: "Mesa 2", estado: "Abierta" },
        { id: "8", nombre: "Mesa 3", estado: "Abierta" },
        { id: "9", nombre: "Mesa 4", estado: "Cerrada" },
        { id: "10", nombre: "Mesa 5", estado: "Abierta" },
        { id: "11", nombre: "Mesa 6", estado: "Cerrada" },
      ],
    },
    {
      id: "4",
      nombre: "Sede Social El Mirador",
      direccion: "Cerro El Mirador 789, Sector Sur",
      mesas: [
        { id: "12", nombre: "Mesa 1", estado: "Abierta" },
        { id: "13", nombre: "Mesa 2", estado: "Abierta" },
        { id: "14", nombre: "Mesa 3", estado: "Abierta" },
      ],
    },
  ];

  // Función para alternar la expansión de una sede (solo una a la vez)
  const toggleExpand = (sedeNombre: string) => {
    setExpandedSede(expandedSede === sedeNombre ? null : sedeNombre);
  };

  // Función para mostrar/ocultar el menú de opciones
  const toggleMenu = (e: React.MouseEvent, sedeId: string) => {
    e.stopPropagation();
    setVisibleMenu(visibleMenu === sedeId ? null : sedeId);
  };

  return (
    <div className="space-y-4">
      {sedesData.map((sede) => {
        const isExpanded = expandedSede === sede.nombre;
        const isMenuVisible = visibleMenu === sede.id;

        return (
          <div
            key={sede.id}
            className="border border-gray-200 rounded-lg bg-white overflow-hidden relative"
          >
            {/* Cabecera de la sede (siempre visible) */}
            <div
              className="flex items-center justify-between p-4 cursor-pointer"
              onClick={() => toggleExpand(sede.nombre)}
            >
              <div className="flex items-center space-x-4">
                <button className="text-gray-500">
                  {isExpanded ? (
                    <IconChevronDown size={20} />
                  ) : (
                    <IconChevronRight size={20} />
                  )}
                </button>
                <div className="flex items-center space-x-3">
                  <div className="bg-gray-100 p-2 rounded-lg">
                    <IconMapPin size={24} className="text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{sede.nombre}</h3>
                    <p className="text-sm text-gray-500 flex items-center">
                      <IconMapPin size={14} className="inline mr-1" />
                      {sede.direccion}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <span className="text-sm text-gray-500">Mesas</span>
                  <p className="font-semibold text-lg">{sede.mesas.length}</p>
                </div>
                <div className="relative">
                  <button
                    className="p-2 rounded-full hover:bg-gray-100"
                    onClick={(e) => toggleMenu(e, sede.id)}
                  >
                    <IconDotsVertical size={20} className="text-gray-600" />
                  </button>
                  
                  {/* Menú de opciones (visible cuando se hace clic en los tres puntos) */}
                  {isMenuVisible && (
                    <div className="fixed right-4 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                      <div className="py-1">
                        <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <IconEdit size={16} className="mr-2 text-blue-600" />
                          Editar Sede
                        </button>
                        <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <IconPlus size={16} className="mr-2 text-green-600" />
                          Agregar Mesa
                        </button>
                        <button className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                          <IconTrash size={16} className="mr-2" />
                          Eliminar Sede
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Contenido expandible (mesas) */}
            {isExpanded && (
              <div className="border-t border-gray-200 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-700 flex items-center">
                    <span>Mesas de Votación ({sede.mesas.length})</span>
                  </h4>
                </div>

                <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Nombre
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Estado
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sede.mesas.map((mesa) => (
                        <tr key={mesa.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {mesa.nombre}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                mesa.estado === "Abierta"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {mesa.estado}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                className="p-1.5 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                title="Editar"
                              >
                                <IconEdit className="w-4 h-4 text-blue-600" />
                              </button>
                              <button
                                className="p-1.5 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                title="Eliminar"
                              >
                                <IconTrash className="w-4 h-4 text-red-600" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PollingPlaces;
