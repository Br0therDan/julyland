import React from "react";
import Header from "../layout/Header";
import CategorySwitcher from "./category/CategorySwitcher";
import { CategoryProvider } from "@/contexts/CategoryContext";
import ThemeToggle from '../common/buttons/theme-toggle';
import UserButton from '../common/buttons/UserButton';

export default function DashboardHeader() {
  return (
      <Header className="flex items-center  p-0">     
        <CategorySwitcher />
        <ThemeToggle />
        <UserButton />   
      </Header>
  );
}
