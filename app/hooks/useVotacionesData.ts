import { useState, useEffect } from 'react';
import { useYear } from '@/app/context/YearContext';
import { useAuth } from '@/app/hooks/useAuth';
import toast from 'react-hot-toast';

interface Mesa {
  id: number;
  nombre: string;
  estado_mesa: boolean;
  sede_id: number;
  sede_nombre: string;
  periodo: number;
  votos_count: number;
  votantes_count: number;
}

interface Proyecto {
  id: number;
  id_proyecto: string;
  nombre: string;
  tipo_proyecto: string;
  sector: string;
  periodo: number;
  votos_count: number;
}

export function useVotacionesData() {
  const { selectedYear, isYearReady } = useYear();
  const { user } = useAuth();
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMesas = async () => {
    if (!selectedYear || !user) return;
    
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
        const mesasOrdenadas = data.data.sort((a: Mesa, b: Mesa) => {
          const sedeComparison = a.sede_nombre.localeCompare(b.sede_nombre);
          if (sedeComparison !== 0) {
            return sedeComparison;
          }
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

  const fetchProyectos = async () => {
    if (!selectedYear) return;
    
    try {
      const response = await fetch(`/api/projects?periodo=${selectedYear}`);
      if (response.ok) {
        const data = await response.json();
        setProyectos(data.projects);
      }
    } catch (error) {
      console.error("Error al cargar proyectos:", error);
    }
  };

  useEffect(() => {
    if (isYearReady && selectedYear && user) {
      fetchMesas();
      fetchProyectos();
    }
  }, [selectedYear, user, isYearReady]);

  return {
    mesas,
    proyectos,
    loading,
    setMesas,
    refetchMesas: fetchMesas,
    refetchProyectos: fetchProyectos
  };
}