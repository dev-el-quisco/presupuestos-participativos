import React, { ReactNode } from "react";
import Navbar from "@/app/components/dashboard/navbar";
import Footer from "@/app/components/dashboard/footer";
import Tabselect from "@/app/components/dashboard/tabselect";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="h-full w-full fixed inset-0 -z-10 bg-[#2c3e4a]">
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, #4f4f4f 0, #4f4f4f 2px, transparent 2px, transparent 10px)`,
            backgroundSize: "14px 14px",
            opacity: "0.15",
          }}
        ></div>
      </div>
      <Navbar />
      <div className="flex-grow flex justify-center items-center p-4">
        <div className="w-full max-w-4xl bg-[#FFFFFF]/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden p-6 relative">
          {/* Fondo invertido para el content */}
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
          <Tabselect />
          {children}
        </div>
      </div>
      <Footer />
    </div>
  );
}
