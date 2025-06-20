"use client";
import { IconLogout } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";

interface NavbarProps {
  userName?: string;
  onLogout?: () => void;
}

const Navbar = ({ userName, onLogout }: NavbarProps) => {
  const router = useRouter();
  const { user, logout } = useAuth();

  // Usar el nombre del usuario desde el JWT, o el prop userName como fallback
  const displayName = user?.nombre || userName || "Usuario";

  const handleLogout = () => {
    // Llamar al logout del hook para limpiar el JWT
    logout();

    // Llamar al onLogout prop si existe
    if (onLogout) {
      onLogout();
    }

    // Redirigir al login
    router.push("/");
  };

  return (
    <nav className="w-full py-2 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
        {/* Logo y título */}
        <Link href="/" className="flex items-center space-x-3">
          <div className="bg-[#FFFFFF]/90 backdrop-blur-sm rounded-xl shadow-lg p-1.5 relative overflow-hidden">
            {/* Fondo con rayas diagonales solo para el logo */}
            <div className="absolute inset-0 bg-white -z-10">
              <div
                className="absolute inset-0 w-full h-full"
                style={{
                  backgroundImage: `repeating-linear-gradient(45deg, #2c3e4a 0, #2c3e4a 2px, transparent 2px, transparent 10px)`,
                  backgroundSize: "14px 14px",
                  opacity: "0.05",
                }}
              ></div>
            </div>
            <Image
              src="/presupuestos-transparente.png"
              alt="Logo Presupuestos Participativos"
              width={65}
              height={65}
              className="object-contain w-[60px] h-[60px]"
            />
          </div>
          <span className="text-white font-light text-xl hidden md:block">
            Presupuestos Participativos
          </span>
        </Link>

        {/* Información del usuario y botón de cerrar sesión */}
        <div className="flex items-center space-x-4">
          <div className="text-sm text-white flex flex-col lg:flex-row items-start justify-center lg:items-center">
            <span>
              Hola, <span className="font-medium">{displayName}</span>
            </span>

            {user?.rol && (
              <span className="text-xs text-gray-300 lg:ml-2">
                ({user.rol})
              </span>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-1 bg-[#eceef0] hover:bg-[#ef5e6a] text-[#2c3e4a] hover:text-[#eceef0] px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
          >
            <span className="hidden sm:block">Cerrar sesión</span>
            <IconLogout size={20} stroke={1.5} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
