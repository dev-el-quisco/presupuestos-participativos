"use client";

import { useState } from "react";
import Navbar from "@/app/components/dashboard/navbar";
import Footer from "@/app/components/dashboard/footer";
import Content from "@/app/components/dashboard/content";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Navbar />
      <Content />
      <Footer />
    </div>
  );
}
