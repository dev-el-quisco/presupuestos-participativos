import { IconEdit, IconTrash } from "@tabler/icons-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Portal from "@/app/components/ui/Portal";

interface Sector {
  id: string;
  nombre: string;
}

interface SectorsProps {
  searchTerm: string;
  refreshTrigger: number;
}

const Sectors = ({ searchTerm, refreshTrigger }: SectorsProps) => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredSectors, setFilteredSectors] = useState<Sector[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editFormData, setEditFormData] = useState({
    nombre: "",
  });

  const fetchSectors = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/sectores");
      const data = await response.json();

      if (response.ok) {
        setSectors(data.sectores);
      } else {
        toast.error("Error al cargar sectores");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSectors();
  }, [refreshTrigger]);

  useEffect(() => {
    const filtered = sectors.filter((sector) =>
      sector.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSectors(filtered);
  }, [sectors, searchTerm]);

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

  const handleEditSector = (sector: Sector) => {
    setSelectedSector(sector);
    setEditFormData({
      nombre: sector.nombre,
    });
    setShowEditModal(true);
  };

  const handleDeleteSector = (sector: Sector) => {
    setSelectedSector(sector);
    setShowDeleteModal(true);
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateSector = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSector) return;

    setIsUpdating(true);

    try {
      const response = await fetch("/api/sectores", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedSector.id,
          ...editFormData,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Sector actualizado exitosamente");
        setShowEditModal(false);
        setSelectedSector(null);
        fetchSectors(); // Recargar la lista
      } else {
        toast.error(data.error || "Error al actualizar sector");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error de conexión");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedSector) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/sectores?id=${selectedSector.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Sector eliminado exitosamente");
        setShowDeleteModal(false);
        setSelectedSector(null);
        fetchSectors(); // Recargar la lista
      } else {
        toast.error(data.error || "Error al eliminar sector");
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
    setSelectedSector(null);
    setEditFormData({
      nombre: "",
    });
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedSector(null);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span className="ml-2">Cargando sectores...</span>
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
              {filteredSectors.length === 0 ? (
                <tr>
                  <td
                    colSpan={2}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    {searchTerm
                      ? "No se encontraron sectores que coincidan con la búsqueda"
                      : "No hay sectores registrados"}
                  </td>
                </tr>
              ) : (
                filteredSectors.map((sector) => (
                  <tr
                    key={sector.id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 font-medium">{sector.nombre}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEditSector(sector)}
                          className="p-1.5 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                          title="Editar"
                        >
                          <IconEdit className="w-5 h-5 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDeleteSector(sector)}
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
      {showEditModal && selectedSector && (
        <Portal>
          <div className="fixed inset-0 bg-black/35 flex items-center justify-center z-[1000] p-4 overflow-y-auto">
            <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-slate-800">
                  Editar Sector
                </h3>
                <button
                  onClick={handleCloseEditModal}
                  className="text-slate-500 hover:text-slate-700 h-8 w-8 rounded-full flex items-center justify-center hover:bg-slate-100"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleUpdateSector} className="space-y-4">
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nombre del Sector *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={editFormData.nombre}
                    onChange={handleEditInputChange}
                    required
                    className="border border-slate-300 rounded-md p-2 focus:ring-slate-500 focus:border-slate-500"
                    placeholder="Ej: Norte, Sur, Centro, Oriente"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Nota:</strong> Los cambios se aplicarán a todos los
                    proyectos que usen este sector.
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
                    {isUpdating ? "Actualizando..." : "Actualizar Sector"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Portal>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && selectedSector && (
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
                  ¿Estás seguro de que deseas eliminar el sector{" "}
                  <strong>{selectedSector.nombre}</strong>?
                </p>
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-800">
                    <strong>Advertencia:</strong> Esta acción no se puede
                    deshacer. Solo se puede eliminar si no hay proyectos
                    asociados a este sector.
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
                  {isDeleting ? "Eliminando..." : "Eliminar Sector"}
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </>
  );
};

export default Sectors;
