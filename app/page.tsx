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
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="h-full w-full absolute inset-0 -z-10 bg-white">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
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
