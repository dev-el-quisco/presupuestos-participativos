"use client";

import { useState, useEffect, useRef } from "react";
import {
  IconUserPlus,
  IconClipboardText,
  IconLock,
  IconLockOpen2,
} from "@tabler/icons-react";
import Portal from "@/app/components/ui/Portal";
import { useAuth } from "@/app/hooks/useAuth";
import { useYear } from "@/app/context/YearContext";
import { useVotacionesData } from "@/app/hooks/useVotacionesData";
import toast from "react-hot-toast";

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
const canCloseMesa = (mesa: any) => {
  return true; // Siempre permitir cerrar la mesa
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
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      icon: "bg-yellow-100 text-yellow-800",
      hover: "hover:bg-yellow-100",
    },
    Juveniles: {
      bg: "bg-sky-50",
      border: "border-sky-200",
      icon: "bg-sky-100 text-sky-800",
      hover: "hover:bg-sky-100",
    },
    Sectoriales: {
      bg: "bg-orange-50",
      border: "border-orange-200",
      icon: "bg-orange-100 text-orange-800",
      hover: "hover:bg-orange-100",
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
  const { selectedYear, isYearReady } = useYear();
  const { mesas, proyectos, loading, setMesas, refetchMesas } =
    useVotacionesData();
  const [showVotosModal, setShowVotosModal] = useState<boolean>(false);
  const [showVotanteModal, setShowVotanteModal] = useState<boolean>(false);
  const [selectedMesa, setSelectedMesa] = useState<any>(null);
  const [rutError, setRutError] = useState<string>("");
  
  // Agregar estado para prevenir duplicados
  const [isSavingVotante, setIsSavingVotante] = useState<boolean>(false);
  const [isSavingVotos, setIsSavingVotos] = useState<boolean>(false);
  const saveVotanteTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const saveVotosTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Función para cerrar mesa
  const cerrarMesa = async (mesa: any) => {
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
          estado_mesa: false, // Cerramos la mesa
          sede_id: mesa.sede_id,
          periodo: mesa.periodo,
        }),
      });

      if (response.ok) {
        setMesas((prevMesas) =>
          prevMesas.map((m) =>
            m.id === mesa.id ? { ...m, estado_mesa: false } : m
          )
        );
        return true;
      } else {
        toast.error("Error al cerrar la mesa");
        return false;
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cerrar la mesa");
      return false;
    }
  };

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
      const valorLimpio = value.replace(/[^0-9kK.-]/g, "").toUpperCase();

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

  // Función para agrupar proyectos por categoría
  const getProjectsByCategory = () => {
    const proyectosPorCategoria: { [key: string]: any[] } = {};

    proyectos.forEach((proyecto) => {
      const categoria = proyecto.tipo_proyecto_nombre || "Sin Categoría";
      if (!proyectosPorCategoria[categoria]) {
        proyectosPorCategoria[categoria] = [];
      }
      proyectosPorCategoria[categoria].push(proyecto);
    });

    // Ordenar categorías alfabéticamente
    const categoriasOrdenadas = Object.keys(proyectosPorCategoria).sort();

    // Ordenar proyectos dentro de cada categoría por ID
    categoriasOrdenadas.forEach((categoria) => {
      proyectosPorCategoria[categoria].sort((a, b) =>
        a.id_proyecto.localeCompare(b.id_proyecto)
      );
    });

    return { proyectosPorCategoria, categoriasOrdenadas };
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

  // Limpiar timeouts al desmontar el componente
  useEffect(() => {
    return () => {
      if (saveVotanteTimeoutRef.current) {
        clearTimeout(saveVotanteTimeoutRef.current);
      }
      if (saveVotosTimeoutRef.current) {
        clearTimeout(saveVotosTimeoutRef.current);
      }
    };
  }, []);

  // Manejar tecla Enter en el modal de votante
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSavingVotante) {
      e.preventDefault();
      handleSaveVotante();
    }
  };

  // Cambiar estado de mesa (solo Encargado de Local y Administrador)
  const handleCambiarEstado = async (mesa: any): Promise<void> => {
    // Remover la validación de votos vs votantes
    // if (!mesa.estado_mesa && !canCloseMesa(mesa)) {
    //   toast.error(
    //     `No se puede cerrar la mesa. Votos registrados: ${mesa.votos_count}, Votantes registrados: ${mesa.votantes_count}`
    //   );
    //   return;
    // }

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
          `Mesa ${mesa.estado_mesa ? "cerrada" : "abierta"} exitosamente`
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
      } else {
        console.error("Error al cargar votos:", response.status);
      }
    } catch (error) {
      console.error("Error al cargar votos existentes:", error);
    }
  };

  const handleRegistrarVotos = async (mesa: any): Promise<void> => {
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

  const handleRegistrarVotante = (mesa: any): void => {
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
        setMesas((prevMesas) =>
          prevMesas.map((mesa) =>
            mesa.id === mesaId ? { ...mesa, votantes_count: data.count } : mesa
          )
        );
      }
    } catch (error) {
      console.error("Error al actualizar conteo:", error);
    }
  };

  // Guardar votante con debounce
  const handleSaveVotante = async () => {
    // Prevenir múltiples envíos
    if (isSavingVotante) {
      return;
    }

    // Validar RUT antes de enviar si no es extranjero
    if (!votanteForm.extranjero && !validarRUT(votanteForm.rut)) {
      setRutError("RUT inválido");
      return;
    }

    // Limpiar timeout anterior si existe
    if (saveVotanteTimeoutRef.current) {
      clearTimeout(saveVotanteTimeoutRef.current);
    }

    setIsSavingVotante(true);

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
        setMesas((prevMesas) =>
          prevMesas.map((mesa) =>
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
    } finally {
      // Usar timeout para prevenir clics muy rápidos
      saveVotanteTimeoutRef.current = setTimeout(() => {
        setIsSavingVotante(false);
      }, 1000); // 1 segundo de debounce
    }
  };

  // Guardar votos con debounce (con cierre automático de mesa)
  const handleSaveVotos = async () => {
    // Prevenir múltiples envíos
    if (isSavingVotos) {
      return;
    }

    // Limpiar timeout anterior si existe
    if (saveVotosTimeoutRef.current) {
      clearTimeout(saveVotosTimeoutRef.current);
    }

    setIsSavingVotos(true);

    try {
      const votos = [];
      const totalNuevosVotos = Object.values(votoForm).reduce(
        (sum, val) => sum + (val || 0),
        0
      );

      // Procesar votos de proyectos - INCLUIR TAMBIÉN CANTIDAD 0 Y NEGATIVA
      proyectos.forEach((proyecto) => {
        const cantidad = votoForm[proyecto.id_proyecto] || 0;
        // Cambiar esta condición para incluir también cantidad 0 y negativa
        if (cantidad !== 0) {
          votos.push({
            id_proyecto: proyecto.id_proyecto,
            tipo_voto: "Normal",
            cantidad,
          });
        }
      });

      // Procesar votos en blanco y nulos - INCLUIR TAMBIÉN CANTIDAD 0 Y NEGATIVA
      const cantidadBlanco = votoForm["Blanco"] || 0;
      if (cantidadBlanco !== 0) {
        votos.push({
          tipo_voto: "Blanco",
          cantidad: cantidadBlanco,
        });
      }

      const cantidadNulo = votoForm["Nulo"] || 0;
      if (cantidadNulo !== 0) {
        votos.push({
          tipo_voto: "Nulo",
          cantidad: cantidadNulo,
        });
      }

      // Si no hay cambios reales, mostrar mensaje apropiado
      if (votos.length === 0) {
        toast.error("No hay cambios que guardar");
        setIsSavingVotos(false);
        return;
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
        refetchMesas(); // Recargar para actualizar conteo

        // Cerrar automáticamente la mesa después de guardar los votos
        if (selectedMesa) {
          await cerrarMesa(selectedMesa);
        }
      } else {
        const error = await response.json();
        toast.error(error.error || "Error al registrar votos");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al registrar votos");
    } finally {
      // Usar timeout para prevenir clics muy rápidos
      saveVotosTimeoutRef.current = setTimeout(() => {
        setIsSavingVotos(false);
      }, 1000); // 1 segundo de debounce
    }
  };

  // Verificar permisos según rol
  const canChangeState =
    user?.rol === "Encargado de Local" || user?.rol === "Administrador";
  const canRegisterVotes =
    user?.rol === "Encargado de Local" || user?.rol === "Administrador";
  const canRegisterVoters =
    user?.rol === "Digitador" ||
    user?.rol === "Encargado de Local" ||
    user?.rol === "Administrador";

  // Función para verificar si se pueden realizar acciones en una mesa específica
  const canPerformAction = (mesa: any, action: "vote" | "voter") => {
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
        <div className="overflow-x-auto hide-scrollbar">
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
                      {canPerformAction(mesa, "voter") && (
                        <button
                          onClick={() => handleRegistrarVotante(mesa)}
                          className="flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                          title="Registrar Votante"
                        >
                          <IconUserPlus size={14} className="mr-1" />
                          Votante
                        </button>
                      )}
                      {canPerformAction(mesa, "vote") && (
                        <button
                          onClick={() => handleRegistrarVotos(mesa)}
                          className="flex items-center px-2 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                          title="Registrar Votos"
                        >
                          <IconClipboardText size={14} className="mr-1" />
                          Votos
                        </button>
                      )}
                      {(user?.rol === "Encargado de Local" ||
                        user?.rol === "Administrador") && (
                        <button
                          onClick={() => handleCambiarEstado(mesa)}
                          className={`flex items-center px-2 py-1 text-xs rounded-md transition-colors ${
                            mesa.estado_mesa
                              ? "bg-red-100 text-red-700 hover:bg-red-200"
                              : "bg-green-100 text-green-700 hover:bg-green-200"
                          }`}
                          title={
                            mesa.estado_mesa ? "Cerrar Mesa" : "Abrir Mesa"
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
                      {canPerformAction(mesa, "voter") && (
                        <button
                          onClick={() => handleRegistrarVotante(mesa)}
                          className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                          title="Registrar Votante"
                        >
                          <IconUserPlus size={16} />
                        </button>
                      )}
                      {canPerformAction(mesa, "vote") && (
                        <button
                          onClick={() => handleRegistrarVotos(mesa)}
                          className="flex items-center justify-center w-8 h-8 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                          title="Registrar Votos"
                        >
                          <IconClipboardText size={16} />
                        </button>
                      )}
                      {(user?.rol === "Encargado de Local" ||
                        user?.rol === "Administrador") && (
                        <button
                          onClick={() => handleCambiarEstado(mesa)}
                          className={`flex items-center justify-center w-8 h-8 rounded-md transition-colors ${
                            mesa.estado_mesa
                              ? "bg-red-100 text-red-700 hover:bg-red-200"
                              : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                          }`}
                          title={
                            mesa.estado_mesa ? "Cerrar Mesa" : "Abrir Mesa"
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
                      {canPerformAction(mesa, "voter") && (
                        <button
                          onClick={() => handleRegistrarVotante(mesa)}
                          className="flex items-center justify-center w-7 h-7 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                          title="Registrar Votante"
                        >
                          <IconUserPlus size={14} />
                        </button>
                      )}
                      {canPerformAction(mesa, "vote") && (
                        <button
                          onClick={() => handleRegistrarVotos(mesa)}
                          className="flex items-center justify-center w-7 h-7 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                          title="Registrar Votos"
                        >
                          <IconClipboardText size={14} />
                        </button>
                      )}
                      {(user?.rol === "Encargado de Local" ||
                        user?.rol === "Administrador") && (
                        <button
                          onClick={() => handleCambiarEstado(mesa)}
                          className={`flex items-center justify-center w-7 h-7 rounded transition-colors ${
                            mesa.estado_mesa
                              ? "bg-red-100 text-red-700 hover:bg-red-200"
                              : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                          }`}
                          title={
                            mesa.estado_mesa ? "Cerrar Mesa" : "Abrir Mesa"
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
          <div className="fixed inset-0 bg-black/35 flex items-center justify-center z-[1000] p-4 overflow-y-auto">
            <div className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[95vh] overflow-y-auto shadow-xl border border-slate-200">
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

              {/* Proyectos agrupados por categoría */}
              <div className="max-h-[50vh] sm:max-h-96 overflow-y-auto">
                {(() => {
                  const { proyectosPorCategoria, categoriasOrdenadas } =
                    getProjectsByCategory();

                  return categoriasOrdenadas.map((categoria) => {
                    const categoryColors = getCategoryColors(categoria);

                    return (
                      <div key={categoria} className="mb-6">
                        {/* Encabezado de categoría */}
                        <div
                          className={`flex items-center mb-3 p-2 rounded-lg ${categoryColors.bg} ${categoryColors.border} border`}
                        >
                          <div
                            className={`w-3 h-3 rounded-full ${categoryColors.icon
                              .replace("bg-", "bg-")
                              .replace(" text-", " ")}`}
                          ></div>
                          <h3 className="ml-2 font-semibold text-lg text-slate-800">
                            {categoria}
                          </h3>
                          <span className="ml-auto text-sm text-slate-600">
                            ({proyectosPorCategoria[categoria].length}{" "}
                            proyectos)
                          </span>
                        </div>

                        {/* Proyectos de la categoría */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-4">
                          {proyectosPorCategoria[categoria].map((proyecto) => {
                            const votosActuales =
                              votosExistentes[proyecto.id_proyecto] || 0;
                            const votosNuevos =
                              votoForm[proyecto.id_proyecto] || 0;
                            const totalVotos = votosActuales + votosNuevos;
                            const projectCategoryColors = getCategoryColors(
                              proyecto.tipo_proyecto_nombre || ""
                            );

                            return (
                              <div
                                key={proyecto.id_proyecto}
                                className={`flex justify-between items-center p-3 rounded-lg border ${projectCategoryColors.border} ${projectCategoryColors.bg} ${projectCategoryColors.hover}`}
                              >
                                <div className="flex items-center">
                                  <span
                                    className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${projectCategoryColors.icon} text-xs font-bold`}
                                  >
                                    {proyecto.id_proyecto}
                                  </span>
                                  <div className="ml-3">
                                    <div className="text-sm font-medium text-slate-800">
                                      {proyecto.nombre}
                                    </div>
                                    <div className="text-xs text-blue-600 font-medium">
                                      Votos actuales: {votosActuales}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end">
                                  <input
                                    type="number"
                                    min="0"
                                    value={totalVotos}
                                    onChange={(e) => {
                                      const nuevoTotal =
                                        parseInt(e.target.value) || 0;
                                      const totalAjustado = Math.max(
                                        0,
                                        nuevoTotal
                                      );
                                      const nuevosVotosCalculados =
                                        totalAjustado - votosActuales;
                                      setVotoForm((prev) => ({
                                        ...prev,
                                        [proyecto.id_proyecto]:
                                          nuevosVotosCalculados,
                                      }));
                                    }}
                                    className="w-20 border border-slate-300 rounded px-2 py-1 text-sm text-right focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                  <div className="text-xs text-slate-500 mt-1">
                                    {votosNuevos >= 0
                                      ? `+${votosNuevos}`
                                      : votosNuevos}{" "}
                                    nuevos
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  });
                })()}

                {/* Votos especiales */}
                <div className="mt-6">
                  <div className="flex items-center mb-3 p-2 rounded-lg bg-gray-50 border border-gray-200">
                    <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                    <h3 className="ml-2 font-semibold text-lg text-slate-800">
                      Votos Especiales
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-4">
                    <div className="flex justify-between items-center p-3 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100">
                      <div className="flex items-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-200 text-blue-800 text-xs font-bold">
                          B
                        </span>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-slate-800">
                            Votos en Blanco
                          </div>
                          <div className="text-xs text-blue-600 font-medium">
                            Actuales: {votosExistentes["Blanco"] || 0}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <input
                          type="number"
                          min="0"
                          value={
                            (votosExistentes["Blanco"] || 0) +
                            (votoForm["Blanco"] || 0)
                          }
                          onChange={(e) => {
                            const nuevoTotal = parseInt(e.target.value) || 0;
                            const totalAjustado = Math.max(0, nuevoTotal);
                            const nuevosVotosCalculados =
                              totalAjustado - (votosExistentes["Blanco"] || 0);
                            setVotoForm((prev) => ({
                              ...prev,
                              Blanco: nuevosVotosCalculados,
                            }));
                          }}
                          className="w-20 border border-slate-300 rounded px-2 py-1 text-sm text-right focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <div className="text-xs text-slate-500 mt-1">
                          {(votoForm["Blanco"] || 0) >= 0
                            ? `+${votoForm["Blanco"] || 0}`
                            : votoForm["Blanco"] || 0}{" "}
                          nuevos
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg border border-yellow-200 bg-yellow-50 hover:bg-yellow-100">
                      <div className="flex items-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-yellow-200 text-yellow-800 text-xs font-bold">
                          N
                        </span>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-slate-800">
                            Votos Nulos
                          </div>
                          <div className="text-xs text-blue-600 font-medium">
                            Actuales: {votosExistentes["Nulo"] || 0}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <input
                          type="number"
                          min="0"
                          value={
                            (votosExistentes["Nulo"] || 0) +
                            (votoForm["Nulo"] || 0)
                          }
                          onChange={(e) => {
                            const nuevoTotal = parseInt(e.target.value) || 0;
                            const totalAjustado = Math.max(0, nuevoTotal);
                            const nuevosVotosCalculados =
                              totalAjustado - (votosExistentes["Nulo"] || 0);
                            setVotoForm((prev) => ({
                              ...prev,
                              Nulo: nuevosVotosCalculados,
                            }));
                          }}
                          className="w-20 border border-slate-300 rounded px-2 py-1 text-sm text-right focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <div className="text-xs text-slate-500 mt-1">
                          {(votoForm["Nulo"] || 0) >= 0
                            ? `+${votoForm["Nulo"] || 0}`
                            : votoForm["Nulo"] || 0}{" "}
                          nuevos
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resumen de información antes de guardar */}
              <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <h4 className="text-sm font-medium text-slate-700 mb-2">
                  Resumen de la Mesa:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600">
                  <div className="flex flex-row- items-start gap-1">
                    <span className="font-bold">Votantes registrados:</span>
                    <span className="font-bold text-slate-800">
                      {selectedMesa?.votantes_count || 0}
                    </span>
                  </div>
                  <div className="flex flex-row- items-start gap-1">
                    <span className="font-bold">Votos actuales:</span>
                    <span className="font-bold text-slate-800">
                      {selectedMesa?.votos_count || 0}
                    </span>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-200">
                  <div className="flex flex-row- items-start gap-1 text-xs">
                    <span className="text-slate-600 font-bold">
                      Total votos después de guardar:
                    </span>
                    <span className="font-bold text-slate-800">
                      {(selectedMesa?.votos_count || 0) +
                        Object.values(votoForm).reduce(
                          (sum, val) => sum + (val || 0),
                          0
                        )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
                <button
                  className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors order-2 sm:order-1"
                  onClick={() => setShowVotosModal(false)}
                  disabled={isSavingVotos}
                >
                  Cancelar
                </button>
                <button
                  className={`py-2 px-4 rounded-md transition-colors order-1 sm:order-2 flex items-center gap-2 ${
                    isSavingVotos
                      ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                      : "bg-slate-800 text-white hover:bg-[#30c56c] hover:text-[#e3ecea]"
                  }`}
                  onClick={handleSaveVotos}
                  disabled={isSavingVotos}
                >
                  {isSavingVotos ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Guardando...
                    </>
                  ) : (
                    "Guardar"
                  )}
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
            <div 
              className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl border border-slate-200"
              onKeyDown={handleKeyDown}
            >
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
                    ¿Es extranjero?
                  </label>
                </div>

                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    RUT/Identificación (pasaporte, nombre+apellido, etc)
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
                        : "12.345.678-9 o identificador (pasaporte, nombre+apellido, etc)"
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
                  disabled={isSavingVotante}
                >
                  Cancelar
                </button>
                <button
                  className={`py-2 px-4 rounded-md transition-colors flex items-center gap-2 ${
                    (rutError && !votanteForm.extranjero) || isSavingVotante
                      ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                      : "bg-slate-800 text-white hover:bg-[#30c56c] hover:text-[#e3ecea]"
                  }`}
                  onClick={handleSaveVotante}
                  disabled={!!(rutError && !votanteForm.extranjero) || isSavingVotante}
                >
                  {isSavingVotante ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Guardando...
                    </>
                  ) : (
                    "Registrar"
                  )}
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
