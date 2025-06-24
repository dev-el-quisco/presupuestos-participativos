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
  votantes_count: number;
}

interface Proyecto {
  id_proyecto: string;
  nombre: string;
  tipo_proyecto_nombre?: string;
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

// Función para validar si se puede cerrar la mesa
const canCloseMesa = (mesa: Mesa) => {
  return mesa.votos_count === mesa.votantes_count;
};

// Función para obtener colores por categoría
const getCategoryColors = (categoria: string) => {
  const colors = {
    Comunales: {
      bg: "bg-green-50",
      border: "border-green-200",
      icon: "bg-green-100 text-green-800",
      hover: "hover:bg-green-100",
    },
    Infantiles: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      icon: "bg-blue-100 text-blue-800",
      hover: "hover:bg-blue-100",
    },
    Deportivos: {
      bg: "bg-orange-50",
      border: "border-orange-200",
      icon: "bg-orange-100 text-orange-800",
      hover: "hover:bg-orange-100",
    },
    Culturales: {
      bg: "bg-red-50",
      border: "border-red-200",
      icon: "bg-red-100 text-red-800",
      hover: "hover:bg-red-100",
    },
  };

  return (
    colors[categoria as keyof typeof colors] || {
      bg: "bg-gray-50",
      border: "border-gray-200",
      icon: "bg-gray-100 text-gray-800",
      hover: "hover:bg-gray-100",
    }
  );
};

const Content = () => {
  const { user } = useAuth();
  const { selectedYear } = useYear();
  const [showVotosModal, setShowVotosModal] = useState<boolean>(false);
  const [showVotanteModal, setShowVotanteModal] = useState<boolean>(false);
  const [selectedMesa, setSelectedMesa] = useState<Mesa | null>(null);
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [rutError, setRutError] = useState<string>("");

  // Función para validar RUT chileno
  const validarRUT = (rut: string): boolean => {
    const rutLimpio = rut.replace(/[^0-9kK]/g, "").toUpperCase();

    if (rutLimpio.length < 2) return false;

    const cuerpo = rutLimpio.slice(0, -1);
    const dv = rutLimpio.slice(-1);

    let suma = 0;
    let multiplicador = 2;

    for (let i = cuerpo.length - 1; i >= 0; i--) {
      suma += parseInt(cuerpo[i]) * multiplicador;
      multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }

    const resto = suma % 11;
    const dvCalculado =
      resto === 0 ? "0" : resto === 1 ? "K" : (11 - resto).toString();

    return dv === dvCalculado;
  };

  // Función para formatear RUT
  const formatearRUT = (rut: string): string => {
    const rutLimpio = rut.replace(/[^0-9kK]/g, "").toUpperCase();
    if (rutLimpio.length <= 1) return rutLimpio;

    const cuerpo = rutLimpio.slice(0, -1);
    const dv = rutLimpio.slice(-1);

    const cuerpoFormateado = cuerpo.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");

    return `${cuerpoFormateado}-${dv}`;
  };

  // Manejar cambio en el campo RUT
  const handleRutChange = (value: string) => {
    if (votanteForm.extranjero) {
      // Para extranjeros, permitir cualquier carácter sin formateo
      setVotanteForm((prev) => ({
        ...prev,
        rut: value,
      }));
      setRutError("");
    } else {
      // Solo para chilenos: aplicar restricciones y formateo
      const valorLimpio = value.replace(/[^0-9kK.-]/g, '').toUpperCase();
      
      // Formatear automáticamente
      const rutFormateado = formatearRUT(valorLimpio);
      
      setVotanteForm((prev) => ({
        ...prev,
        rut: rutFormateado,
      }));

      // Validar solo si tiene contenido
      if (rutFormateado.length > 1) {
        if (validarRUT(rutFormateado)) {
          setRutError("");
        } else {
          setRutError("RUT inválido");
        }
      } else {
        setRutError("");
      }
    }
  };

  // Manejar cambio en checkbox extranjero
  const handleExtranjeroChange = (checked: boolean) => {
    setVotanteForm((prev) => ({
      ...prev,
      extranjero: checked,
    }));

    // Limpiar error de RUT si se marca como extranjero
    if (checked) {
      setRutError("");
    } else if (votanteForm.rut) {
      // Revalidar RUT si se desmarca extranjero
      if (validarRUT(votanteForm.rut)) {
        setRutError("");
      } else {
        setRutError("RUT inválido");
      }
    }
  };

  // Función para ordenar proyectos por categoría y nombre
  const getOrderedProjects = () => {
    return [...proyectos].sort((a, b) => {
      // Primero ordenar por categoría
      const categoriaA = a.tipo_proyecto_nombre || "";
      const categoriaB = b.tipo_proyecto_nombre || "";

      if (categoriaA !== categoriaB) {
        return categoriaA.localeCompare(categoriaB);
      }

      // Si la categoría es la misma, ordenar por nombre
      return a.nombre.localeCompare(b.nombre);
    });
  };

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
        // Ordenar mesas por sede y luego por nombre de mesa
        const mesasOrdenadas = data.data.sort((a: Mesa, b: Mesa) => {
          // Primero ordenar por sede
          const sedeComparison = a.sede_nombre.localeCompare(b.sede_nombre);
          if (sedeComparison !== 0) {
            return sedeComparison;
          }
          // Si la sede es la misma, ordenar por nombre de mesa
          return a.nombre.localeCompare(b.nombre);
        });
        setMesas(mesasOrdenadas);
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

  // Cambiar estado de mesa (solo Encargado de Local y Administrador)
  const handleCambiarEstado = async (mesa: Mesa): Promise<void> => {
    // Si se intenta cerrar la mesa, validar que votos coincidan con votantes
    if (!mesa.estado_mesa && !canCloseMesa(mesa)) {
      toast.error(
        `No se puede cerrar la mesa. Votos registrados: ${mesa.votos_count}, Votantes registrados: ${mesa.votantes_count}`
      );
      return;
    }

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
          sede_id: mesa.sede_id,
          periodo: mesa.periodo,
        }),
      });

      if (response.ok) {
        setMesas((prevMesas) =>
          prevMesas.map((m) =>
            m.id === mesa.id ? { ...m, estado_mesa: !m.estado_mesa } : m
          )
        );
        toast.success(
          `Mesa ${!mesa.estado_mesa ? "cerrada" : "abierta"} exitosamente`
        );
      } else {
        toast.error("Error al cambiar el estado de la mesa");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cambiar el estado de la mesa");
    }
  };

  // Agregar estado para votos existentes
  const [votosExistentes, setVotosExistentes] = useState<VotoForm>({});

  // Función para cargar votos existentes de una mesa
  const fetchVotosExistentes = async (mesaId: string) => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `/api/votos?mesa_id=${mesaId}&periodo=${selectedYear}`,
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
        result.data.forEach((voto: any) => {
          if (voto.tipo_voto === "Normal" && voto.proyecto_nombre) {
            // Buscar el proyecto por nombre para obtener su id_proyecto
            const proyecto = proyectos.find(
              (p) => p.nombre === voto.proyecto_nombre
            );
            if (proyecto) {
              votosCount[proyecto.id_proyecto] = voto.cantidad;
            }
          } else if (voto.tipo_voto === "Blanco") {
            votosCount["Blanco"] = voto.cantidad;
          } else if (voto.tipo_voto === "Nulo") {
            votosCount["Nulo"] = voto.cantidad;
          }
        });

        setVotosExistentes(votosCount);
        console.log("Votos existentes cargados:", votosCount); // Para debug
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
    setRutError("");
    setShowVotanteModal(true);
  };

  // Función para actualizar solo el conteo de votantes de una mesa específica
  const updateMesaVotantesCount = async (mesaId: string) => {
    try {
      const token = localStorage.getItem("auth_token");
      const response = await fetch(`/api/mesas/${mesaId}/votantes-count`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setMesas(prevMesas => 
          prevMesas.map(mesa => 
            mesa.id === mesaId 
              ? { ...mesa, votantes_count: data.count }
              : mesa
          )
        );
      }
    } catch (error) {
      console.error("Error al actualizar conteo:", error);
    }
  };

  // Guardar votante
  const handleSaveVotante = async () => {
    // Validar RUT antes de enviar si no es extranjero
    if (!votanteForm.extranjero && !validarRUT(votanteForm.rut)) {
      setRutError("RUT inválido");
      return;
    }

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
        // Reiniciar los campos del formulario
        setVotanteForm({
          nombre: "",
          direccion: "",
          fecha_nacimiento: "",
          rut: "",
          extranjero: false,
        });
        setRutError("");
        // Incrementar el contador localmente sin recargar
        setMesas(prevMesas => 
          prevMesas.map(mesa => 
            mesa.id === selectedMesa?.id 
              ? { ...mesa, votantes_count: (mesa.votantes_count || 0) + 1 }
              : mesa
          )
        );
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
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Mesa
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Sede
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Votos
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Votantes
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {mesas.map((mesa, index) => (
                <tr key={mesa.id} className="hover:bg-slate-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    {mesa.nombre}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600">
                    {mesa.sede_nombre}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        mesa.estado_mesa
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {mesa.estado_mesa ? "Abierta" : "Cerrada"}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-slate-600">
                    {mesa.votos_count}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-slate-600">
                    {mesa.votantes_count}
                  </td>
                  <td className="px-2 py-4 whitespace-nowrap text-center">
                    {/* Botones para desktop */}
                    <div className="hidden lg:flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleRegistrarVotante(mesa)}
                        disabled={!canPerformAction(mesa, "voter")}
                        className="flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                        title="Registrar Votante"
                      >
                        <IconUserPlus size={14} className="mr-1" />
                        Votante
                      </button>
                      <button
                        onClick={() => handleRegistrarVotos(mesa)}
                        disabled={!canPerformAction(mesa, "vote")}
                        className="flex items-center px-2 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                        title="Registrar Votos"
                      >
                        <IconClipboardText size={14} className="mr-1" />
                        Votos
                      </button>
                      {(user?.rol === "Encargado de Local" ||
                        user?.rol === "Administrador") && (
                        <button
                          onClick={() => handleCambiarEstado(mesa)}
                          disabled={mesa.estado_mesa && !canCloseMesa(mesa)}
                          className={`flex items-center px-2 py-1 text-xs rounded-md transition-colors ${
                            mesa.estado_mesa && !canCloseMesa(mesa)
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : mesa.estado_mesa
                              ? "bg-red-100 text-red-700 hover:bg-red-200"
                              : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                          }`}
                          title={
                            mesa.estado_mesa && !canCloseMesa(mesa)
                              ? `No se puede cerrar: ${mesa.votos_count} votos ≠ ${mesa.votantes_count} votantes`
                              : mesa.estado_mesa
                              ? "Cerrar Mesa"
                              : "Abrir Mesa"
                          }
                        >
                          {mesa.estado_mesa ? (
                            <IconLock size={14} className="mr-1" />
                          ) : (
                            <IconLockOpen2 size={14} className="mr-1" />
                          )}
                          {mesa.estado_mesa ? "Cerrar" : "Abrir"}
                        </button>
                      )}
                    </div>

                    {/* Botones para tablet */}
                    <div className="hidden md:flex lg:hidden items-center justify-center space-x-1">
                      <button
                        onClick={() => handleRegistrarVotante(mesa)}
                        disabled={!canPerformAction(mesa, "voter")}
                        className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                        title="Registrar Votante"
                      >
                        <IconUserPlus size={16} />
                      </button>
                      <button
                        onClick={() => handleRegistrarVotos(mesa)}
                        disabled={!canPerformAction(mesa, "vote")}
                        className="flex items-center justify-center w-8 h-8 bg-green-100 text-green-700 rounded-md hover:bg-green-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                        title="Registrar Votos"
                      >
                        <IconClipboardText size={16} />
                      </button>
                      {(user?.rol === "Encargado de Local" ||
                        user?.rol === "Administrador") && (
                        <button
                          onClick={() => handleCambiarEstado(mesa)}
                          disabled={mesa.estado_mesa && !canCloseMesa(mesa)}
                          className={`flex items-center justify-center w-8 h-8 rounded-md transition-colors ${
                            mesa.estado_mesa && !canCloseMesa(mesa)
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : mesa.estado_mesa
                              ? "bg-red-100 text-red-700 hover:bg-red-200"
                              : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                          }`}
                          title={
                            mesa.estado_mesa && !canCloseMesa(mesa)
                              ? `No se puede cerrar: ${mesa.votos_count} votos ≠ ${mesa.votantes_count} votantes`
                              : mesa.estado_mesa
                              ? "Cerrar Mesa"
                              : "Abrir Mesa"
                          }
                        >
                          {mesa.estado_mesa ? (
                            <IconLock size={16} />
                          ) : (
                            <IconLockOpen2 size={16} />
                          )}
                        </button>
                      )}
                    </div>

                    {/* Botones para móvil - layout horizontal */}
                    <div className="flex md:hidden items-center justify-center space-x-1">
                      <button
                        onClick={() => handleRegistrarVotante(mesa)}
                        disabled={!canPerformAction(mesa, "voter")}
                        className="flex items-center justify-center w-7 h-7 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                        title="Registrar Votante"
                      >
                        <IconUserPlus size={14} />
                      </button>
                      <button
                        onClick={() => handleRegistrarVotos(mesa)}
                        disabled={!canPerformAction(mesa, "vote")}
                        className="flex items-center justify-center w-7 h-7 bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                        title="Registrar Votos"
                      >
                        <IconClipboardText size={14} />
                      </button>
                      {(user?.rol === "Encargado de Local" ||
                        user?.rol === "Administrador") && (
                        <button
                          onClick={() => handleCambiarEstado(mesa)}
                          disabled={mesa.estado_mesa && !canCloseMesa(mesa)}
                          className={`flex items-center justify-center w-7 h-7 rounded transition-colors ${
                            mesa.estado_mesa && !canCloseMesa(mesa)
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : mesa.estado_mesa
                              ? "bg-red-100 text-red-700 hover:bg-red-200"
                              : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                          }`}
                          title={
                            mesa.estado_mesa && !canCloseMesa(mesa)
                              ? `No se puede cerrar: ${mesa.votos_count} votos ≠ ${mesa.votantes_count} votantes`
                              : mesa.estado_mesa
                              ? "Cerrar Mesa"
                              : "Abrir Mesa"
                          }
                        >
                          {mesa.estado_mesa ? (
                            <IconLock size={14} />
                          ) : (
                            <IconLockOpen2 size={14} />
                          )}
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
          <div className="fixed inset-0 bg-black/35 flex items-center justify-center z-[1000] p-2 sm:p-4 overflow-y-auto">
            <div className="bg-white rounded-xl p-3 sm:p-6 w-full max-w-[95vw] sm:max-w-7xl max-h-[95vh] overflow-y-auto shadow-xl border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base sm:text-lg font-medium text-slate-800">
                  Votos - Mesa {selectedMesa?.nombre}
                </h3>
                <button
                  onClick={() => setShowVotosModal(false)}
                  className="text-slate-500 hover:text-slate-700 h-8 w-8 rounded-full flex items-center justify-center hover:bg-slate-100"
                >
                  ×
                </button>
              </div>

              {/* Header de la tabla - Responsive */}
              <div className="bg-slate-100 rounded-lg p-2 sm:p-3 mb-2">
                <div className="hidden sm:grid sm:grid-cols-12 gap-2 items-center text-xs font-medium text-slate-600 uppercase">
                  <div className="col-span-1">ID</div>
                  <div className="col-span-4">Proyecto</div>
                  <div className="col-span-1 text-center">Actual</div>
                  <div className="col-span-1 text-center">Total</div>
                  <div className="col-span-3 text-center">Acciones</div>
                  <div className="col-span-2 text-center">Total Manual</div>
                </div>
                <div className="sm:hidden text-xs font-medium text-slate-600 uppercase text-center">
                  Proyectos por Categoría
                </div>
              </div>

              {/* Lista de proyectos - Responsive */}
              <div className="space-y-1 max-h-[50vh] sm:max-h-96 overflow-y-auto">
                {getOrderedProjects().map((proyecto, index) => {
                  const votosActuales =
                    votosExistentes[proyecto.id_proyecto] || 0;
                  const votosNuevos = votoForm[proyecto.id_proyecto] || 0;
                  const totalVotos = votosActuales + votosNuevos;
                  const categoryColors = getCategoryColors(
                    proyecto.tipo_proyecto_nombre || ""
                  );

                  return (
                    <div
                      key={proyecto.id_proyecto}
                      className={`border ${categoryColors.border} rounded-lg p-2 sm:p-3 ${categoryColors.bg} ${categoryColors.hover} transition-colors`}
                    >
                      {/* Layout Desktop */}
                      <div className="hidden sm:grid sm:grid-cols-12 gap-2 items-center">
                        {/* ID Visual */}
                        <div className="col-span-1">
                          <span
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${categoryColors.icon} text-xs font-bold`}
                          >
                            {proyecto.id_proyecto}
                          </span>
                        </div>

                        {/* Nombre del proyecto */}
                        <div className="col-span-4">
                          <div>
                            <span
                              className="text-sm font-medium text-slate-800 block"
                              title={proyecto.nombre}
                            >
                              {proyecto.nombre.length > 40
                                ? `${proyecto.nombre.substring(0, 40)}...`
                                : proyecto.nombre}
                            </span>
                            <span className="text-xs text-slate-500">
                              {proyecto.tipo_proyecto_nombre}
                            </span>
                          </div>
                        </div>

                        {/* Votos actuales */}
                        <div className="col-span-1 text-center">
                          <span className="text-sm text-slate-600">
                            {votosActuales}
                          </span>
                        </div>

                        {/* Total calculado */}
                        <div className="col-span-1 text-center">
                          <span className="text-sm font-medium text-slate-800">
                            {totalVotos}
                          </span>
                        </div>

                        {/* Botones +/- */}
                        <div className="col-span-3">
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              onClick={() => {
                                if (votosNuevos > 0) {
                                  setVotoForm((prev) => ({
                                    ...prev,
                                    [proyecto.id_proyecto]: votosNuevos - 1,
                                  }));
                                }
                              }}
                              disabled={votosNuevos <= 0}
                              className="w-7 h-7 rounded-full bg-red-100 text-red-600 hover:bg-red-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center text-sm font-bold transition-colors"
                            >
                              −
                            </button>
                            <span className="w-8 text-center text-sm font-medium text-slate-700">
                              {votosNuevos}
                            </span>
                            <button
                              onClick={() => {
                                setVotoForm((prev) => ({
                                  ...prev,
                                  [proyecto.id_proyecto]: votosNuevos + 1,
                                }));
                              }}
                              className="w-7 h-7 rounded-full bg-green-100 text-green-600 hover:bg-green-200 flex items-center justify-center text-sm font-bold transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Input manual para total */}
                        <div className="col-span-2">
                          <input
                            type="number"
                            min="0"
                            value={totalVotos}
                            onChange={(e) => {
                              const nuevoTotal = parseInt(e.target.value) || 0;
                              const nuevosVotosCalculados = Math.max(
                                0,
                                nuevoTotal - votosActuales
                              );
                              setVotoForm((prev) => ({
                                ...prev,
                                [proyecto.id_proyecto]: nuevosVotosCalculados,
                              }));
                            }}
                            className="w-full border border-slate-300 rounded px-2 py-1 text-sm text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Total"
                          />
                        </div>
                      </div>

                      {/* Layout Mobile */}
                      <div className="sm:hidden space-y-2">
                        {/* Header móvil */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${categoryColors.icon} text-xs font-bold`}
                            >
                              {proyecto.id_proyecto}
                            </span>
                            <div className="flex-1 min-w-0">
                              <span
                                className="text-sm font-medium text-slate-800 block truncate"
                                title={proyecto.nombre}
                              >
                                {proyecto.nombre.length > 25
                                  ? `${proyecto.nombre.substring(0, 25)}...`
                                  : proyecto.nombre}
                              </span>
                              <span className="text-xs text-slate-500">
                                {proyecto.tipo_proyecto_nombre}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Controles móvil */}
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-slate-600">
                            Actual:{" "}
                            <span className="font-medium">{votosActuales}</span>{" "}
                            | Total:{" "}
                            <span className="font-medium">{totalVotos}</span>
                          </div>

                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => {
                                if (votosNuevos > 0) {
                                  setVotoForm((prev) => ({
                                    ...prev,
                                    [proyecto.id_proyecto]: votosNuevos - 1,
                                  }));
                                }
                              }}
                              disabled={votosNuevos <= 0}
                              className="w-6 h-6 rounded-full bg-red-100 text-red-600 hover:bg-red-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center text-xs font-bold transition-colors"
                            >
                              −
                            </button>
                            <span className="w-6 text-center text-xs font-medium text-slate-700">
                              {votosNuevos}
                            </span>
                            <button
                              onClick={() => {
                                setVotoForm((prev) => ({
                                  ...prev,
                                  [proyecto.id_proyecto]: votosNuevos + 1,
                                }));
                              }}
                              className="w-6 h-6 rounded-full bg-green-100 text-green-600 hover:bg-green-200 flex items-center justify-center text-xs font-bold transition-colors"
                            >
                              +
                            </button>
                            <input
                              type="number"
                              min="0"
                              value={totalVotos}
                              onChange={(e) => {
                                const nuevoTotal =
                                  parseInt(e.target.value) || 0;
                                const nuevosVotosCalculados = Math.max(
                                  0,
                                  nuevoTotal - votosActuales
                                );
                                setVotoForm((prev) => ({
                                  ...prev,
                                  [proyecto.id_proyecto]: nuevosVotosCalculados,
                                }));
                              }}
                              className="w-12 border border-slate-300 rounded px-1 py-1 text-xs text-center focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Votos especiales (Blanco y Nulo) - Responsive */}
              <div className="border-t border-slate-200 pt-4 mt-4">
                <h4 className="text-sm font-medium text-slate-700 mb-3">
                  Votos Especiales
                </h4>
                <div className="space-y-2">
                  {/* Votos en Blanco */}
                  <div className="border border-slate-200 rounded-lg p-2 sm:p-3 bg-blue-50">
                    <div className="hidden sm:grid sm:grid-cols-12 gap-2 items-center">
                      <div className="col-span-1">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-200 text-blue-800 text-xs font-bold">
                          B
                        </span>
                      </div>
                      <div className="col-span-4">
                        <span className="text-sm font-medium text-slate-800">
                          Votos en Blanco
                        </span>
                      </div>
                      <div className="col-span-1 text-center">
                        <span className="text-sm text-slate-600">
                          {votosExistentes["Blanco"] || 0}
                        </span>
                      </div>
                      <div className="col-span-1 text-center">
                        <span className="text-sm font-medium text-slate-800">
                          {(votosExistentes["Blanco"] || 0) +
                            (votoForm["Blanco"] || 0)}
                        </span>
                      </div>
                      <div className="col-span-3">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => {
                              const currentValue = votoForm["Blanco"] || 0;
                              if (currentValue > 0) {
                                setVotoForm((prev) => ({
                                  ...prev,
                                  Blanco: currentValue - 1,
                                }));
                              }
                            }}
                            disabled={(votoForm["Blanco"] || 0) <= 0}
                            className="w-7 h-7 rounded-full bg-red-100 text-red-600 hover:bg-red-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center text-sm font-bold transition-colors"
                          >
                            −
                          </button>
                          <span className="w-8 text-center text-sm font-medium text-slate-700">
                            {votoForm["Blanco"] || 0}
                          </span>
                          <button
                            onClick={() => {
                              const currentValue = votoForm["Blanco"] || 0;
                              setVotoForm((prev) => ({
                                ...prev,
                                Blanco: currentValue + 1,
                              }));
                            }}
                            className="w-7 h-7 rounded-full bg-green-100 text-green-600 hover:bg-green-200 flex items-center justify-center text-sm font-bold transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min="0"
                          value={
                            (votosExistentes["Blanco"] || 0) +
                            (votoForm["Blanco"] || 0)
                          }
                          onChange={(e) => {
                            const nuevoTotal = parseInt(e.target.value) || 0;
                            const nuevosVotosCalculados = Math.max(
                              0,
                              nuevoTotal - (votosExistentes["Blanco"] || 0)
                            );
                            setVotoForm((prev) => ({
                              ...prev,
                              Blanco: nuevosVotosCalculados,
                            }));
                          }}
                          className="w-full border border-slate-300 rounded px-2 py-1 text-sm text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Total"
                        />
                      </div>
                    </div>

                    {/* Layout móvil para votos en blanco */}
                    <div className="sm:hidden">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-200 text-blue-800 text-xs font-bold">
                            B
                          </span>
                          <span className="text-sm font-medium text-slate-800">
                            Votos en Blanco
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-slate-600">
                          Actual:{" "}
                          <span className="font-medium">
                            {votosExistentes["Blanco"] || 0}
                          </span>{" "}
                          | Total:{" "}
                          <span className="font-medium">
                            {(votosExistentes["Blanco"] || 0) +
                              (votoForm["Blanco"] || 0)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => {
                              const currentValue = votoForm["Blanco"] || 0;
                              if (currentValue > 0) {
                                setVotoForm((prev) => ({
                                  ...prev,
                                  Blanco: currentValue - 1,
                                }));
                              }
                            }}
                            disabled={(votoForm["Blanco"] || 0) <= 0}
                            className="w-6 h-6 rounded-full bg-red-100 text-red-600 hover:bg-red-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center text-xs font-bold transition-colors"
                          >
                            −
                          </button>
                          <span className="w-6 text-center text-xs font-medium text-slate-700">
                            {votoForm["Blanco"] || 0}
                          </span>
                          <button
                            onClick={() => {
                              const currentValue = votoForm["Blanco"] || 0;
                              setVotoForm((prev) => ({
                                ...prev,
                                Blanco: currentValue + 1,
                              }));
                            }}
                            className="w-6 h-6 rounded-full bg-green-100 text-green-600 hover:bg-green-200 flex items-center justify-center text-xs font-bold transition-colors"
                          >
                            +
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={
                              (votosExistentes["Blanco"] || 0) +
                              (votoForm["Blanco"] || 0)
                            }
                            onChange={(e) => {
                              const nuevoTotal = parseInt(e.target.value) || 0;
                              const nuevosVotosCalculados = Math.max(
                                0,
                                nuevoTotal - (votosExistentes["Blanco"] || 0)
                              );
                              setVotoForm((prev) => ({
                                ...prev,
                                Blanco: nuevosVotosCalculados,
                              }));
                            }}
                            className="w-12 border border-slate-300 rounded px-1 py-1 text-xs text-center focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Votos Nulos */}
                  <div className="border border-slate-200 rounded-lg p-2 sm:p-3 bg-yellow-50">
                    <div className="hidden sm:grid sm:grid-cols-12 gap-2 items-center">
                      <div className="col-span-1">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-yellow-200 text-yellow-800 text-xs font-bold">
                          N
                        </span>
                      </div>
                      <div className="col-span-4">
                        <span className="text-sm font-medium text-slate-800">
                          Votos Nulos
                        </span>
                      </div>
                      <div className="col-span-1 text-center">
                        <span className="text-sm text-slate-600">
                          {votosExistentes["Nulo"] || 0}
                        </span>
                      </div>
                      <div className="col-span-1 text-center">
                        <span className="text-sm font-medium text-slate-800">
                          {(votosExistentes["Nulo"] || 0) +
                            (votoForm["Nulo"] || 0)}
                        </span>
                      </div>
                      <div className="col-span-3">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => {
                              const currentValue = votoForm["Nulo"] || 0;
                              if (currentValue > 0) {
                                setVotoForm((prev) => ({
                                  ...prev,
                                  Nulo: currentValue - 1,
                                }));
                              }
                            }}
                            disabled={(votoForm["Nulo"] || 0) <= 0}
                            className="w-7 h-7 rounded-full bg-red-100 text-red-600 hover:bg-red-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center text-sm font-bold transition-colors"
                          >
                            −
                          </button>
                          <span className="w-8 text-center text-sm font-medium text-slate-700">
                            {votoForm["Nulo"] || 0}
                          </span>
                          <button
                            onClick={() => {
                              const currentValue = votoForm["Nulo"] || 0;
                              setVotoForm((prev) => ({
                                ...prev,
                                Nulo: currentValue + 1,
                              }));
                            }}
                            className="w-7 h-7 rounded-full bg-green-100 text-green-600 hover:bg-green-200 flex items-center justify-center text-sm font-bold transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min="0"
                          value={
                            (votosExistentes["Nulo"] || 0) +
                            (votoForm["Nulo"] || 0)
                          }
                          onChange={(e) => {
                            const nuevoTotal = parseInt(e.target.value) || 0;
                            const nuevosVotosCalculados = Math.max(
                              0,
                              nuevoTotal - (votosExistentes["Nulo"] || 0)
                            );
                            setVotoForm((prev) => ({
                              ...prev,
                              Nulo: nuevosVotosCalculados,
                            }));
                          }}
                          className="w-full border border-slate-300 rounded px-2 py-1 text-sm text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Total"
                        />
                      </div>
                    </div>

                    {/* Layout móvil para votos nulos */}
                    <div className="sm:hidden">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-200 text-yellow-800 text-xs font-bold">
                            N
                          </span>
                          <span className="text-sm font-medium text-slate-800">
                            Votos Nulos
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-slate-600">
                          Actual:{" "}
                          <span className="font-medium">
                            {votosExistentes["Nulo"] || 0}
                          </span>{" "}
                          | Total:{" "}
                          <span className="font-medium">
                            {(votosExistentes["Nulo"] || 0) +
                              (votoForm["Nulo"] || 0)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => {
                              const currentValue = votoForm["Nulo"] || 0;
                              if (currentValue > 0) {
                                setVotoForm((prev) => ({
                                  ...prev,
                                  Nulo: currentValue - 1,
                                }));
                              }
                            }}
                            disabled={(votoForm["Nulo"] || 0) <= 0}
                            className="w-6 h-6 rounded-full bg-red-100 text-red-600 hover:bg-red-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center text-xs font-bold transition-colors"
                          >
                            −
                          </button>
                          <span className="w-6 text-center text-xs font-medium text-slate-700">
                            {votoForm["Nulo"] || 0}
                          </span>
                          <button
                            onClick={() => {
                              const currentValue = votoForm["Nulo"] || 0;
                              setVotoForm((prev) => ({
                                ...prev,
                                Nulo: currentValue + 1,
                              }));
                            }}
                            className="w-6 h-6 rounded-full bg-green-100 text-green-600 hover:bg-green-200 flex items-center justify-center text-xs font-bold transition-colors"
                          >
                            +
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={
                              (votosExistentes["Nulo"] || 0) +
                              (votoForm["Nulo"] || 0)
                            }
                            onChange={(e) => {
                              const nuevoTotal = parseInt(e.target.value) || 0;
                              const nuevosVotosCalculados = Math.max(
                                0,
                                nuevoTotal - (votosExistentes["Nulo"] || 0)
                              );
                              setVotoForm((prev) => ({
                                ...prev,
                                Nulo: nuevosVotosCalculados,
                              }));
                            }}
                            className="w-12 border border-slate-300 rounded px-1 py-1 text-xs text-center focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
                <button
                  className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors order-2 sm:order-1"
                  onClick={() => setShowVotosModal(false)}
                >
                  Cancelar
                </button>
                <button
                  className="bg-slate-800 text-white py-2 px-4 rounded-md hover:bg-[#30c56c] hover:text-[#e3ecea] transition-colors order-1 sm:order-2"
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
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="extranjero"
                    checked={votanteForm.extranjero}
                    onChange={(e) => handleExtranjeroChange(e.target.checked)}
                    className="mr-2"
                  />
                  <label
                    htmlFor="extranjero"
                    className="text-sm text-slate-700"
                  >
                    Es extranjero
                  </label>
                </div>

                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    RUT/Identificación
                  </label>
                  <input
                    type="text"
                    value={votanteForm.rut}
                    onChange={(e) => handleRutChange(e.target.value)}
                    className={`border rounded-md p-2 focus:ring-slate-500 focus:border-slate-500 ${
                      rutError ? "border-red-500" : "border-slate-300"
                    }`}
                    placeholder={
                      votanteForm.extranjero
                        ? "Identificación"
                        : "12.345.678-9 o identificador"
                    }
                    disabled={false}
                  />
                  {rutError && (
                    <span className="text-red-500 text-xs mt-1">
                      {rutError}
                    </span>
                  )}
                  {!votanteForm.extranjero && (
                    <span className="text-gray-500 text-xs mt-1">
                      Solo números y letra K para rut chileno
                    </span>
                  )}
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
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                  onClick={() => setShowVotanteModal(false)}
                >
                  Cancelar
                </button>
                <button
                  className={`py-2 px-4 rounded-md transition-colors ${
                    rutError && !votanteForm.extranjero
                      ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                      : "bg-slate-800 text-white hover:bg-[#30c56c] hover:text-[#e3ecea]"
                  }`}
                  onClick={handleSaveVotante}
                  disabled={!!(rutError && !votanteForm.extranjero)}
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
