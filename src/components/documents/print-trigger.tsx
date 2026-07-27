"use client";

import { useEffect } from "react";

/**
 * Automatically opens the browser print dialog (Save as PDF) on load.
 */
export function PrintTrigger() {
  useEffect(() => {
    const t = setTimeout(() => window.print(), 400);
    return () => clearTimeout(t);
  }, []);
  return null;
}
