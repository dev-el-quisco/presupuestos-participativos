import { IconLogout } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";

interface NavbarProps {
  userName?: string;
  onLogout?: () => void;
}

const Navbar = ({ userName = "Usuario", onLogout = () => {} }: NavbarProps) => {
  return (
    <nav className="bg-white shadow-md w-full py-2 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
        {/* Logo y título */}
        <Link href="/" className="flex items-center space-x-3">
          <Image
            src="/presupuestos-transparente.png"
            alt="Logo Presupuestos Participativos"
            width={75}
            height={75}
            className="object-contain"
          />
          <span className="text-gray-800 font-light text-xl hidden md:block">
            Presupuestos Participativos
          </span>
        </Link>

        {/* Información del usuario y botón de cerrar sesión */}
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-700">
            <span>Bienvenid@, </span>
            <span className="font-medium">{userName}</span>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center space-x-1 bg-[#eceef0] hover:bg-[#ef5e6a] text-[#2c3e4a] px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
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
