import React from "react";
import { useAddToHomeButtonLogic } from "./AddToHomeButton.logic";
import { AddToHomeButtonLayout } from "./AddToHomeButton.layout";

export const AddToHomeButton: React.FC = () => {
  const logic = useAddToHomeButtonLogic();
  return <AddToHomeButtonLayout {...logic} />;
};
