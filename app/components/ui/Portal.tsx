"use client";

import { ReactNode, useEffect, useState } from "react";
import ReactDOM from "react-dom";

interface PortalProps {
  children: ReactNode;
}

export default function Portal({ children }: PortalProps) {
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Crear elemento contenedor si no existe
    let element = document.getElementById("portal-root");
    if (!element) {
      element = document.createElement("div");
      element.id = "portal-root";
      document.body.appendChild(element);
    }
    setPortalElement(element);

    return () => {
      // Limpiar solo si somos los últimos en usar el portal
      if (element && element.childElementCount === 0) {
        document.body.removeChild(element);
      }
    };
  }, []);

  if (!portalElement) return null;
  return ReactDOM.createPortal(children, portalElement);
}
