"use client";

import {
  IconChevronDown,
  IconChevronRight,
  IconMapPin,
  IconUsers,
} from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import Portal from "@/app/components/ui/Portal";
import { useYear } from "@/app/context/YearContext";

interface Permiso {
  id: string;
  periodo: number;
  id_sede: string;
  id_mesa: string;
  id_usuario: string;
  sede_nombre: string;
  mesa_nombre: string;
  usuario_nombre: string;
  usuariosAsignados: number;
}

interface Mesa {
  id: string;
  nombre: string;
  sede_id: string;
  sede_nombre: string;
}

interface Usuario {
  id: string;
  nombre: string;
  usuario: string;
  rol: string;
}

interface Sede {
  id: string;
  nombre: string;
  mesasCount: number;
  mesas?: MesaWithAssignments[];
}

interface MesaWithAssignments {
  id: string;
  nombre: string;
  sede_id: string;
  usuarios: UsuarioAsignado[];
}

interface UsuarioAsignado {
  id: string;
  nombre: string;
  permisoId: string;
}

interface AssignmentData {
  sedes: Sede[];
  mesas: Mesa[];
  usuarios: Usuario[];
}

// Componente para asignar usuarios a una mesa
const AssignUsersModal = ({
  mesa,
  usuarios,
  currentAssignments,
  onSubmit,
  onCancel,
  isLoading = false,
}: {
  mesa: MesaWithAssignments;
  usuarios: Usuario[];
  currentAssignments: string[];
  onSubmit: (usuarioIds: string[]) => void;
  onCancel: () => void;
  isLoading?: boolean;
}) => {
  const [selectedUsers, setSelectedUsers] =
    useState<string[]>(currentAssignments);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = usuarios.filter(
    (user) =>
      user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.usuario.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUserToggle = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(selectedUsers);
  };

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/35 flex items-center justify-center z-[1000] p-4 overflow-y-auto">
        <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-slate-800">
              Asignar Usuarios - {mesa.nombre}
            </h3>
            <button
              onClick={onCancel}
              className="text-slate-500 hover:text-slate-700 h-8 w-8 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors"
            >
              ×
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Seleccione los usuarios que desea asignar a esta mesa
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Buscador */}
            <div>
              <input
                type="text"
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#30c56c] focus:border-[#30c56c] outline-none"
              />
            </div>

            {/* Lista de usuarios */}
            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left">Usuario</th>
                    <th className="px-4 py-2 text-left">Nombre</th>
                    <th className="px-4 py-2 text-left">Rol</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100">
                      <td className="px-4 py-2">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => handleUserToggle(user.id)}
                            className="rounded border-gray-300 text-[#30c56c] focus:ring-[#30c56c]"
                          />
                          <span>{user.usuario}</span>
                        </label>
                      </td>
                      <td className="px-4 py-2">{user.nombre}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            user.rol === "Administrador"
                              ? "bg-blue-100 text-blue-800"
                              : user.rol === "Supervisor"
                              ? "bg-green-100 text-green-800"
                              : "bg-orange-100 text-orange-800"
                          }`}
                        >
                          {user.rol}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Información de la mesa */}
            <div className="bg-gray-50 p-3 rounded-lg text-sm">
              <p>
                <strong>Mesa:</strong> {mesa.nombre}
              </p>
              <p>
                <strong>Usuarios actualmente asignados:</strong>{" "}
                {currentAssignments.length}
              </p>
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
                disabled={isLoading}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-[#30c56c] transition-colors disabled:opacity-50 flex items-center"
              >
                {isLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                )}
                Guardar Asignaciones
              </button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  );
};

const AssignmentsList = () => {
  const params = useParams();
  const periodo = params.periodo as string;

  const [sedes, setSedes] = useState<Sede[]>([]);
  const [assignmentData, setAssignmentData] = useState<AssignmentData>({
    sedes: [],
    mesas: [],
    usuarios: [],
  });
  const [loading, setLoading] = useState(true);
  const [expandedSede, setExpandedSede] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedMesa, setSelectedMesa] = useState<MesaWithAssignments | null>(
    null
  );
  const [isAssigning, setIsAssigning] = useState(false);

  const fetchSedes = async () => {
    try {
      const response = await fetch(`/api/sedes?periodo=${periodo}`);
      const data = await response.json();
      if (data.success) {
        setSedes(data.data.map((sede: any) => ({ ...sede, mesas: undefined })));
      }
    } catch (error) {
      console.error("Error al cargar sedes:", error);
      toast.error("Error al cargar las sedes");
    }
  };

  const fetchMesasWithAssignments = async (sedeId: string) => {
    try {
      // Obtener mesas de la sede
      const mesasResponse = await fetch(
        `/api/mesas?sede_id=${sedeId}&periodo=${periodo}`
      );
      const mesasData = await mesasResponse.json();

      // Obtener permisos del periodo
      const permisosResponse = await fetch(`/api/permisos?periodo=${periodo}`);
      const permisosData = await permisosResponse.json();

      if (mesasData.success && permisosData.success) {
        const mesas = mesasData.data;
        const permisos = permisosData.data;

        // Agrupar permisos por mesa
        const permisosByMesa = permisos.reduce((acc: any, permiso: Permiso) => {
          if (permiso.id_sede === sedeId) {
            if (!acc[permiso.id_mesa]) {
              acc[permiso.id_mesa] = [];
            }
            acc[permiso.id_mesa].push({
              id: permiso.id_usuario,
              nombre: permiso.usuario_nombre,
              permisoId: permiso.id,
            });
          }
          return acc;
        }, {});

        // Combinar mesas con sus asignaciones
        const mesasWithAssignments = mesas.map((mesa: Mesa) => ({
          id: mesa.id,
          nombre: mesa.nombre,
          sede_id: mesa.sede_id,
          usuarios: permisosByMesa[mesa.id] || [],
        }));

        // Actualizar la sede con sus mesas
        setSedes((prev) =>
          prev.map((sede) =>
            sede.id === sedeId ? { ...sede, mesas: mesasWithAssignments } : sede
          )
        );
      }
    } catch (error) {
      console.error("Error al cargar mesas con asignaciones:", error);
      toast.error("Error al cargar las mesas");
    }
  };

  const fetchAssignmentData = async () => {
    try {
      const response = await fetch(`/api/permisos/data?periodo=${periodo}`);
      const data = await response.json();
      if (data.success) {
        setAssignmentData(data.data);
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
      toast.error("Error al cargar los datos");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchSedes(), fetchAssignmentData()]);
      setLoading(false);
    };
    loadData();
  }, [periodo]);

  // Toggle expand sede
  const toggleExpand = async (sedeId: string) => {
    if (expandedSede === sedeId) {
      setExpandedSede(null);
    } else {
      setExpandedSede(sedeId);
      const sede = sedes.find((s) => s.id === sedeId);
      if (sede && !sede.mesas) {
        await fetchMesasWithAssignments(sedeId);
      }
    }
  };

  const handleAssignUsers = (mesa: MesaWithAssignments) => {
    setSelectedMesa(mesa);
    setShowAssignModal(true);
  };

  const handleSaveAssignments = async (usuarioIds: string[]) => {
    if (!selectedMesa) return;

    try {
      setIsAssigning(true);

      // Obtener asignaciones actuales para esta mesa
      const currentUserIds = selectedMesa.usuarios.map((u) => u.id);

      // Usuarios a agregar
      const toAdd = usuarioIds.filter((id) => !currentUserIds.includes(id));

      // Usuarios a eliminar
      const toRemove = currentUserIds.filter((id) => !usuarioIds.includes(id));

      // Agregar nuevos permisos
      for (const userId of toAdd) {
        await fetch("/api/permisos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            periodo: parseInt(periodo),
            id_sede: selectedMesa.sede_id,
            id_mesa: selectedMesa.id,
            id_usuario: userId,
          }),
        });
      }

      // Eliminar permisos
      for (const userId of toRemove) {
        const usuario = selectedMesa.usuarios.find((u) => u.id === userId);
        if (usuario) {
          await fetch(`/api/permisos?id=${usuario.permisoId}`, {
            method: "DELETE",
          });
        }
      }

      toast.success("Asignaciones actualizadas exitosamente");
      setShowAssignModal(false);
      setSelectedMesa(null);

      // Refrescar las mesas de la sede expandida
      if (expandedSede) {
        await fetchMesasWithAssignments(expandedSede);
      }
    } catch (error) {
      console.error("Error al guardar asignaciones:", error);
      toast.error("Error al guardar las asignaciones");
    } finally {
      setIsAssigning(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2 text-gray-600">Cargando asignaciones...</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {sedes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-gray-500">No hay sedes registradas</p>
          </div>
        ) : (
          sedes.map((sede) => {
            const isExpanded = expandedSede === sede.id;

            return (
              <div
                key={sede.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 relative"
              >
                {/* Sede Header */}
                <div
                  className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => toggleExpand(sede.id)}
                >
                  <div className="flex items-center space-x-4 min-w-0 flex-1">
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
                        {sede.mesasCount} mesa{sede.mesasCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mesas Content */}
                {isExpanded && (
                  <div className="border-t border-gray-200 p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-slate-700">
                        Asignaciones por Mesa ({sede.mesas?.length || 0})
                      </h4>
                    </div>

                    {sede.mesas && sede.mesas.length > 0 ? (
                      <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left font-medium text-gray-700">
                                Mesa
                              </th>
                              <th className="px-4 py-3 text-left font-medium text-gray-700">
                                Usuarios Asignados
                              </th>
                              <th className="px-4 py-3 text-right font-medium text-gray-700">
                                Acciones
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {sede.mesas.map((mesa) => (
                              <tr
                                key={mesa.id}
                                className="border-b border-gray-100 hover:bg-gray-50"
                              >
                                <td className="px-4 py-3 font-medium text-slate-800">
                                  {mesa.nombre}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center space-x-2">
                                    {mesa.usuarios.length > 0 ? (
                                      <>
                                        {mesa.usuarios
                                          .slice(0, 2)
                                          .map((usuario) => (
                                            <span
                                              key={usuario.id}
                                              className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                                            >
                                              {usuario.nombre}
                                            </span>
                                          ))}
                                        {mesa.usuarios.length > 2 && (
                                          <span className="text-gray-500 text-xs">
                                            +{mesa.usuarios.length - 2} más
                                          </span>
                                        )}
                                      </>
                                    ) : (
                                      <span className="text-gray-400 text-sm italic">
                                        Sin asignar
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAssignUsers(mesa);
                                    }}
                                    className="p-1.5 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                    title="Asignar"
                                  >
                                    <IconUsers className="w-5 h-5 text-blue-600" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                        <p className="text-gray-500">
                          No hay mesas registradas para esta sede en el período{" "}
                          {periodo}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal Asignar Usuarios */}
      {showAssignModal && selectedMesa && (
        <AssignUsersModal
          mesa={selectedMesa}
          usuarios={assignmentData.usuarios}
          currentAssignments={selectedMesa.usuarios.map((u) => u.id)}
          onSubmit={handleSaveAssignments}
          onCancel={() => {
            setShowAssignModal(false);
            setSelectedMesa(null);
          }}
          isLoading={isAssigning}
        />
      )}
    </>
  );
};

export default AssignmentsList;
