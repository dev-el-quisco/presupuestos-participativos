"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const [minDelayCompleted, setMinDelayCompleted] = useState(false);

  useEffect(() => {
    // Delay mínimo de 500ms para suavizar la transición
    const timer = setTimeout(() => {
      setMinDelayCompleted(true);
    }, 250);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Solo realizar la redirección cuando tanto la carga como el delay mínimo hayan terminado
    if (!initialCheckDone && !isLoading && minDelayCompleted) {
      if (!isAuthenticated) {
        router.push("/");
        return;
      }

      if (requiredRole && user?.rol !== requiredRole) {
        router.push("/unauthorized");
        return;
      }

      setInitialCheckDone(true);
    }
  }, [
    isAuthenticated,
    isLoading,
    user,
    requiredRole,
    router,
    initialCheckDone,
    minDelayCompleted,
  ]);

  // Mostrar spinner durante la carga inicial o hasta que se complete el delay mínimo
  if ((isLoading || !minDelayCompleted) && !initialCheckDone) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <div className="h-full w-full absolute inset-0 -z-10 bg-[#2c3e4a]">
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, #4f4f4f 0, #4f4f4f 2px, transparent 2px, transparent 10px)`,
              backgroundSize: "14px 14px",
              opacity: "0.15",
            }}
          ></div>
        </div>
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
