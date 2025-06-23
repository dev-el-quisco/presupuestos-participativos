"use client";

import Layout from "@/app/dashboard/[periodo]/panel-administrador/Layout";
import PollingPlacesList from "@/app/components/dashboard/administrator/pollingplaces/PollingPlaces";
import { IconPlus } from "@tabler/icons-react";
import { useState } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import Portal from "@/app/components/ui/Portal";

// Componente SedeForm
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

export default function PollingPlaces() {
  const params = useParams();
  const periodo = params.periodo as string;

  const [showSedeModal, setShowSedeModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Handle sede creation
  const handleCreateSede = async (nombre: string) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/sedes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Sede creada exitosamente");
        setShowSedeModal(false);
        // Trigger refresh in PollingPlacesList
        (window as any).refreshSedes?.();
      } else {
        toast.error(data.error || "Error al crear la sede");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al crear la sede");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="p-6 w-full flex flex-col justify-start bg-white shadow-sm border border-gray-200 rounded-lg">
        <div className="flex flex-row items-center justify-between mb-4">
          <h1 className="text-2xl">Sedes</h1>
          <button
            onClick={() => setShowSedeModal(true)}
            className="flex items-center justify-center bg-slate-800 text-white rounded-lg px-4 py-2 hover:bg-[#30c56c] hover:text-[#e3ecea] transition-colors focus:ring-2 focus:ring-[#30c56c] focus:border-[#30c56c] outline-none text-sm focus:outline-none"
          >
            <IconPlus className="w-5 h-5 mr-2" />
            Nueva Sede
          </button>
        </div>
        <PollingPlacesList />
      </div>

      {/* Modal Crear Sede */}
      {showSedeModal && (
        <Portal>
          <div className="fixed inset-0 bg-black/35 flex items-center justify-center z-[1000] p-4 overflow-y-auto">
            <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-slate-800">
                  Crear Nueva Sede
                </h3>
                <button
                  onClick={() => setShowSedeModal(false)}
                  className="text-slate-500 hover:text-slate-700 h-8 w-8 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors"
                >
                  ×
                </button>
              </div>

              <SedeForm
                onSubmit={handleCreateSede}
                onCancel={() => setShowSedeModal(false)}
                isLoading={isLoading}
              />
            </div>
          </div>
        </Portal>
      )}
    </Layout>
  );
}
