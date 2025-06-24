"use client";

import {
  IconEdit,
  IconTrash,
  IconPlus,
  IconChevronDown,
  IconChevronRight,
  IconDotsVertical,
  IconMapPin,
} from "@tabler/icons-react";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import Portal from "@/app/components/ui/Portal";
import { useYear } from "@/app/context/YearContext";

interface Mesa {
  id: string;
  nombre: string;
  estado_mesa: boolean;
  sede_id: string;
  periodo: number;
}

interface Sede {
  id: string;
  nombre: string;
  mesasCount: number;
  mesas?: Mesa[];
}

// Componente SedeForm para edición
const SedeForm = ({
  initialValue = "",
  onSubmit,
  onCancel,
  isLoading = false,
  isEdit = false,
}: {
  initialValue?: string;
  onSubmit: (nombre: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
  isEdit?: boolean;
}) => {
  const [nombre, setNombre] = useState(initialValue);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim()) {
      setError("El nombre de la sede es requerido");
      return;
    }

    if (nombre.trim().length < 2) {
      setError("El nombre debe tener al menos 2 caracteres");
      return;
    }

    setError("");
    onSubmit(nombre.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="nombre"
          className="block text-sm font-medium text-slate-700 mb-2"
        >
          Nombre de la Sede
        </label>
        <input
          type="text"
          id="nombre"
          value={nombre}
          onChange={(e) => {
            setNombre(e.target.value);
            if (error) setError("");
          }}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#30c56c] focus:border-[#30c56c] outline-none transition-colors ${
            error ? "border-red-300" : "border-gray-300"
          }`}
          placeholder="Ingrese el nombre de la sede"
          disabled={isLoading}
          autoFocus
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading || !nombre.trim()}
          className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-[#30c56c] transition-colors disabled:opacity-50 flex items-center"
        >
          {isLoading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          )}
          {isEdit ? "Actualizar" : "Crear"} Sede
        </button>
      </div>
    </form>
  );
};

// Componente MesaForm
const MesaForm = ({
  initialNombre = "",
  onSubmit,
  onCancel,
  isLoading = false,
  isEdit = false,
}: {
  initialNombre?: string;
  onSubmit: (nombre: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
  isEdit?: boolean;
}) => {
  const [nombre, setNombre] = useState(initialNombre);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim()) {
      setError("El nombre de la mesa es requerido");
      return;
    }

    if (nombre.trim().length < 2) {
      setError("El nombre debe tener al menos 2 caracteres");
      return;
    }

    setError("");
    onSubmit(nombre.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="nombre"
          className="block text-sm font-medium text-slate-700 mb-2"
        >
          Nombre de la Mesa
        </label>
        <input
          type="text"
          id="nombre"
          value={nombre}
          onChange={(e) => {
            setNombre(e.target.value);
            if (error) setError("");
          }}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#30c56c] focus:border-[#30c56c] outline-none transition-colors ${
            error ? "border-red-300" : "border-gray-300"
          }`}
          placeholder="Ingrese el nombre de la mesa"
          disabled={isLoading}
          autoFocus
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading || !nombre.trim()}
          className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-[#30c56c] transition-colors disabled:opacity-50 flex items-center"
        >
          {isLoading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          )}
          {isEdit ? "Actualizar" : "Crear"} Mesa
        </button>
      </div>
    </form>
  );
};

const PollingPlaces = () => {
  const params = useParams();
  const periodo = params.periodo as string;

  const [sedes, setSedes] = useState<Sede[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSede, setExpandedSede] = useState<string | null>(null);
  const [visibleMenu, setVisibleMenu] = useState<string | null>(null);
  const [editingSede, setEditingSede] = useState<Sede | null>(null);
  const [editingMesa, setEditingMesa] = useState<Mesa | null>(null);
  const [showMesaModal, setShowMesaModal] = useState(false);
  const [selectedSedeForMesa, setSelectedSedeForMesa] = useState<string | null>(
    null
  );
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: "sede" | "mesa";
    id: string;
    name: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const menuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Fetch sedes
  const fetchSedes = async () => {
    try {
      const response = await fetch(`/api/sedes?periodo=${periodo}`);
      const data = await response.json();

      if (data.success) {
        setSedes(data.data);
      } else {
        toast.error("Error al cargar las sedes");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cargar las sedes");
    } finally {
      setLoading(false);
    }
  };

  // Expose refresh function globally
  useEffect(() => {
    (window as any).refreshSedes = fetchSedes;
    return () => {
      delete (window as any).refreshSedes;
    };
  }, []);

  // Fetch mesas for a specific sede
  const fetchMesas = async (sedeId: string) => {
    try {
      const response = await fetch(
        `/api/mesas?sede_id=${sedeId}&periodo=${periodo}`
      );
      const data = await response.json();

      if (data.success) {
        setSedes((prev) =>
          prev.map((sede) =>
            sede.id === sedeId ? { ...sede, mesas: data.data } : sede
          )
        );
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cargar las mesas");
    }
  };

  useEffect(() => {
    fetchSedes();
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (visibleMenu) {
        const menuElement = menuRefs.current[visibleMenu];
        if (menuElement && !menuElement.contains(e.target as Node)) {
          setVisibleMenu(null);
        }
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [visibleMenu]);

  // Toggle expand sede
  const toggleExpand = async (sedeId: string) => {
    if (expandedSede === sedeId) {
      setExpandedSede(null);
    } else {
      setExpandedSede(sedeId);
      const sede = sedes.find((s) => s.id === sedeId);
      if (sede && !sede.mesas) {
        await fetchMesas(sedeId);
      }
    }
  };

  // Toggle menu
  const toggleMenu = (e: React.MouseEvent, sedeId: string) => {
    e.stopPropagation();
    setVisibleMenu(visibleMenu === sedeId ? null : sedeId);
  };

  // Handle sede operations (only edit and delete, create moved to page.tsx)
  const handleEditSede = async (id: string, nombre: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/sedes?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Sede actualizada exitosamente");
        await fetchSedes();
        // Si la sede está expandida, también actualizar sus mesas
        if (expandedSede === id) {
          await fetchMesas(id);
        }
        setEditingSede(null);
      } else {
        toast.error(data.error || "Error al actualizar la sede");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al actualizar la sede");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSede = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/sedes?id=${id}&periodo=${periodo}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Sede eliminada exitosamente");
        fetchSedes();
        setDeleteConfirm(null);
      } else {
        toast.error(data.error || "Error al eliminar la sede");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al eliminar la sede");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle mesa operations
  const handleCreateMesa = async (nombre: string) => {
    if (!selectedSedeForMesa) return;

    try {
      setIsLoading(true);
      const response = await fetch("/api/mesas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          sede_id: selectedSedeForMesa,
          periodo: parseInt(periodo),
          // estado_mesa se eliminó, siempre será true por defecto en la API
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Mesa creada exitosamente");
        // Primero actualizar el conteo general de sedes
        await fetchSedes();
        // Luego actualizar las mesas de la sede específica si está expandida
        if (expandedSede === selectedSedeForMesa) {
          await fetchMesas(selectedSedeForMesa);
        }
        setShowMesaModal(false);
        setSelectedSedeForMesa(null);
      } else {
        toast.error(data.error || "Error al crear la mesa");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al crear la mesa");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditMesa = async (id: string, nombre: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/mesas?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          // estado_mesa se eliminó, se mantiene el estado actual
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Mesa actualizada exitosamente");
        const mesa = editingMesa;
        if (mesa) {
          // Actualizar las mesas de la sede específica
          await fetchMesas(mesa.sede_id);
        }
        setEditingMesa(null);
      } else {
        toast.error(data.error || "Error al actualizar la mesa");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al actualizar la mesa");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMesa = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/mesas?id=${id}&periodo=${periodo}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Mesa eliminada exitosamente");
        // Find the sede that contains this mesa
        const sedeWithMesa = sedes.find((sede) =>
          sede.mesas?.some((mesa) => mesa.id === id)
        );
        if (sedeWithMesa) {
          // Primero actualizar el conteo general de sedes
          await fetchSedes();
          // Luego actualizar las mesas de la sede específica si está expandida
          if (expandedSede === sedeWithMesa.id) {
            await fetchMesas(sedeWithMesa.id);
          }
        }
        setDeleteConfirm(null);
      } else {
        toast.error(data.error || "Error al eliminar la mesa");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al eliminar la mesa");
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2 text-gray-600">Cargando sedes...</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {sedes.map((sede) => {
          const isExpanded = expandedSede === sede.id;
          const isMenuVisible = visibleMenu === sede.id;

          return (
            <div
              key={sede.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 relative"
            >
              {/* Sede Header */}
              <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div
                  className="flex items-center space-x-4 min-w-0 flex-1 cursor-pointer"
                  onClick={() => toggleExpand(sede.id)}
                >
                  <button className="text-gray-500 flex-shrink-0">
                    {isExpanded ? (
                      <IconChevronDown size={20} />
                    ) : (
                      <IconChevronRight size={20} />
                    )}
                  </button>
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="bg-gray-100 p-2 rounded-lg flex-shrink-0">
                      <IconMapPin size={24} className="text-gray-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-slate-800 truncate">
                        {sede.nombre}
                      </h3>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4 flex-shrink-0">
                  <div className="text-right hidden sm:block">
                    <span className="text-sm text-gray-500">Mesas</span>
                    <p className="font-semibold text-lg text-slate-800">
                      {sede.mesasCount}
                    </p>
                  </div>
                  <div className="sm:hidden">
                    <span className="text-sm font-semibold text-slate-800">
                      {sede.mesasCount} mesas
                    </span>
                  </div>
                  <div className="relative">
                    <button
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
                      onClick={(e) => toggleMenu(e, sede.id)}
                    >
                      <IconDotsVertical size={20} className="text-gray-600" />
                    </button>

                    {isMenuVisible && (
                      <div
                        ref={(el) => {
                          if (el) {
                            menuRefs.current[sede.id] = el;
                          } else {
                            delete menuRefs.current[sede.id];
                          }
                        }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-[1000] border border-gray-200"
                      >
                        <div className="py-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingSede(sede);
                              setVisibleMenu(null);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <IconEdit
                              size={16}
                              className="mr-2 text-blue-600"
                            />
                            Editar Sede
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSedeForMesa(sede.id);
                              setShowMesaModal(true);
                              setVisibleMenu(null);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <IconPlus
                              size={16}
                              className="mr-2 text-green-600"
                            />
                            Agregar Mesa
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirm({
                                type: "sede",
                                id: sede.id,
                                name: sede.nombre,
                              });
                              setVisibleMenu(null);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50 transition-colors"
                          >
                            <IconTrash size={16} className="mr-2" />
                            Eliminar Sede
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Mesas Content */}
              {isExpanded && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-slate-700">
                      Mesas de Votación ({sede.mesas?.length || 0})
                    </h4>
                  </div>

                  {sede.mesas && sede.mesas.length > 0 ? (
                    <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                      {/* Mobile view */}
                      <div className="block sm:hidden">
                        {sede.mesas.map((mesa) => (
                          <div
                            key={mesa.id}
                            className="p-4 border-b border-gray-200 last:border-b-0"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium text-slate-800">
                                {mesa.nombre}
                              </h5>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => setEditingMesa(mesa)}
                                  className="p-1.5 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                  title="Editar"
                                >
                                  <IconEdit className="w-4 h-4 text-blue-600" />
                                </button>
                                <button
                                  onClick={() =>
                                    setDeleteConfirm({
                                      type: "mesa",
                                      id: mesa.id,
                                      name: mesa.nombre,
                                    })
                                  }
                                  className="p-1.5 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                  title="Eliminar"
                                >
                                  <IconTrash className="w-4 h-4 text-red-600" />
                                </button>
                              </div>
                            </div>
                            <span
                              className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                mesa.estado_mesa
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {mesa.estado_mesa ? "Abierta" : "Cerrada"}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Desktop view */}
                      <div className="hidden sm:block overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Nombre
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Estado
                              </th>
                              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {sede.mesas.map((mesa) => (
                              <tr
                                key={mesa.id}
                                className="hover:bg-gray-50 transition-colors"
                              >
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">
                                  {mesa.nombre}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <span
                                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                      mesa.estado_mesa
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {mesa.estado_mesa ? "Abierta" : "Cerrada"}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <div className="flex justify-end space-x-2">
                                    <button
                                      onClick={() => setEditingMesa(mesa)}
                                      className="p-1.5 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                      title="Editar"
                                    >
                                      <IconEdit className="w-4 h-4 text-blue-600" />
                                    </button>
                                    <button
                                      onClick={() =>
                                        setDeleteConfirm({
                                          type: "mesa",
                                          id: mesa.id,
                                          name: mesa.nombre,
                                        })
                                      }
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
                  ) : (
                    <div className="text-center py-8 text-gray-500 bg-white rounded-lg border border-gray-200">
                      No hay mesas registradas para esta sede en el periodo{" "}
                      {periodo}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal Editar Sede */}
      {editingSede && (
        <Portal>
          <div className="fixed inset-0 bg-black/35 flex items-center justify-center z-[1000] p-4 overflow-y-auto">
            <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-slate-800">
                  Editar Sede
                </h3>
                <button
                  onClick={() => setEditingSede(null)}
                  className="text-slate-500 hover:text-slate-700 h-8 w-8 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors"
                >
                  ×
                </button>
              </div>

              <SedeForm
                initialValue={editingSede.nombre}
                onSubmit={(nombre) => handleEditSede(editingSede.id, nombre)}
                onCancel={() => setEditingSede(null)}
                isLoading={isLoading}
                isEdit
              />
            </div>
          </div>
        </Portal>
      )}

      {showMesaModal && selectedSedeForMesa && (
        <Portal>
          <div className="fixed inset-0 bg-black/35 flex items-center justify-center z-[1000] p-4 overflow-y-auto">
            <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-slate-800">
                  Crear Nueva Mesa
                </h3>
                <button
                  onClick={() => {
                    setShowMesaModal(false);
                    setSelectedSedeForMesa(null);
                  }}
                  className="text-slate-500 hover:text-slate-700 h-8 w-8 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors"
                >
                  ×
                </button>
              </div>

              <MesaForm
                onSubmit={handleCreateMesa}
                onCancel={() => {
                  setShowMesaModal(false);
                  setSelectedSedeForMesa(null);
                }}
                isLoading={isLoading}
              />
            </div>
          </div>
        </Portal>
      )}

      {editingMesa && (
        <Portal>
          <div className="fixed inset-0 bg-black/35 flex items-center justify-center z-[1000] p-4 overflow-y-auto">
            <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-slate-800">
                  Editar Mesa
                </h3>
                <button
                  onClick={() => setEditingMesa(null)}
                  className="text-slate-500 hover:text-slate-700 h-8 w-8 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors"
                >
                  ×
                </button>
              </div>

              <MesaForm
                initialNombre={editingMesa.nombre}
                onSubmit={(nombre) => handleEditMesa(editingMesa.id, nombre)}
                onCancel={() => setEditingMesa(null)}
                isLoading={isLoading}
                isEdit
              />
            </div>
          </div>
        </Portal>
      )}

      {/* Modal Confirmar Eliminación */}
      {deleteConfirm && (
        <Portal>
          <div className="fixed inset-0 bg-black/35 flex items-center justify-center z-[1000] p-4 overflow-y-auto">
            <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-slate-800">
                  Confirmar Eliminación
                </h3>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="text-slate-500 hover:text-slate-700 h-8 w-8 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-600 mb-4">
                  ¿Estás seguro de que deseas eliminar{" "}
                  {deleteConfirm.type === "sede" ? "la sede" : "la mesa"}{" "}
                  <span className="font-semibold text-slate-800">
                    "{deleteConfirm.name}"
                  </span>
                  ?
                </p>
                {deleteConfirm.type === "sede" && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-yellow-800 text-sm">
                      ⚠️ Esta acción eliminará también todas las mesas asociadas
                      a esta sede.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  disabled={isLoading}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (deleteConfirm.type === "sede") {
                      handleDeleteSede(deleteConfirm.id);
                    } else {
                      handleDeleteMesa(deleteConfirm.id);
                    }
                  }}
                  disabled={isLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  {isLoading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  )}
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </>
  );
};

export default PollingPlaces;
