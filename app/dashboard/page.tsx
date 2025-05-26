"use client";

import { useState } from "react";
import Navbar from "@/app/components/dashboard/navbar";
import Footer from "@/app/components/dashboard/footer";
import Content from "@/app/components/dashboard/content";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Fondo base con patrón */}
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
        <Content />
      </div>
      <Footer />
    </div>
  );
}
