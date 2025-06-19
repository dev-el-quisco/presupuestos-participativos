'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
}

const RoleProtectedRoute = ({ 
  children, 
  allowedRoles, 
  redirectTo = '/dashboard' 
}: RoleProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/');
        return;
      }
      
      if (!user?.rol || !allowedRoles.includes(user.rol)) {
        router.push(redirectTo);
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, redirectTo, router]);

  if (isLoading) {
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

  // Mostrar un mensaje o pantalla de carga mientras se realiza la redirección
  if (!isAuthenticated || !user?.rol || !allowedRoles.includes(user.rol)) {
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
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default RoleProtectedRoute;