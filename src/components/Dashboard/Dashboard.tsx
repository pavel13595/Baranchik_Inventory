import React from "react";
import styles from "./Dashboard.module.css";
import { DashboardLogic } from "./Dashboard.logic";
import { DashboardLayout } from "./Dashboard.layout";

export const Dashboard: React.FC = () => {
  const logic = DashboardLogic();
  return <DashboardLayout {...logic} styles={styles} />;
};