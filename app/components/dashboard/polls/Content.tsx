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
import { useAuth } from "@/app/hooks/useAuth";
import { useYear } from "@/app/context/YearContext";
import toast from "react-hot-toast";

interface Mesa {
  id: string;
  nombre: string;
  estado_mesa: boolean;
  sede_id: string;
  periodo: number;
  sede_nombre: string;
  votos_count: number;
}

interface Proyecto {
  id_proyecto: string;
  nombre: string;
}

interface VotanteForm {
  nombre: string;
  direccion: string;
  fecha_nacimiento: string;
  rut: string;
  extranjero: boolean;
}

interface VotoForm {
  [key: string]: number;
}

const Content = () => {
  const { user } = useAuth();
  const { selectedYear } = useYear();
  const [showVotosModal, setShowVotosModal] = useState<boolean>(false);
  const [showVotanteModal, setShowVotanteModal] = useState<boolean>(false);
  const [selectedMesa, setSelectedMesa] = useState<Mesa | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);

  // Formularios
  const [votanteForm, setVotanteForm] = useState<VotanteForm>({
    nombre: "",
    direccion: "",
    fecha_nacimiento: "",
    rut: "",
    extranjero: false,
  });

  const [votoForm, setVotoForm] = useState<VotoForm>({});

  // Cargar mesas según permisos del usuario
  const fetchMesas = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `/api/mesas/user-permissions?periodo=${selectedYear}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMesas(data.data);
      } else {
        toast.error("Error al cargar las mesas");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cargar las mesas");
    } finally {
      setLoading(false);
    }
  };

  // Cargar proyectos del año seleccionado
  const fetchProyectos = async () => {
    try {
      const response = await fetch(`/api/projects?periodo=${selectedYear}`);
      if (response.ok) {
        const data = await response.json();
        setProyectos(data.projects); // Cambiar de data.data a data.projects
      }
    } catch (error) {
      console.error("Error al cargar proyectos:", error);
    }
  };

  useEffect(() => {
    if (selectedYear && user) {
      fetchMesas();
      fetchProyectos();
    }
  }, [selectedYear, user]);

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

  // Cambiar estado de mesa (solo Encargado de Local y Administrador)
  const handleCambiarEstado = async (mesa: Mesa): Promise<void> => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/mesas?id=${mesa.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre: mesa.nombre,
          estado_mesa: !mesa.estado_mesa,
        }),
      });

      if (response.ok) {
        setMesas((prevMesas) =>
          prevMesas.map((m) =>
            m.id === mesa.id ? { ...m, estado_mesa: !m.estado_mesa } : m
          )
        );
        toast.success(
          `Mesa ${!mesa.estado_mesa ? "abierta" : "cerrada"} exitosamente`
        );
      } else {
        toast.error("Error al cambiar el estado de la mesa");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cambiar el estado de la mesa");
    }
    setActiveDropdown(null);
  };

  // Agregar estado para votos existentes
  const [votosExistentes, setVotosExistentes] = useState<VotoForm>({});
  
  // Función para cargar votos existentes de una mesa
  const fetchVotosExistentes = async (mesaId: string) => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `/api/votos?mesa_id=${mesaId}&periodo=${selectedYear}`, // Cambiar id_mesa por mesa_id
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (response.ok) {
        const result = await response.json();
        const votosCount: VotoForm = {};
        
        // Inicializar contadores
        proyectos.forEach((proyecto) => {
          votosCount[proyecto.id_proyecto] = 0;
        });
        votosCount["Blanco"] = 0;
        votosCount["Nulo"] = 0;
  
        // Contar votos existentes usando la estructura correcta
        result.data.forEach((voto: any) => { // Cambiar data.votos por result.data
          if (voto.tipo_voto === "Normal" && voto.id_proyecto) {
            votosCount[voto.id_proyecto] = voto.cantidad; // Usar cantidad directamente
          } else if (voto.tipo_voto === "Blanco") {
            votosCount["Blanco"] = voto.cantidad;
          } else if (voto.tipo_voto === "Nulo") {
            votosCount["Nulo"] = voto.cantidad;
          }
        });
  
        setVotosExistentes(votosCount);
      } else {
        console.error("Error al cargar votos:", response.status);
      }
    } catch (error) {
      console.error("Error al cargar votos existentes:", error);
    }
  };
  
  const handleRegistrarVotos = async (mesa: Mesa): Promise<void> => {
    setSelectedMesa(mesa);
    // Cargar votos existentes primero
    await fetchVotosExistentes(mesa.id);
    
    // Inicializar formulario de votos nuevos en 0
    const initialForm: VotoForm = {};
    proyectos.forEach((proyecto) => {
      initialForm[proyecto.id_proyecto] = 0;
    });
    initialForm["Blanco"] = 0;
    initialForm["Nulo"] = 0;
    setVotoForm(initialForm);
    setShowVotosModal(true);
    setActiveDropdown(null);
  };

  const handleRegistrarVotante = (mesa: Mesa): void => {
    setSelectedMesa(mesa);
    setVotanteForm({
      nombre: "",
      direccion: "",
      fecha_nacimiento: "",
      rut: "",
      extranjero: false,
    });
    setShowVotanteModal(true);
    setActiveDropdown(null);
  };

  // Guardar votante
  const handleSaveVotante = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/votantes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...votanteForm,
          id_mesa: selectedMesa?.id,
          periodo: parseInt(selectedYear),
        }),
      });

      if (response.ok) {
        toast.success("Votante registrado exitosamente");
        setShowVotanteModal(false);
      } else {
        const error = await response.json();
        toast.error(error.error || "Error al registrar votante");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al registrar votante");
    }
  };

  // Guardar votos
  const handleSaveVotos = async () => {
    try {
      const votos = [];

      // Procesar votos de proyectos
      proyectos.forEach((proyecto) => {
        const cantidad = votoForm[proyecto.id_proyecto] || 0;
        if (cantidad > 0) {
          votos.push({
            id_proyecto: proyecto.id_proyecto,
            tipo_voto: "Normal",
            cantidad,
          });
        }
      });

      // Procesar votos en blanco y nulos
      if (votoForm["Blanco"] > 0) {
        votos.push({
          tipo_voto: "Blanco",
          cantidad: votoForm["Blanco"],
        });
      }

      if (votoForm["Nulo"] > 0) {
        votos.push({
          tipo_voto: "Nulo",
          cantidad: votoForm["Nulo"],
        });
      }

      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/votos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          periodo: parseInt(selectedYear),
          id_mesa: selectedMesa?.id,
          votos,
        }),
      });

      if (response.ok) {
        toast.success("Votos registrados exitosamente");
        setShowVotosModal(false);
        fetchMesas(); // Recargar para actualizar conteo
      } else {
        const error = await response.json();
        toast.error(error.error || "Error al registrar votos");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al registrar votos");
    }
  };

  // Verificar permisos según rol
  const canChangeState =
    user?.rol === "Encargado de Local" || user?.rol === "Administrador";
  const canRegisterVotes = user?.rol !== "Ministro de Fe";
  const canRegisterVoters = user?.rol !== "Ministro de Fe";

  // Función para verificar si se pueden realizar acciones en una mesa específica
  const canPerformAction = (mesa: Mesa, action: "vote" | "voter") => {
    if (!mesa.estado_mesa) return false; // Mesa cerrada
    if (action === "vote") return canRegisterVotes;
    if (action === "voter") return canRegisterVoters;
    return false;
  };

  if (loading) {
    return (
      <div className="w-full bg-white rounded-lg shadow-md overflow-hidden p-8">
        <div className="text-center">Cargando mesas...</div>
      </div>
    );
  }

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
                <tr key={mesa.id}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {mesa.nombre}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                    {mesa.sede_nombre}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        mesa.estado_mesa
                          ? "bg-[#dcfce7] text-[#166534]"
                          : "bg-[#fee2e2] text-[#991b1b]"
                      }`}
                    >
                      {mesa.estado_mesa ? "Abierta" : "Cerrada"}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {mesa.votos_count}
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
                          {canRegisterVoters && (
                            <button
                              onClick={() => handleRegistrarVotante(mesa)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                            >
                              <IconUserPlus size={16} className="mr-2" />
                              Registrar Votante
                            </button>
                          )}
                          {canRegisterVotes && (
                            <button
                              onClick={() => handleRegistrarVotos(mesa)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                            >
                              <IconClipboardText size={16} className="mr-2" />
                              Registrar Votos
                            </button>
                          )}
                          {canChangeState && (
                            <button
                              onClick={() => handleCambiarEstado(mesa)}
                              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center ${
                                mesa.estado_mesa
                                  ? "text-red-600"
                                  : "text-green-600"
                              }`}
                            >
                              {mesa.estado_mesa ? (
                                <IconLock size={16} className="mr-2" />
                              ) : (
                                <IconLockOpen2 size={16} className="mr-2" />
                              )}
                              {mesa.estado_mesa ? "Cerrar Mesa" : "Abrir Mesa"}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </td>

                  {/* Acciones para tablet y desktop */}
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium hidden md:table-cell">
                    <div className="flex space-x-1">
                      {canPerformAction(mesa, "voter") && (
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
                      )}
                      {canPerformAction(mesa, "vote") && (
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
                      )}
                      {canChangeState && (
                        <button
                          onClick={() => handleCambiarEstado(mesa)}
                          className={`${
                            mesa.estado_mesa
                              ? "text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100"
                              : "text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100"
                          } p-2 rounded-md transition-colors flex items-center`}
                          title={
                            mesa.estado_mesa ? "Cerrar Mesa" : "Abrir Mesa"
                          }
                        >
                          {mesa.estado_mesa ? (
                            <IconLock size={18} />
                          ) : (
                            <IconLockOpen2 size={18} />
                          )}
                          <span className="ml-1 hidden lg:inline">
                            {mesa.estado_mesa ? "Cerrar Mesa" : "Abrir Mesa"}
                          </span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {mesas.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No hay mesas disponibles para este periodo
          </div>
        )}
      </div>

      {/* Modal de Votos */}
      {showVotosModal && (
        <Portal>
          <div className="fixed inset-0 bg-black/35 flex items-center justify-center z-[1000] p-4 overflow-y-auto">
            <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-slate-800">
                  Votos - Mesa {selectedMesa?.nombre}
                </h3>
                <button
                  onClick={() => setShowVotosModal(false)}
                  className="text-slate-500 hover:text-slate-700 h-8 w-8 rounded-full flex items-center justify-center hover:bg-slate-100"
                >
                  ×
                </button>
              </div>
              <p className="mb-4 text-sm text-slate-600">
                Ingrese la cantidad de votos para cada opción:
              </p>

              {/* Modal de Votos - Modificar la sección de proyectos */}
              <div className="space-y-3">
                {proyectos.map((proyecto) => (
                  <div key={proyecto.id_proyecto} className="flex flex-col">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {proyecto.nombre}
                      <span className="text-sm text-gray-500 ml-2">
                        (Actual: {votosExistentes[proyecto.id_proyecto] || 0})
                      </span>
                    </label>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 min-w-[60px]">
                        Total: {(votosExistentes[proyecto.id_proyecto] || 0) + (votoForm[proyecto.id_proyecto] || 0)}
                      </span>
                      <input
                        type="number"
                        min="0"
                        placeholder="Agregar votos"
                        value={votoForm[proyecto.id_proyecto] || 0}
                        onChange={(e) =>
                          setVotoForm((prev) => ({
                            ...prev,
                            [proyecto.id_proyecto]: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="border border-slate-300 rounded-md p-2 flex-1 focus:ring-slate-500 focus:border-slate-500"
                      />
                    </div>
                  </div>
                ))}
                
                {/* Votos en Blanco */}
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Votos en Blanco
                    <span className="text-sm text-gray-500 ml-2">
                      (Actual: {votosExistentes["Blanco"] || 0})
                    </span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 min-w-[60px]">
                      Total: {(votosExistentes["Blanco"] || 0) + (votoForm["Blanco"] || 0)}
                    </span>
                    <input
                      type="number"
                      min="0"
                      placeholder="Agregar votos"
                      value={votoForm["Blanco"] || 0}
                      onChange={(e) =>
                        setVotoForm((prev) => ({
                          ...prev,
                          Blanco: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="border border-slate-300 rounded-md p-2 flex-1 focus:ring-slate-500 focus:border-slate-500"
                    />
                  </div>
                </div>
                
                {/* Votos Nulos */}
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Votos Nulos
                    <span className="text-sm text-gray-500 ml-2">
                      (Actual: {votosExistentes["Nulo"] || 0})
                    </span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 min-w-[60px]">
                      Total: {(votosExistentes["Nulo"] || 0) + (votoForm["Nulo"] || 0)}
                    </span>
                    <input
                      type="number"
                      min="0"
                      placeholder="Agregar votos"
                      value={votoForm["Nulo"] || 0}
                      onChange={(e) =>
                        setVotoForm((prev) => ({
                          ...prev,
                          Nulo: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="border border-slate-300 rounded-md p-2 flex-1 focus:ring-slate-500 focus:border-slate-500"
                    />
                  </div>
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
                  onClick={handleSaveVotos}
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* Modal de Votante */}
      {showVotanteModal && (
        <Portal>
          <div className="fixed inset-0 bg-black/35 flex items-center justify-center z-[1000] p-4 overflow-y-auto">
            <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-slate-800">
                  Registrar Votante - Mesa {selectedMesa?.nombre}
                </h3>
                <button
                  onClick={() => setShowVotanteModal(false)}
                  className="text-slate-500 hover:text-slate-700 h-8 w-8 rounded-full flex items-center justify-center hover:bg-slate-100"
                >
                  ×
                </button>
              </div>
              <p className="mb-4 text-sm text-slate-600">
                Ingrese los datos del votante:
              </p>

              <div className="space-y-4">
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    RUT/Identificación
                  </label>
                  <input
                    type="text"
                    value={votanteForm.rut}
                    onChange={(e) =>
                      setVotanteForm((prev) => ({
                        ...prev,
                        rut: e.target.value,
                      }))
                    }
                    className="border border-slate-300 rounded-md p-2 focus:ring-slate-500 focus:border-slate-500"
                    placeholder="12345678-9"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    value={votanteForm.nombre}
                    onChange={(e) =>
                      setVotanteForm((prev) => ({
                        ...prev,
                        nombre: e.target.value,
                      }))
                    }
                    className="border border-slate-300 rounded-md p-2 focus:ring-slate-500 focus:border-slate-500"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={votanteForm.direccion}
                    onChange={(e) =>
                      setVotanteForm((prev) => ({
                        ...prev,
                        direccion: e.target.value,
                      }))
                    }
                    className="border border-slate-300 rounded-md p-2 focus:ring-slate-500 focus:border-slate-500"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Fecha de Nacimiento
                  </label>
                  <input
                    type="date"
                    value={votanteForm.fecha_nacimiento}
                    onChange={(e) =>
                      setVotanteForm((prev) => ({
                        ...prev,
                        fecha_nacimiento: e.target.value,
                      }))
                    }
                    className="border border-slate-300 rounded-md p-2 focus:ring-slate-500 focus:border-slate-500"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="extranjero"
                    checked={votanteForm.extranjero}
                    onChange={(e) =>
                      setVotanteForm((prev) => ({
                        ...prev,
                        extranjero: e.target.checked,
                      }))
                    }
                    className="mr-2"
                  />
                  <label
                    htmlFor="extranjero"
                    className="text-sm text-slate-700"
                  >
                    Es extranjero
                  </label>
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
                  onClick={handleSaveVotante}
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
