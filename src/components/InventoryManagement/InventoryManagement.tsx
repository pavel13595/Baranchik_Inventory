import React, { forwardRef } from "react";
import { useInventoryManagementLogic } from "./InventoryManagement.logic";
import { InventoryManagementLayout } from "./InventoryManagement.layout";

export const InventoryManagement = forwardRef((props: any, ref) => {
  const logic = useInventoryManagementLogic(props, ref);
  return <InventoryManagementLayout {...logic} ref={ref} />;
});

InventoryManagement.displayName = "InventoryManagement";