import React from "react";
import { useBurgerMenuLogic } from "./BurgerMenu.logic";
import { BurgerMenuLayout } from "./BurgerMenu.layout";

export const BurgerMenu: React.FC<any> = (props) => {
  const logic = useBurgerMenuLogic(props);
  return <BurgerMenuLayout {...props} {...logic} />;
};
