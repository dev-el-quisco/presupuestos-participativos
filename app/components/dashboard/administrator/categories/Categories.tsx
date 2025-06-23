"use client";

import { IconEdit, IconTrash } from "@tabler/icons-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Portal from "@/app/components/ui/Portal";

interface ProjectType {
  id: string;
  nombre: string;
}

interface CategoriesProps {
  searchTerm: string;
  refreshTrigger: number;
}

const Categories = ({ searchTerm, refreshTrigger }: CategoriesProps) => {
  const [projectTypes, setProjectTypes] = useState<ProjectType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredTypes, setFilteredTypes] = useState<ProjectType[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedType, setSelectedType] = useState<ProjectType | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editFormData, setEditFormData] = useState({
    nombre: "",
  });

  const fetchProjectTypes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/projects/types");
      const data = await response.json();

      if (response.ok) {
        setProjectTypes(data.projectTypes);
      } else {
        toast.error("Error al cargar tipos de proyecto");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectTypes();
  }, [refreshTrigger]);

  useEffect(() => {
    const filtered = projectTypes.filter((type) =>
      type.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTypes(filtered);
  }, [projectTypes, searchTerm]);

  // Controlar el overflow del body cuando los modales están abiertos
  useEffect(() => {
    if (showEditModal || showDeleteModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showEditModal, showDeleteModal]);

  const handleEditType = (type: ProjectType) => {
    setSelectedType(type);
    setEditFormData({
      nombre: type.nombre,
    });
    setShowEditModal(true);
  };

  const handleDeleteType = (type: ProjectType) => {
    setSelectedType(type);
    setShowDeleteModal(true);
  };

  const handleEditInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType) return;

    setIsUpdating(true);

    try {
      const response = await fetch("/api/projects/types", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedType.id,
          ...editFormData,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Tipo de proyecto actualizado exitosamente");
        setShowEditModal(false);
        setSelectedType(null);
        fetchProjectTypes(); // Recargar la lista
      } else {
        toast.error(data.error || "Error al actualizar tipo de proyecto");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error de conexión");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedType) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/projects/types?id=${selectedType.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Tipo de proyecto eliminado exitosamente");
        setShowDeleteModal(false);
        setSelectedType(null);
        fetchProjectTypes(); // Recargar la lista
      } else {
        toast.error(data.error || "Error al eliminar tipo de proyecto");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error de conexión");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedType(null);
    setEditFormData({
      nombre: "",
    });
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedType(null);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span className="ml-2">Cargando tipos de proyecto...</span>
        </div>
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
                <th className="px-6 py-3">Nombre</th>
                <th className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredTypes.length === 0 ? (
                <tr>
                  <td
                    colSpan={2}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    {searchTerm
                      ? "No se encontraron tipos de proyecto que coincidan con la búsqueda"
                      : "No hay tipos de proyecto registrados"}
                  </td>
                </tr>
              ) : (
                filteredTypes.map((type) => (
                  <tr
                    key={type.id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 font-medium">{type.nombre}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEditType(type)}
                          className="p-1.5 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                          title="Editar"
                        >
                          <IconEdit className="w-5 h-5 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteType(type)}
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

      {/* Modal de edición */}
      {showEditModal && selectedType && (
        <Portal>
          <div className="fixed inset-0 bg-black/35 flex items-center justify-center z-[1000] p-4 overflow-y-auto">
            <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-slate-800">
                  Editar Tipo de Proyecto
                </h3>
                <button
                  onClick={handleCloseEditModal}
                  className="text-slate-500 hover:text-slate-700 h-8 w-8 rounded-full flex items-center justify-center hover:bg-slate-100"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleUpdateType} className="space-y-4">
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nombre del Tipo de Proyecto *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={editFormData.nombre}
                    onChange={handleEditInputChange}
                    required
                    className="border border-slate-300 rounded-md p-2 focus:ring-slate-500 focus:border-slate-500"
                    placeholder="Ej: Infraestructura, Educación, Salud"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Nota:</strong> Los cambios se aplicarán a todos los proyectos que usen este tipo.
                  </p>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                    onClick={handleCloseEditModal}
                    disabled={isUpdating}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-slate-800 text-white py-2 px-4 rounded-md hover:bg-[#30c56c] hover:text-[#e3ecea] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isUpdating}
                  >
                    {isUpdating ? "Actualizando..." : "Actualizar Tipo"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Portal>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && selectedType && (
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
                <p className="text-sm text-slate-600 mb-4">
                  ¿Estás seguro de que deseas eliminar el tipo de proyecto{" "}
                  <strong>{selectedType.nombre}</strong>?
                </p>
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-800">
                    <strong>Advertencia:</strong> Esta acción no se puede
                    deshacer. Solo se puede eliminar si no hay proyectos con votos asociados a este tipo.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                  onClick={handleCloseDeleteModal}
                  disabled={isDeleting}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Eliminando..." : "Eliminar Tipo"}
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </>
  );
};

export default Categories;
