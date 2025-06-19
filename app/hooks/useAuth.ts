"use client";

import { useState, useEffect, useCallback } from "react";
import { UserPayload } from "@/app/lib/auth";

interface AuthState {
  user: UserPayload | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Verificar token al cargar la aplicación
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("auth_token");

      if (!token) {
        setAuthState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        const response = await fetch("/api/auth/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        if (response.ok) {
          const data = await response.json();
          setAuthState({
            user: data.user,
            token,
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          // Token inválido o expirado
          localStorage.removeItem("auth_token");
          setAuthState({
            user: null,
            token: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      } catch (error) {
        console.error("Error verificando autenticación:", error);
        localStorage.removeItem("auth_token");
        setAuthState({
          user: null,
          token: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (usuario: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ usuario, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("auth_token", data.token);
        setAuthState({
          user: data.user,
          token: data.token,
          isLoading: false,
          isAuthenticated: true,
        });
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error("Error en login:", error);
      return { success: false, error: "Error de conexión" };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("auth_token");
    setAuthState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    });
  }, []);

  return {
    ...authState,
    login,
    logout,
  };
};
