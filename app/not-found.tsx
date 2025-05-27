import Link from "next/link";

export default function NotFound() {
  return (
    <div className="bg-[#2c3e4a] flex items-center justify-center min-h-screen w-full">
      <div className="text-center px-4 py-10">
        <h1 className="text-7xl md:text-9xl font-extrabold text-[#F5F7F9]">
          404
        </h1>
        <p className="text-xl md:text-2xl text-[#F5F7F9] mt-4">
          ¡Ups! Página no encontrada.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block px-6 py-3 bg-[#eceef0] text-[#6b7fbb] rounded-lg text-lg font-semibold hover:bg-[#6b7fbb] hover:text-[#eceef0] transition-colors"
        >
          Ir al Inicio
        </Link>
      </div>
    </div>
  );
}
