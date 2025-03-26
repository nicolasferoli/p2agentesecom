"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// Tipos básicos compatíveis com next-themes
type Attribute = string;
type ThemeProviderProps = {
  children: React.ReactNode;
  attribute?: Attribute | Attribute[];
  defaultTheme?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
  storageKey?: string;
  themes?: string[];
  forcedTheme?: string;
  onValueChange?: (value: string) => void;
};

export function ThemeProvider({ 
  children, 
  ...props 
}: { 
  children: React.ReactNode; 
  [key: string]: any;
}) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
} 