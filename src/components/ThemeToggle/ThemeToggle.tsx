import React from "react";
import { useThemeToggleLogic } from "./ThemeToggle.logic";
import { ThemeToggleLayout } from "./ThemeToggle.layout";

export const ThemeToggle: React.FC = () => {
  const logic = useThemeToggleLogic();
  return <ThemeToggleLayout {...logic} />;
};