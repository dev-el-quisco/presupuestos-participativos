"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconGraph } from "@tabler/icons-react";
import { IconTool } from "@tabler/icons-react";
import { IconAbacus } from "@tabler/icons-react";

const Tabselect = () => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname.includes(path);
  };

  const getLinkClasses = (path: string) => {
    return isActive(path)
      ? "bg-[#31c46c] text-[#eceef0] px-2 py-2 rounded-lg transition-all duration-200"
      : "bg-[#eceef0] text-[#2c3e4a] hover:text-[#eceef0] hover:bg-[#31c46c] px-2 py-2 rounded-lg transition-all duration-200";
  };

  return (
    <div className="min-w-full w-full max-w-full bg-[#FFFFFF]/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden p-6 relative">
      {/* Fondo invertido para el content */}

      <div className="flex flex-row justify-center">
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
        <div className="text-white flex flex-row justify-center md:justify-start gap-2 md:gap-4 lg:gap-6">
          <Link
            href={"/dashboard/votaciones"}
            className={getLinkClasses("/dashboard/votaciones")}
          >
            <div className="flex items-center gap-2">
              <IconAbacus size={20} className="hidden md:block" />
              <span>Votaciones</span>
            </div>
          </Link>
          <Link
            href={"/dashboard/estadisticas"}
            className={getLinkClasses("/dashboard/estadisticas")}
          >
            <div className="flex items-center gap-2">
              <IconGraph size={20} className="hidden md:block" />
              <span>Estadisticas</span>
            </div>
          </Link>
          <Link
            href={"/dashboard/panel-administrador"}
            className={getLinkClasses("/dashboard/panel-administrador")}
          >
            <div className="flex items-center gap-2">
              <IconTool size={20} className="hidden md:block" />
              <span className="block md:hidden">Administración</span>
              <span className="hidden md:block">Portal Administrador</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Tabselect;
