import type { Metadata } from "next";
import "./globals.css";
import ToasterClient from "@/app/components/ToasterClient";

export const metadata: Metadata = {
  title: "Presupuestos Participativos | El Quisco",
  description:
    "Página web para la gestión, conteo, y obtención de métricas de los votos realizados por los ciudadanos de la comuna El Quisco en el proceso de presupuestos participativos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full m-0 p-0 bg-gray-50">
        <div className="relative min-h-screen w-full">
          {/* Eliminar el div del fondo */}
          <div className="relative z-10 h-full w-full overflow-auto">
            {children}
          </div>
          <ToasterClient />
        </div>
      </body>
    </html>
  );
}
