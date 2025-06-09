"use client";

import { useState } from "react";
import { IconUserPlus } from "@tabler/icons-react";
import { IconClipboardText } from "@tabler/icons-react";
import { IconLock } from "@tabler/icons-react";
import { IconLockOpen2 } from "@tabler/icons-react";

// Definición de interfaces para los tipos
interface Mesa {
  id: number;
  sede: string;
  estado: "Abierta" | "Cerrada";
  votos: number;
}

const Content = () => {
  const [showVotosModal, setShowVotosModal] = useState<boolean>(false);
  const [showVotanteModal, setShowVotanteModal] = useState<boolean>(false);
  const [selectedMesa, setSelectedMesa] = useState<Mesa | null>(null);

  // Datos de ejemplo para la tabla
  const mesas: Mesa[] = [
    { id: 1, sede: "Escuela Central", estado: "Abierta", votos: 45 },
    { id: 2, sede: "Escuela Central", estado: "Cerrada", votos: 120 },
    { id: 1, sede: "Centro Comunitario", estado: "Abierta", votos: 78 },
  ];

  const handleRegistrarVotos = (mesa: Mesa): void => {
    setSelectedMesa(mesa);
    setShowVotosModal(true);
  };

  const handleRegistrarVotante = (mesa: Mesa): void => {
    setSelectedMesa(mesa);
    setShowVotanteModal(true);
  };

  const handleCambiarEstado = (mesa: Mesa): void => {
    // Placeholder para futura implementación
    console.log("Cambiando estado de mesa:", mesa);
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mesa
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sede
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Votos Registrados
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mesas.map((mesa, index) => (
              <tr key={`${mesa.id}-${mesa.sede}-${index}`}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {mesa.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {mesa.sede}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      mesa.estado === "Abierta"
                        ? "bg-[#dcfce7] text-[#166534]"
                        : "bg-[#fee2e2] text-[#991b1b]"
                    }`}
                  >
                    {mesa.estado}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {mesa.votos}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleRegistrarVotos(mesa)}
                      className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 p-2 rounded-md transition-colors flex items-center"
                      title="Registrar Votos"
                    >
                      <IconClipboardText size={18} />
                      <span className="ml-1 hidden sm:inline">
                        Registrar Votos
                      </span>
                    </button>
                    <button
                      onClick={() => handleRegistrarVotante(mesa)}
                      className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 p-2 rounded-md transition-colors flex items-center"
                      title="Registrar Votante"
                    >
                      <IconUserPlus size={18} />
                      <span className="ml-1 hidden sm:inline">
                        Registrar Votante
                      </span>
                    </button>
                    <button
                      onClick={() => handleCambiarEstado(mesa)}
                      className={`${
                        mesa.estado === "Abierta"
                          ? "text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100"
                          : "text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100"
                      } p-2 rounded-md transition-colors flex items-center`}
                      title={
                        mesa.estado === "Abierta" ? "Cerrar Mesa" : "Abrir Mesa"
                      }
                    >
                      {mesa.estado === "Abierta" ? (
                        <>
                          <IconLock size={18} />
                          <span className="ml-1 hidden sm:inline">
                            Cerrar Mesa
                          </span>
                        </>
                      ) : (
                        <>
                          <IconLockOpen2 size={18} />
                          <span className="ml-1 hidden sm:inline">
                            Abrir Mesa
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal para Registrar Votos */}
      {showVotosModal && (
        <div className="fixed inset-0 bg-black/35 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-slate-800">
                Registrar Votos - Mesa {selectedMesa?.id}
              </h3>
              <button
                onClick={() => setShowVotosModal(false)}
                className="text-slate-500 hover:text-slate-700 h-8 w-8 rounded-full flex items-center justify-center hover:bg-slate-100"
              >
                ×
              </button>
            </div>
            <p className="mb-4 text-sm text-slate-600">
              Ingrese la cantidad de votos para cada opción.
            </p>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-slate-700">
                  Opción 1
                </label>
                <input
                  type="number"
                  min="0"
                  className="border border-slate-300 rounded-md p-2 w-24 focus:ring-slate-500 focus:border-slate-500"
                />
              </div>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-slate-700">
                  Opción 2
                </label>
                <input
                  type="number"
                  min="0"
                  className="border border-slate-300 rounded-md p-2 w-24 focus:ring-slate-500 focus:border-slate-500"
                />
              </div>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-slate-700">
                  Opción 3
                </label>
                <input
                  type="number"
                  min="0"
                  className="border border-slate-300 rounded-md p-2 w-24 focus:ring-slate-500 focus:border-slate-500"
                />
              </div>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-slate-700">
                  En Blanco
                </label>
                <input
                  type="number"
                  min="0"
                  className="border border-slate-300 rounded-md p-2 w-24 focus:ring-slate-500 focus:border-slate-500"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                className="bg-slate-800 text-white py-2 px-4 rounded-md hover:bg-[#30c56c] hover:text-[#e3ecea] transition-colors focus:ring-2 focus:ring-[#30c56c] focus:border-[#30c56c] outline-none"
                onClick={() => setShowVotosModal(false)}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Registrar Votante */}
      {showVotanteModal && (
        <div className="fixed inset-0 bg-black/35 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-slate-800">
                Registrar Votante - Mesa {selectedMesa?.id}
              </h3>
              <button
                onClick={() => setShowVotanteModal(false)}
                className="text-slate-500 hover:text-slate-700 h-8 w-8 rounded-full flex items-center justify-center hover:bg-slate-100"
              >
                ×
              </button>
            </div>
            <p className="mb-4 text-sm text-slate-600">
              Ingrese los datos del votante.
            </p>

            <div className="space-y-4">
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Identificación
                </label>
                <input
                  type="text"
                  className="border border-slate-300 rounded-md p-2 focus:ring-slate-500 focus:border-slate-500"
                />
              </div>
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  className="border border-slate-300 rounded-md p-2 focus:ring-slate-500 focus:border-slate-500"
                />
              </div>
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Edad
                </label>
                <input
                  type="number"
                  min="18"
                  className="border border-slate-300 rounded-md p-2 focus:ring-slate-500 focus:border-slate-500"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                className="bg-slate-800 text-white py-2 px-4 rounded-md hover:bg-[#30c56c] hover:text-[#e3ecea] transition-colors focus:ring-2 focus:ring-[#30c56c] focus:border-[#30c56c] outline-none"
                onClick={() => setShowVotanteModal(false)}
              >
                Registrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Content;
