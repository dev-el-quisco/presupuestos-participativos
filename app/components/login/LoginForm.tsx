"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import { IconMail } from "@tabler/icons-react";
import { IconLockPassword } from "@tabler/icons-react";
import { IconEye } from "@tabler/icons-react";
import { IconEyeX } from "@tabler/icons-react";

interface LoginFormProps {
  onResetPasswordClick: () => void;
}

const LoginForm = ({ onResetPasswordClick }: LoginFormProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await login(username, password);

      if (result.success) {
        router.push("/dashboard");
      } else {
        setError(result.error || "Error en el inicio de sesión");
      }
    } catch (error) {
      setError("Error de conexión. Intente nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md px-2 sm:px-3">
      <h2 className="font-light text-[#2c3e4a] mb-4 text-sm sm:text-lg">
        Iniciar Sesión
      </h2>

      <form className="space-y-2 sm:space-y-3" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="username"
            className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
          >
            Usuario
          </label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IconMail className="h-4 w-4 text-gray-400" />
            </div>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#538D97] focus:border-[#538D97] text-xs sm:text-sm disabled:bg-gray-100"
              placeholder="Ingrese su nombre de usuario"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
          >
            Contraseña
          </label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IconLockPassword className="h-4 w-4 text-gray-400" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#538D97] focus:border-[#538D97] text-xs sm:text-sm disabled:bg-gray-100"
              placeholder="Ingrese su contraseña"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              {showPassword ? (
                <IconEyeX className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              ) : (
                <IconEye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
          {error && <div className="mt-2 text-[#ed616d]">{error}</div>}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-[#2c3e4a] hover:bg-[#31c46c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#31c46c] disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
          <div className="flex items-center justify-between mt-4">
            <div className="text-xs sm:text-sm">
              <button
                type="button"
                onClick={onResetPasswordClick}
                disabled={isLoading}
                className="font-md text-[#2c3e4a] hover:text-[#6b7fbd] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A4C3C6] disabled:text-gray-400"
              >
                Restablecer contraseña
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
