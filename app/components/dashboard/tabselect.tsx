// import Link from "next/link";

// const Tabselect = () => {
//   return (
//     <div className="w-full max-w-4xl bg-[#FFFFFF]/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden p-6 relative">
//       {/* Fondo invertido para el content */}
//       <div className="absolute inset-0 bg-white -z-10">
//         <div
//           className="absolute inset-0 w-full h-full"
//           style={{
//             backgroundImage: `repeating-linear-gradient(45deg, #2c3e4a 0, #2c3e4a 2px, transparent 2px, transparent 10px)`,
//             backgroundSize: "14px 14px",
//             opacity: "0.05",
//           }}
//         ></div>
//       </div>

//       <div className="flex flex-row justify-center space-x-5">
//         <Link href={"/dashboard/votaciones"}>Votaciones</Link>
//         <Link href={"/dashboard/estadisticas"}>Estadisticas</Link>
//         <Link href={"/dashboard/panel-administrador"}>Panel Administrador</Link>
//       </div>
//     </div>
//   );
// };

// export default Tabselect;

import Link from "next/link";

const Tabselect = () => {
  return (
    <div className="w-full max-w-4xl bg-[#FFFFFF]/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden p-6 relative">
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
        <div className="text-white flex flex-row justify-center items-center">
          <Link
            href={"/dashboard/votaciones"}
            className="hover:bg-[#31c46c] px-4 py-2 rounded-lg transition-all duration-200"
          >
            Votaciones
          </Link>
          <Link
            href={"/dashboard/estadisticas"}
            className="hover:bg-[#31c46c] px-4 py-2 rounded-lg transition-all duration-200"
          >
            Estadisticas
          </Link>
          <Link
            href={"/dashboard/panel-administrador"}
            className="hover:bg-[#31c46c] px-4 py-2 rounded-lg transition-all duration-200"
          >
            Panel Administrador
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Tabselect;
