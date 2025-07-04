import type { Metadata } from "next";
import "./globals.css";
import ToasterClient from "@/app/components/ToasterClient";
import { YearProvider } from "@/app/context/YearContext";
import { AuthProvider } from "@/app/context/AuthContext";

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
    <html lang="en">
      <body>
        <AuthProvider>
          <YearProvider>
            {children}
            <ToasterClient />
          </YearProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
