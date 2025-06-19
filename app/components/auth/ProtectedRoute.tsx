"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/");
        return;
      }

      if (requiredRole && user?.rol !== requiredRole) {
        router.push("/unauthorized");
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, requiredRole, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#2c3e4a]"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole && user?.rol !== requiredRole) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
