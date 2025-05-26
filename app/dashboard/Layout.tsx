import React, { ReactNode } from "react";
import Navbar from "@/app/components/dashboard/navbar";
import Footer from "@/app/components/dashboard/footer";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow flex justify-center items-center p-4">
        {children}
      </div>
      <Footer />
    </div>
  );
}
