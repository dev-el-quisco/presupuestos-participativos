"use client";

import { useState } from "react";
import { IconMail, IconLockPassword, IconEye, IconEyeX } from "@tabler/icons-react";
import toast from "react-hot-toast";

interface ResetPasswordProps {
  onCancel: () => void;
}

const ResetPassword = ({ onCancel }: ResetPasswordProps) => {
  const [step, setStep] = useState<'email' | 'code' | 'success'>('email');
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
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        setStep('code');
      } else {
        toast.error(data.error || 'Error al enviar el código');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          code, 
          newPassword 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        setStep('success');
      } else {
        toast.error(data.error || 'Error al restablecer la contraseña');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const renderEmailStep = () => (
    <form onSubmit={handleEmailSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="email"
          className="block text-xs sm:text-sm font-medium text-gray-700"
        >
          Correo Electrónico
        </label>
        <div className="mt-0.5 sm:mt-1 relative">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="appearance-none block w-full px-2 sm:px-3 py-1.5 sm:py-2 pl-8 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#538D97] focus:border-[#2A737D] text-xs sm:text-sm"
            placeholder="Ingrese su correo electrónico"
            disabled={isLoading}
          />
          <IconMail className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        </div>
      </div>

      <div className="flex items-center justify-between space-x-2 sm:space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2 px-2 sm:px-4 border border-gray-300 rounded-md shadow-sm text-xs sm:text-sm font-medium text-gray-700 bg-[#F5F7F9] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A4C3C6] disabled:opacity-50"
          disabled={isLoading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="flex-1 py-2 px-2 sm:px-4 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-[#2c3e4a] hover:bg-[#31c46c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#31c46c] disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Enviando...' : 'Enviar Código'}
        </button>
      </div>
    </form>
  );

  const renderCodeStep = () => (
    <form onSubmit={handleCodeSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="code"
          className="block text-xs sm:text-sm font-medium text-gray-700"
        >
          Código de Verificación
        </label>
        <div className="mt-0.5 sm:mt-1">
          <input
            id="code"
            name="code"
            type="text"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="appearance-none block w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#538D97] focus:border-[#2A737D] text-xs sm:text-sm text-center text-lg font-mono tracking-widest"
            placeholder="000000"
            maxLength={6}
            disabled={isLoading}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Ingrese el código de 6 dígitos enviado a {email}
        </p>
      </div>

      <div>
        <label
          htmlFor="newPassword"
          className="block text-xs sm:text-sm font-medium text-gray-700"
        >
          Nueva Contraseña
        </label>
        <div className="mt-0.5 sm:mt-1 relative">
          <input
            id="newPassword"
            name="newPassword"
            type={showPassword ? "text" : "password"}
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="appearance-none block w-full px-2 sm:px-3 py-1.5 sm:py-2 pl-8 pr-8 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#538D97] focus:border-[#2A737D] text-xs sm:text-sm"
            placeholder="Mínimo 6 caracteres"
            minLength={6}
            disabled={isLoading}
          />
          <IconLockPassword className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <IconEyeX className="w-4 h-4" /> : <IconEye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-xs sm:text-sm font-medium text-gray-700"
        >
          Confirmar Contraseña
        </label>
        <div className="mt-0.5 sm:mt-1 relative">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="appearance-none block w-full px-2 sm:px-3 py-1.5 sm:py-2 pl-8 pr-8 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#538D97] focus:border-[#2A737D] text-xs sm:text-sm"
            placeholder="Repita la contraseña"
            minLength={6}
            disabled={isLoading}
          />
          <IconLockPassword className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showConfirmPassword ? <IconEyeX className="w-4 h-4" /> : <IconEye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between space-x-2 sm:space-x-4">
        <button
          type="button"
          onClick={() => setStep('email')}
          className="flex-1 py-2 px-2 sm:px-4 border border-gray-300 rounded-md shadow-sm text-xs sm:text-sm font-medium text-gray-700 bg-[#F5F7F9] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A4C3C6] disabled:opacity-50"
          disabled={isLoading}
        >
          Volver
        </button>
        <button
          type="submit"
          className="flex-1 py-2 px-2 sm:px-4 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-[#2c3e4a] hover:bg-[#31c46c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#31c46c] disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Restableciendo...' : 'Restablecer Contraseña'}
        </button>
      </div>
    </form>
  );

  const renderSuccessStep = () => (
    <div className="text-center space-y-4">
      <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
        <h3 className="font-medium mb-2">¡Contraseña Restablecida!</h3>
        <p className="text-sm">
          Tu contraseña ha sido restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
        </p>
      </div>
      <button
        onClick={onCancel}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#025964] hover:bg-[#2A737D] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#538D97]"
      >
        Volver al inicio de sesión
      </button>
    </div>
  );

  return (
    <div className="w-full max-w-md px-2 sm:px-3">
      <h2 className="font-light text-[#2c3e4a] mb-4 text-sm sm:text-lg">
        {step === 'email' && 'Recuperar Contraseña'}
        {step === 'code' && 'Verificar Código'}
        {step === 'success' && 'Contraseña Restablecida'}
      </h2>
      
      {step === 'email' && (
        <p className="text-[#122056] mb-6 text-xs sm:text-sm">
          Ingrese su correo electrónico y le enviaremos un código para restablecer su contraseña.
        </p>
      )}
      
      {step === 'code' && (
        <p className="text-[#122056] mb-6 text-xs sm:text-sm">
          Ingrese el código de verificación y su nueva contraseña.
        </p>
      )}

      {step === 'email' && renderEmailStep()}
      {step === 'code' && renderCodeStep()}
      {step === 'success' && renderSuccessStep()}
    </div>
  );
};

export default ResetPassword;
