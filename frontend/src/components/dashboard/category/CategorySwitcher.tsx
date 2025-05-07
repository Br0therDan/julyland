"use client";

import { Button } from "@/components/ui/button";
import { useCategory } from "@/hooks/useCategory";
import React from "react";

export default function CategorySwitcher() {
  const { categories, currentCategoryName, setCurrentCategoryName } = useCategory();

  return (
    <div className="bg-gray-100 dark:bg-gray-800 flex flex-1 gap-2 p-1 rounded-md">
      <Button
        className="flex-1 font-bold"
        variant={currentCategoryName === "total" ? "default" : "secondary"}
        onClick={() => setCurrentCategoryName("total")}
      >
        전체
      </Button>
      {categories.map((c) => (
        <Button
          key={c._id}
          className="flex-1 font-bold capitalize"
          variant={c.name === currentCategoryName ? "default" : "secondary"}
          onClick={() => setCurrentCategoryName(c.name)}
        >
          {c.name}
        </Button>
      ))}
    </div>
  );
}
