"use client";

import { useState } from "react";

interface ResetPasswordProps {
  onCancel: () => void;
}

const ResetPassword = ({ onCancel }: ResetPasswordProps) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar el correo de recuperación
    setMessage(
      "Se ha enviado un enlace de recuperación a su correo electrónico."
    );
    // En un caso real, aquí se haría una llamada a la API
  };

  return (
    <div className="w-full max-w-md px-2 sm:px-4">
      <h2 className="font-light text-[#393b3d] mb-4 text-sm sm:text-lg">
        Recuperar Contraseña
      </h2>
      <p className="text-[#393b3d] mb-6 text-xs sm:text-sm">
        Ingrese su correo electrónico y le enviaremos un enlace para restablecer
        su contraseña.
      </p>

      {message ? (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          {message}
          <div className="mt-4">
            <button
              onClick={onCancel}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#025964] hover:bg-[#2A737D] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#538D97]"
            >
              Volver al inicio de sesión
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-xs sm:text-sm font-medium text-gray-700"
            >
              Correo Electrónico
            </label>
            <div className="mt-0.5 sm:mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#538D97] focus:border-[#2A737D] text-xs sm:text-sm"
                placeholder="Ingrese su correo electrónico"
              />
            </div>
          </div>

          <div className="flex items-center justify-between space-x-2 sm:space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2 px-2 sm:px-4 border border-gray-300 rounded-md shadow-sm text-xs sm:text-sm font-medium text-gray-700 bg-[#F5F7F9] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A4C3C6]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-2 sm:px-4 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-[#025964] hover:bg-[#2A737D] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#538D97]"
            >
              Enviar
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ResetPassword;
