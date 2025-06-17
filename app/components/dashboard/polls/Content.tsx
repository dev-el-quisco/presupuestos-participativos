"use client";

import { useState, useEffect } from "react";
import {
  IconUserPlus,
  IconClipboardText,
  IconLock,
  IconLockOpen2,
  IconDotsVertical,
} from "@tabler/icons-react";
import Portal from "@/app/components/ui/Portal";

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
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

  const [mesas, setMesas] = useState<Mesa[]>([
    { id: 1, sede: "Escuela Central", estado: "Abierta", votos: 45 },
    { id: 2, sede: "Escuela Central", estado: "Cerrada", votos: 120 },
    { id: 1, sede: "Centro Comunitario", estado: "Abierta", votos: 78 },
  ]);

  // Controlar el overflow del body cuando los modales están abiertos
  useEffect(() => {
    if (showVotosModal || showVotanteModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showVotosModal, showVotanteModal]);

  const toggleDropdown = (index: number) => {
    setActiveDropdown(activeDropdown === index ? null : index);
  };

  const handleCambiarEstado = (mesa: Mesa): void => {
    setMesas((prevMesas) =>
      prevMesas.map((m) =>
        m.id === mesa.id && m.sede === mesa.sede
          ? { ...m, estado: m.estado === "Abierta" ? "Cerrada" : "Abierta" }
          : m
      )
    );
    setActiveDropdown(null);
  };

  const handleRegistrarVotos = (mesa: Mesa): void => {
    setSelectedMesa(mesa);
    setShowVotosModal(true);
    setActiveDropdown(null);
  };

  const handleRegistrarVotante = (mesa: Mesa): void => {
    setSelectedMesa(mesa);
    setShowVotanteModal(true);
    setActiveDropdown(null);
  };

  return (
    <>
      <div className="w-full bg-white rounded-lg shadow-md overflow-hidden">
        {/* Tabla responsiva */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mesa
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Sede
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Votos
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider md:hidden">
                  Acciones
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mesas.map((mesa, index) => (
                <tr key={`${mesa.id}-${mesa.sede}-${index}`}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {mesa.id}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                    {mesa.sede}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        mesa.estado === "Abierta"
                          ? "bg-[#dcfce7] text-[#166534]"
                          : "bg-[#fee2e2] text-[#991b1b]"
                      }`}
                    >
                      {mesa.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {mesa.votos}
                  </td>

                  {/* Acciones para dispositivos móviles */}
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium md:hidden relative">
                    <button
                      onClick={() => toggleDropdown(index)}
                      className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                    >
                      <IconDotsVertical size={20} />
                    </button>

                    {activeDropdown === index && (
                      <div className="absolute right-4 z-10 mt-1 w-48 rounded-md bg-white shadow-lg border border-gray-200">
                        <div className="py-1">
                          <button
                            onClick={() => handleRegistrarVotante(mesa)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          >
                            <IconUserPlus size={16} className="mr-2" />
                            Registrar Votante
                          </button>
                          <button
                            onClick={() => handleRegistrarVotos(mesa)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          >
                            <IconClipboardText size={16} className="mr-2" />
                            Registrar Votos
                          </button>
                          <button
                            onClick={() => handleCambiarEstado(mesa)}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center ${
                              mesa.estado === "Abierta"
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            {mesa.estado === "Abierta" ? (
                              <IconLock size={16} className="mr-2" />
                            ) : (
                              <IconLockOpen2 size={16} className="mr-2" />
                            )}
                            {mesa.estado === "Abierta"
                              ? "Cerrar Mesa"
                              : "Abrir Mesa"}
                          </button>
                        </div>
                      </div>
                    )}
                  </td>

                  {/* Acciones para tablet y desktop */}
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium hidden md:table-cell">
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleRegistrarVotante(mesa)}
                        className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 p-2 rounded-md transition-colors flex items-center"
                        title="Registrar Votante"
                      >
                        <IconUserPlus size={18} />
                        <span className="ml-1 hidden lg:inline">
                          Registrar Votante
                        </span>
                      </button>
                      <button
                        onClick={() => handleRegistrarVotos(mesa)}
                        className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 p-2 rounded-md transition-colors flex items-center"
                        title="Registrar Votos"
                      >
                        <IconClipboardText size={18} />
                        <span className="ml-1 hidden lg:inline">
                          Registrar Votos
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
                          mesa.estado === "Abierta"
                            ? "Cerrar Mesa"
                            : "Abrir Mesa"
                        }
                      >
                        {mesa.estado === "Abierta" ? (
                          <IconLock size={18} />
                        ) : (
                          <IconLockOpen2 size={18} />
                        )}
                        <span className="ml-1 hidden lg:inline">
                          {mesa.estado === "Abierta"
                            ? "Cerrar Mesa"
                            : "Abrir Mesa"}
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modales usando Portal */}
      {showVotosModal && (
        <Portal>
          <div className="fixed inset-0 bg-black/35 flex items-center justify-center z-[1000] p-4 overflow-y-auto">
            <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-slate-800">
                  Votos - Mesa {selectedMesa?.id}
                </h3>
                <button
                  onClick={() => setShowVotosModal(false)}
                  className="text-slate-500 hover:text-slate-700 h-8 w-8 rounded-full flex items-center justify-center hover:bg-slate-100"
                >
                  ×
                </button>
              </div>
              <p className="mb-4 text-sm text-slate-600">
                Ingrese votos para cada opción:
              </p>

              <div className="space-y-3">
                {[1, 2, 3].map((opcion) => (
                  <div key={opcion} className="flex flex-col">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Opción {opcion}
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="border border-slate-300 rounded-md p-2 w-full focus:ring-slate-500 focus:border-slate-500"
                    />
                  </div>
                ))}
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    En Blanco
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="border border-slate-300 rounded-md p-2 w-full focus:ring-slate-500 focus:border-slate-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                  onClick={() => setShowVotosModal(false)}
                >
                  Cancelar
                </button>
                <button
                  className="bg-slate-800 text-white py-2 px-4 rounded-md hover:bg-[#30c56c] hover:text-[#e3ecea] transition-colors"
                  onClick={() => setShowVotosModal(false)}
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {showVotanteModal && (
        <Portal>
          <div className="fixed inset-0 bg-black/35 flex items-center justify-center z-[1000] p-4 overflow-y-auto">
            <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-slate-800">
                  Votante - Mesa {selectedMesa?.id}
                </h3>
                <button
                  onClick={() => setShowVotanteModal(false)}
                  className="text-slate-500 hover:text-slate-700 h-8 w-8 rounded-full flex items-center justify-center hover:bg-slate-100"
                >
                  ×
                </button>
              </div>
              <p className="mb-4 text-sm text-slate-600">
                Ingrese datos del votante:
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

              <div className="mt-6 flex justify-end gap-3">
                <button
                  className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                  onClick={() => setShowVotanteModal(false)}
                >
                  Cancelar
                </button>
                <button
                  className="bg-slate-800 text-white py-2 px-4 rounded-md hover:bg-[#30c56c] hover:text-[#e3ecea] transition-colors"
                  onClick={() => setShowVotanteModal(false)}
                >
                  Registrar
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </>
  );
};

export default Content;
