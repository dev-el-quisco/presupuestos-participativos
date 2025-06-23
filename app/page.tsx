"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import LoginHeader from "@/app/components/login/LoginHeader";
import LoginForm from "@/app/components/login/LoginForm";
import ResetPassword from "@/app/components/login/ResetPassword";
import LoginFooter from "@/app/components/login/LoginFooter";
import toast from "react-hot-toast";

export default function Home() {
  const [showResetPassword, setShowResetPassword] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleResetPasswordClick = () => {
    setShowResetPassword(true);
  };

  const handleCancelReset = () => {
    setShowResetPassword(false);
  };

  if (isLoading) {
    return (
      <div className="h-dvh flex items-center justify-center relative">
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

  if (isAuthenticated) {
    return null; // Se redirigirá al dashboard
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-3 sm:p-4">
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

      <div className="w-full max-w-sm sm:max-w-md bg-[#FFFFFF]/90 rounded-xl shadow-lg overflow-hidden backdrop-blur-sm my-4">
        <div className="w-full p-4 sm:p-6 lg:p-8 flex flex-col min-h-[500px] sm:min-h-[600px]">
          {/* Header con logo */}
          <div className="flex-shrink-0 mb-3 sm:mb-4">
            <LoginHeader />
          </div>

          {/* Contenido principal con altura flexible */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="relative min-h-[300px] sm:min-h-[350px] flex items-center justify-center">
              <div
                className={`w-full transition-all duration-300 ease-in-out ${
                  showResetPassword
                    ? "opacity-0 pointer-events-none absolute"
                    : "opacity-100 relative"
                }`}
              >
                <LoginForm onResetPasswordClick={handleResetPasswordClick} />
              </div>
              <div
                className={`w-full transition-all duration-300 ease-in-out ${
                  showResetPassword
                    ? "opacity-100 relative"
                    : "opacity-0 pointer-events-none absolute"
                }`}
              >
                <ResetPassword onCancel={handleCancelReset} />
              </div>
            </div>
          </div>

          {/* Footer con logo municipalidad */}
          <div className="flex-shrink-0 mt-3 sm:mt-4">
            <LoginFooter />
          </div>
        </div>
      </div>
    </div>
  );
}
