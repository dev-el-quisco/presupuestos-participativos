"use client";

import { useState } from "react";
import LoginHeader from "@/app/components/login/LoginHeader";
import LoginForm from "@/app/components/login/LoginForm";
import ResetPassword from "@/app/components/login/ResetPassword";
import LoginFooter from "@/app/components/login/LoginFooter";

export default function Home() {
  const [showResetPassword, setShowResetPassword] = useState(false);

  const handleResetPasswordClick = () => {
    setShowResetPassword(true);
  };

  const handleCancelReset = () => {
    setShowResetPassword(false);
  };

  return (
    <div className="h-dvh flex flex-col items-center justify-center p-4">
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

      <div className="w-full max-w-md bg-[#FFFFFF]/90 rounded-xl shadow-lg overflow-hidden backdrop-blur-sm">
        <div className="w-full p-6 sm:p-8 flex flex-col">
          <LoginHeader />

          <div className="flex-grow flex flex-col justify-center my-4">
            <div className="flex items-start justify-center relative">
              <div
                className={`w-full transition-opacity duration-300 ease-in-out ${
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

          <LoginFooter />
        </div>
      </div>
    </div>
  );
}
