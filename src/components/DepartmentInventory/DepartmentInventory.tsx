import React, { forwardRef } from "react";
import { useDepartmentInventoryLogic } from "./DepartmentInventory.logic";
import { DepartmentInventoryLayout } from "./DepartmentInventory.layout";

export const DepartmentInventory = forwardRef((props: any, ref) => {
  const logic = useDepartmentInventoryLogic(props);
  return <DepartmentInventoryLayout {...props} {...logic} ref={ref} />;
});

DepartmentInventory.displayName = "DepartmentInventory";
