"use client";

import { useState, useEffect } from "react";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { useYear } from "@/app/context/YearContext";
import Portal from "@/app/components/ui/Portal";
import toast from "react-hot-toast";

interface Project {
  db_id: string;
  id_proyecto: string;
  nombre: string;
  id_tipo_proyecto: string;
  tipo_proyecto_nombre: string;
  periodo: number;
  votos_count: number;
}

interface ProjectType {
  id: string;
  nombre: string;
}

const ProjectsListComponent = () => {
  const { selectedYear } = useYear();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentFilter, setCurrentFilter] = useState<string>("todos");

  // Estados para modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Estados para formularios
  const [createFormData, setCreateFormData] = useState({
    id_proyecto: "",
    nombre: "",
    id_tipo_proyecto: "",
  });

  const [editFormData, setEditFormData] = useState({
    db_id: "",
    id_proyecto: "",
    nombre: "",
    id_tipo_proyecto: "",
  });

  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // Función para filtrar proyectos
  const filterProjects = (category: string) => {
    if (category === "todos") {
      setFilteredProjects(projects);
    } else {
      const filtered = projects.filter(
        (project) => project.tipo_proyecto_nombre === category
      );
      setFilteredProjects(filtered);
    }
    setCurrentFilter(category);
  };

  // Función para obtener proyectos
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects?periodo=${selectedYear}`);
      const data = await response.json();

      if (data.success) {
        setProjects(data.projects);
        // Aplicar filtro actual después de cargar
        const currentCategory = (window as any).getCurrentCategory
          ? (window as any).getCurrentCategory()
          : "todos";
        if (currentCategory === "todos") {
          setFilteredProjects(data.projects);
        } else {
          const filtered = data.projects.filter(
            (project: Project) =>
              project.tipo_proyecto_nombre === currentCategory
          );
          setFilteredProjects(filtered);
        }
        setCurrentFilter(currentCategory);
      } else {
        toast.error("Error al cargar proyectos");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener tipos de proyecto
  const fetchProjectTypes = async () => {
    try {
      const response = await fetch("/api/projects/types");
      const data = await response.json();

      if (data.success) {
        setProjectTypes(data.projectTypes);
      } else {
        toast.error("Error al cargar tipos de proyecto");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error de conexión");
    }
  };

  useEffect(() => {
    if (selectedYear) {
      fetchProjects();
    }
    fetchProjectTypes();
  }, [selectedYear]);

  // Aplicar filtro cuando cambian los proyectos
  useEffect(() => {
    filterProjects(currentFilter);
  }, [projects]);

  // Controlar overflow del body
  useEffect(() => {
    const isModalOpen = showCreateModal || showEditModal || showDeleteModal;
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showCreateModal, showEditModal, showDeleteModal]);

  // Exponer función para crear proyecto globalmente
  useEffect(() => {
    (window as any).handleCreateProject = () => {
      setShowCreateModal(true);
    };

    return () => {
      delete (window as any).handleCreateProject;
    };
  }, []);

  // Exponer función para manejar filtro de categorías
  useEffect(() => {
    (window as any).handleCategoryFilter = (category: string) => {
      filterProjects(category);
    };

    return () => {
      delete (window as any).handleCategoryFilter;
    };
  }, [projects]);

  // Exponer función para actualizar categorías
  useEffect(() => {
    (window as any).updateProjectsList = fetchProjects;

    return () => {
      delete (window as any).updateProjectsList;
    };
  }, [selectedYear]);

  // Handlers para crear proyecto
  const handleCreateInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setCreateFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...createFormData,
          periodo: selectedYear,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Proyecto creado exitosamente");
        setShowCreateModal(false);
        setCreateFormData({
          id_proyecto: "",
          nombre: "",
          id_tipo_proyecto: "",
        });
        fetchProjects();
        // Actualizar categorías
        if ((window as any).updateCategories) {
          (window as any).updateCategories();
        }
        // Disparar evento personalizado
        window.dispatchEvent(new CustomEvent("projectCreated"));
      } else {
        toast.error(data.error || "Error al crear proyecto");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  // Handlers para editar proyecto
  const handleEditProject = (project: Project) => {
    setEditFormData({
      db_id: project.db_id,
      id_proyecto: project.id_proyecto,
      nombre: project.nombre,
      id_tipo_proyecto: project.id_tipo_proyecto,
    });
    setShowEditModal(true);
  };

  const handleEditInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Proyecto actualizado exitosamente");
        setShowEditModal(false);
        fetchProjects();
        // Actualizar categorías
        if ((window as any).updateCategories) {
          (window as any).updateCategories();
        }
        // Disparar evento personalizado
        window.dispatchEvent(new CustomEvent("projectUpdated"));
      } else {
        toast.error(data.error || "Error al actualizar proyecto");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  // Handlers para eliminar proyecto
  const handleDeleteProject = (project: Project) => {
    setProjectToDelete(project);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;

    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/projects?id_proyecto=${projectToDelete.id_proyecto}&periodo=${selectedYear}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Proyecto eliminado exitosamente");
        setShowDeleteModal(false);
        setProjectToDelete(null);
        fetchProjects();
        // Actualizar categorías
        if ((window as any).updateCategories) {
          (window as any).updateCategories();
        }
        // Disparar evento personalizado
        window.dispatchEvent(new CustomEvent("projectDeleted"));
      } else {
        toast.error(data.error || "Error al eliminar proyecto");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  // Funciones para cerrar modales
  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setCreateFormData({
      id_proyecto: "",
      nombre: "",
      id_tipo_proyecto: "",
    });
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditFormData({
      db_id: "",
      id_proyecto: "",
      nombre: "",
      id_tipo_proyecto: "",
    });
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setProjectToDelete(null);
  };

  // Función para obtener color de categoría
  const getCategoryColor = (type: string) => {
    const colors: Record<string, string> = {
      Comunales: "bg-green-100 text-green-800",
      Infantiles: "bg-blue-100 text-blue-800",
      Deportivos: "bg-yellow-100 text-yellow-800",
      Culturales: "bg-red-100 text-red-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2 text-gray-600">Cargando proyectos...</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Nombre del Proyecto</th>
                <th className="px-6 py-3">Tipo</th>
                <th className="px-6 py-3">Votos</th>
                <th className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    {currentFilter === "todos"
                      ? `No hay proyectos registrados para el año ${selectedYear}`
                      : `No hay proyectos de tipo "${currentFilter}" para el año ${selectedYear}`}
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => (
                  <tr
                    key={project.db_id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 font-medium">
                      {project.id_proyecto}
                    </td>
                    <td className="px-6 py-4">{project.nombre}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(
                          project.tipo_proyecto_nombre
                        )}`}
                      >
                        {project.tipo_proyecto_nombre}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {project.votos_count.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEditProject(project)}
                          className="p-1.5 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                          title="Editar"
                        >
                          <IconEdit className="w-5 h-5 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project)}
                          className="p-1.5 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                          title="Eliminar"
                        >
                          <IconTrash className="w-5 h-5 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear Proyecto */}
      {showCreateModal && (
        <Portal>
          <div className="fixed inset-0 bg-black/35 flex items-center justify-center z-[1000] p-4 overflow-y-auto">
            <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-slate-800">
                  Crear Nuevo Proyecto
                </h3>
                <button
                  onClick={handleCloseCreateModal}
                  className="text-slate-500 hover:text-slate-700 h-8 w-8 rounded-full flex items-center justify-center hover:bg-slate-100"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmitCreate} className="space-y-4">
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    ID del Proyecto *
                  </label>
                  <input
                    type="text"
                    name="id_proyecto"
                    value={createFormData.id_proyecto}
                    onChange={handleCreateInputChange}
                    required
                    className="border border-slate-300 rounded-md p-2 focus:ring-slate-500 focus:border-slate-500"
                    placeholder="Ej: C1, D1, I1"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nombre del Proyecto *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={createFormData.nombre}
                    onChange={handleCreateInputChange}
                    required
                    className="border border-slate-300 rounded-md p-2 focus:ring-slate-500 focus:border-slate-500"
                    placeholder="Ej: Mejoramiento de plazas públicas"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tipo de Proyecto *
                  </label>
                  <select
                    name="id_tipo_proyecto"
                    value={createFormData.id_tipo_proyecto}
                    onChange={handleCreateInputChange}
                    required
                    className="border border-slate-300 rounded-md p-2 focus:ring-slate-500 focus:border-slate-500"
                  >
                    <option value="">Seleccionar tipo</option>
                    {projectTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Año:</strong> {selectedYear}
                  </p>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                    onClick={handleCloseCreateModal}
                    disabled={isLoading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-slate-800 text-white py-2 px-4 rounded-md hover:bg-[#30c56c] hover:text-[#e3ecea] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creando..." : "Crear Proyecto"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Portal>
      )}

      {/* Modal Editar Proyecto */}
      {showEditModal && (
        <Portal>
          <div className="fixed inset-0 bg-black/35 flex items-center justify-center z-[1000] p-4 overflow-y-auto">
            <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-slate-800">
                  Editar Proyecto
                </h3>
                <button
                  onClick={handleCloseEditModal}
                  className="text-slate-500 hover:text-slate-700 h-8 w-8 rounded-full flex items-center justify-center hover:bg-slate-100"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmitEdit} className="space-y-4">
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    ID del Proyecto *
                  </label>
                  <input
                    type="text"
                    name="id_proyecto"
                    value={editFormData.id_proyecto}
                    onChange={handleEditInputChange}
                    required
                    className="border border-slate-300 rounded-md p-2 focus:ring-slate-500 focus:border-slate-500"
                    placeholder="Ej: C1, D1, I1"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nombre del Proyecto *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={editFormData.nombre}
                    onChange={handleEditInputChange}
                    required
                    className="border border-slate-300 rounded-md p-2 focus:ring-slate-500 focus:border-slate-500"
                    placeholder="Ej: Mejoramiento de plazas públicas"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Tipo de Proyecto *
                  </label>
                  <select
                    name="id_tipo_proyecto"
                    value={editFormData.id_tipo_proyecto}
                    onChange={handleEditInputChange}
                    required
                    className="border border-slate-300 rounded-md p-2 focus:ring-slate-500 focus:border-slate-500"
                  >
                    <option value="">Seleccionar tipo</option>
                    {projectTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                    onClick={handleCloseEditModal}
                    disabled={isLoading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-slate-800 text-white py-2 px-4 rounded-md hover:bg-[#30c56c] hover:text-[#e3ecea] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  >
                    {isLoading ? "Guardando..." : "Guardar Cambios"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Portal>
      )}

      {/* Modal Confirmar Eliminación */}
      {showDeleteModal && projectToDelete && (
        <Portal>
          <div className="fixed inset-0 bg-black/35 flex items-center justify-center z-[1000] p-4 overflow-y-auto">
            <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md shadow-xl border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-slate-800">
                  Confirmar Eliminación
                </h3>
                <button
                  onClick={handleCloseDeleteModal}
                  className="text-slate-500 hover:text-slate-700 h-8 w-8 rounded-full flex items-center justify-center hover:bg-slate-100"
                >
                  ×
                </button>
              </div>

              <div className="mb-6">
                <p className="text-slate-600 mb-4">
                  ¿Estás seguro de que deseas eliminar este proyecto?
                </p>
                <div className="bg-gray-50 rounded-md p-3">
                  <p className="text-sm">
                    <strong>ID:</strong> {projectToDelete.id_proyecto}
                  </p>
                  <p className="text-sm">
                    <strong>Nombre:</strong> {projectToDelete.nombre}
                  </p>
                  <p className="text-sm">
                    <strong>Votos:</strong> {projectToDelete.votos_count}
                  </p>
                </div>
                {projectToDelete.votos_count > 0 && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-800">
                      <strong>Advertencia:</strong> Este proyecto tiene votos
                      registrados. No podrá ser eliminado si tiene votos.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                  onClick={handleCloseDeleteModal}
                  disabled={isLoading}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? "Eliminando..." : "Eliminar"}
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </>
  );
};

export default ProjectsListComponent;
