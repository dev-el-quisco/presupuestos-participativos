import React, { ReactNode } from "react";
import Navbar from "@/app/components/dashboard/navbar";
import Footer from "@/app/components/dashboard/footer";
import Tabselect from "@/app/components/dashboard/tabselect";
import DashboardYearDetector from "@/app/components/dashboard/DashboardYearDetector";
import ProtectedRoute from "@/app/components/auth/ProtectedRoute";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <ProtectedRoute>
      <div className="min-h-dvh flex flex-col">
        <DashboardYearDetector />
        <div className="h-dvh w-full fixed inset-0 -z-10 bg-[#2c3e4a]">
          <div
            className="absolute inset-0 w-dvh h-full"
            style={{
              backgroundImage: `repeating-linear-gradient(45deg, #4f4f4f 0, #4f4f4f 2px, transparent 2px, transparent 10px)`,
              backgroundSize: "14px 14px",
              opacity: "0.15",
            }}
          ></div>
        </div>
        <Navbar />
        <div className="flex-grow flex justify-center items-start p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-7xl bg-[#FFFFFF]/90 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden p-1 relative flex flex-col items-center">
            <div className="absolute inset-0 bg-white -z-10 rounded-xl">
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
    </ProtectedRoute>
  );
}
