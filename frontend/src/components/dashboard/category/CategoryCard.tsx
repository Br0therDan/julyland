"use client";
import React from "react";
import { toast } from "sonner";
import { CategoryService } from "@/lib/api";
import { handleApiError } from "@/lib/errorHandler";
import { CategoryPublic } from "@/client/management";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import CategoryForm from "./CategoryForm";
import DashboardCard from "@/components/common/card/DashboardCard";
import { capitalizeFirstLetter } from '@/utils/formatName';
import { useCategory } from '@/hooks/useCategory';

/**
 * 카테고리 목록과 서브카테고리를 트리 형태로 보여주는 컴포넌트
 */

export default function CategoryCard() {
  const { categories, fetchCategories} = useCategory()

  const handleDeleteClick = async (category: CategoryPublic) => {
    try {
      // await CatService.categoriesDeleteCategory(category._id)
      await CategoryService.categoryDeleteCategory(category._id!);
      fetchCategories();
      toast.success("Category deleted successfully.", {
        description: `Category ${category.name} has been deleted.`,
      });
    } catch (err) {
      handleApiError(err, (message) =>
        toast.error(message.title, { description: message.description })
      );
    }
  };

  return (
    <DashboardCard
      title="카테고리"
      footer={<CategoryForm mode="add" onSuccess={fetchCategories} />}
    >
      <ul className="space-y-3 overflow-y-auto">
        {categories.map((category) => (
          <li key={category._id} className="border-b pb-1 last:border-none">
            {/* 카테고리 항목 */}
            <div className="flex items-center justify-between px-2">
              <div className="">{capitalizeFirstLetter(category.name)}</div>
              <div className="space-x-1">
                <CategoryForm mode="edit" category={category} onSuccess={fetchCategories} />
                <Button
                  variant={"ghost"}
                  onClick={() => handleDeleteClick(category)}
                  className="text-sm text-red-500 hover:underline"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            {/* 서브카테고리 목록 */}
            {category.subcategories ? (
              <ul className="mx-2 space-y-1">
                {category.subcategories.map((subcat) => (
                  <li
                    key={subcat}
                    className="flex px-2 py-1 items-center justify-between text-sm"
                  >
                    <span className="text-blue-800"> 
                      • {subcat}</span>
                    {/* 서브카테고리 수정/삭제 로직 추가 가능 */}
                  </li>
                ))}
              </ul>
            ): null}
          </li>
        ))}
      </ul>
    </DashboardCard>
  );
}
