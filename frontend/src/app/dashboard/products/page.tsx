"use client";
import React from "react";
import PageTitle from "@/components/common/PageTitle";
import { useCategory } from "@/hooks/useCategory";
import { useProduct } from "@/hooks/useProduct";
import CategorySwitcher from "@/components/dashboard/category/CategorySwitcher";
import { ProductSelect } from '@/components/dashboard/product/ProductSelect';
import ProductVariantsTable from '@/components/dashboard/variant/ProductVariantTable';
import { BrandSwitch } from '@/components/dashboard/brand/BrandSwitch';

export default function ProductPage() {
  const { selectedProduct } = useProduct();
  const { currentCategoryName, selectedBrand } = useCategory();

  return (
    <div className="flex flex-col h-full p-2 sm:p-4">
      <PageTitle
        title={`${
          currentCategoryName === "total" ? "전체" : currentCategoryName
        } 제품관리`}
        description={`${selectedBrand?.name === "total" ? "전체" : selectedBrand?.name} 브랜드의 ${
          selectedProduct ? selectedProduct.name : ""
        } 제품을 관리합니다.`}
      />

      <div className="flex flex-col py-4 sm:py-6 gap-3">
        <div className="flex items-center w-full gap-6">
          <CategorySwitcher />
          <BrandSwitch />
          <ProductSelect />
        </div>
        <ProductVariantsTable />
      </div>
    </div>
  );
}
