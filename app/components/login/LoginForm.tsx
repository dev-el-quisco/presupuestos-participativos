"use client";

import { useState } from "react";

interface LoginFormProps {
  onResetPasswordClick: () => void;
}

const LoginForm = ({ onResetPasswordClick }: LoginFormProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica de autenticación en el futuro
    console.log("Intento de login con:", username, password);
    // Por ahora, simplemente redirigimos al dashboard
    window.location.href = "/dashboard";
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
          <div className="mt-1">
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#538D97] focus:border-[#538D97] text-xs sm:text-sm"
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
          <div className="mt-1">
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#538D97] focus:border-[#538D97] text-xs sm:text-sm"
              placeholder="Ingrese su contraseña"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-[#2c3e4a] hover:bg-[#31c46c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f3bd49]"
          >
            Iniciar sesión
          </button>
          <div className="flex items-center justify-between mt-4">
            <div className="text-xs sm:text-sm">
              <button
                type="button"
                onClick={onResetPasswordClick}
                className="font-md text-[#6b7fbd] hover:text-[#1cbab7] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A4C3C6]"
              >
                Recuperar contraseña
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
