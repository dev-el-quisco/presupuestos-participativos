"use client";

import { useState } from "react";
import LoginForm from "./components/login/LoginForm";
import ResetPassword from "./components/login/ResetPassword";
import LoginHeader from "./components/login/LoginHeader";
import LoginFooter from "./components/login/LoginFooter";

export default function Home() {
  const [showResetPassword, setShowResetPassword] = useState(false);

  const handleResetPasswordClick = () => {
    setShowResetPassword(true);
  };

  const handleCancelReset = () => {
    setShowResetPassword(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-md flex flex-col bg-[#F5F7F9] rounded-xl shadow-lg overflow-hidden p-1 sm:p-2">
        <div className="w-full p-2 sm:p-4 md:p-6 flex flex-col h-auto space-y-2 sm:space-y-4">
          <LoginHeader />

          <div className="absolute inset-0 -z-10">
            <div className="relative h-full w-full [&>div]:absolute [&>div]:inset-0 [&>div]:bg-[radial-gradient(circle_at_center,#FF7112,transparent)] [&>div]:opacity-30 [&>div]:mix-blend-multiply">
              <div></div>
            </div>
          </div>

          <div className="min-h-screen w-full p-0 sm:p-2 md:p-4 relative z-20">
            {/* Contenedor principal existente */}
          </div>
          <div
            className={`absolute w-full transition-opacity duration-300 ease-in-out ${
              showResetPassword
                ? "opacity-0 pointer-events-none"
                : "opacity-100"
            }`}
          >
            <LoginForm onResetPasswordClick={handleResetPasswordClick} />
          </div>
          <div
            className={`absolute w-full transition-opacity duration-300 ease-in-out ${
              showResetPassword
                ? "opacity-100"
                : "opacity-0 pointer-events-none"
            }`}
          >
            <ResetPassword onCancel={handleCancelReset} />
          </div>
        </div>
      </div>
    </div>
  );
}
