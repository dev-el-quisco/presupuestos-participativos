"use client";

import { useState } from "react";
import {
  IconMail,
  IconLockPassword,
  IconEye,
  IconEyeX,
} from "@tabler/icons-react";
import toast from "react-hot-toast";

interface ResetPasswordProps {
  onCancel: () => void;
}

const ResetPassword = ({ onCancel }: ResetPasswordProps) => {
  const [step, setStep] = useState<"email" | "code" | "success">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        setStep("code");
      } else {
        toast.error(data.error || "Error al enviar el código");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        setStep("success");
      } else {
        toast.error(data.error || "Error al restablecer la contraseña");
      }
    } catch (error) {
      toast.error("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  const renderEmailStep = () => (
    <form onSubmit={handleEmailSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="email"
          className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
        >
          Correo Electrónico
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <IconMail className="h-4 w-4 text-gray-400" />
          </div>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#538D97] focus:border-[#2A737D] text-xs sm:text-sm"
            placeholder="Ingrese su correo electrónico"
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="w-full sm:flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-xs sm:text-sm font-medium text-gray-700 bg-[#F5F7F9] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A4C3C6] disabled:opacity-50 transition-colors"
          disabled={isLoading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="w-full sm:flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-[#2c3e4a] hover:bg-[#31c46c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#31c46c] disabled:opacity-50 transition-colors"
          disabled={isLoading}
        >
          {isLoading ? "Enviando..." : "Enviar Código"}
        </button>
      </div>
    </form>
  );

  const renderCodeStep = () => (
    <form onSubmit={handleCodeSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="code"
          className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
        >
          Código de Verificación
        </label>
        <div className="space-y-1">
          <input
            id="code"
            name="code"
            type="text"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#538D97] focus:border-[#2A737D] text-sm text-center font-mono tracking-widest"
            placeholder="000000"
            maxLength={6}
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500">
            Ingrese el código de 6 dígitos enviado a{" "}
            <span className="font-medium">{email}</span>
          </p>
        </div>
      </div>

      <div>
        <label
          htmlFor="newPassword"
          className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
        >
          Nueva Contraseña
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <IconLockPassword className="h-4 w-4 text-gray-400" />
          </div>
          <input
            id="newPassword"
            name="newPassword"
            type={showPassword ? "text" : "password"}
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#538D97] focus:border-[#2A737D] text-xs sm:text-sm"
            placeholder="Mínimo 6 caracteres"
            minLength={6}
            disabled={isLoading}
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {showPassword ? (
                <IconEyeX className="h-4 w-4" />
              ) : (
                <IconEye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
        >
          Confirmar Contraseña
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <IconLockPassword className="h-4 w-4 text-gray-400" />
          </div>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#538D97] focus:border-[#2A737D] text-xs sm:text-sm"
            placeholder="Repita la contraseña"
            minLength={6}
            disabled={isLoading}
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {showConfirmPassword ? (
                <IconEyeX className="h-4 w-4" />
              ) : (
                <IconEye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 pt-2">
        <button
          type="button"
          onClick={() => setStep("email")}
          className="w-full sm:flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-xs sm:text-sm font-medium text-gray-700 bg-[#F5F7F9] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A4C3C6] disabled:opacity-50 transition-colors"
          disabled={isLoading}
        >
          Volver
        </button>
        <button
          type="submit"
          className="w-full sm:flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-[#2c3e4a] hover:bg-[#31c46c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#31c46c] disabled:opacity-50 transition-colors"
          disabled={isLoading}
        >
          {isLoading ? "Restableciendo..." : "Confirmar"}
        </button>
      </div>
    </form>
  );

  const renderSuccessStep = () => (
    <div className="text-center space-y-4">
      <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
        <h3 className="font-medium mb-2 text-sm sm:text-base">
          ¡Contraseña Restablecida!
        </h3>
        <p className="text-xs sm:text-sm">
          Tu contraseña ha sido restablecida exitosamente. Ya puedes iniciar
          sesión con tu nueva contraseña.
        </p>
      </div>
      <button
        onClick={onCancel}
        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-[#025964] hover:bg-[#2A737D] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#538D97] transition-colors"
      >
        Volver al inicio de sesión
      </button>
    </div>
  );

  return (
    <div className="w-full max-w-md px-2 sm:px-3">
      <div className="mb-4">
        <h2 className="font-light text-[#2c3e4a] text-sm sm:text-lg mb-2">
          {step === "email" && "Recuperar Contraseña"}
          {step === "code" && "Verificar Código"}
          {step === "success" && "Contraseña Restablecida"}
        </h2>

        {step === "email" && (
          <p className="text-[#122056] text-xs sm:text-sm">
            Ingrese su correo electrónico y le enviaremos un código para
            restablecer su contraseña.
          </p>
        )}

        {step === "code" && (
          <p className="text-[#122056] text-xs sm:text-sm">
            Ingrese el código de verificación y su nueva contraseña.
          </p>
        )}
      </div>

      {step === "email" && renderEmailStep()}
      {step === "code" && renderCodeStep()}
      {step === "success" && renderSuccessStep()}
    </div>
  );
};

export default ResetPassword;
