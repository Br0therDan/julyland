// src/components/product/ProductForm.tsx
"use client";

import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MyButton } from "@/components/common/buttons/submit-button";
import { ProductService } from "@/lib/api";
import { toast } from "sonner";
import { handleApiError } from "@/lib/errorHandler";
import { capitalizeFirstLetter } from "@/utils/formatName";
import {
  ProductCreate,
  ProductPublic,
  ProductUpdate,
} from "@/client/management";

import LocaleNameFields from "./LocaleNameFields";
import MyInput from "@/components/common/forms/MyInput";
import FileUpload from "@/components/common/forms/FileUpload";
import MyTextArea from "@/components/common/forms/MyTextArea";
import MySelect from "@/components/common/forms/MySelect";
import { useCategory } from "@/hooks/useCategory";
import { useProduct } from '@/hooks/useProduct';

interface ProductFormProps {
  mode: "add" | "edit";
  product?: ProductPublic;
  onSuccess?: () => void;
}

export default function ProductForm({
  mode,
  product,
  onSuccess,
}: ProductFormProps) {
  const {
    categories,
    brands,
    setSelectedCategory,
    setSelectedBrand,
    selectedCategory,
    selectedBrand,
  } = useCategory();

  const { fetchProductList } = useProduct();

  const methods = useForm<ProductUpdate | ProductCreate>({
    mode: "onBlur",
    defaultValues: {
      name: product?.name || "",
      locale_names: product?.locale_names || [],
      description: product?.description || "",
      category_id: product?.brand.category._id || selectedCategory?._id || "",
      brand_id:
        product?.brand._id || selectedBrand?._id || "",
      media_urls: product?.media_urls || [],
    },
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty },
  } = methods;

  const onSubmit = async (data: ProductUpdate | ProductCreate) => {
    try {
      if (mode === "edit" && product) {
        await ProductService.productUpdateProduct(
          product._id,
          data as ProductUpdate
        );
        toast.success("제품 수정 성공", {
          description: `${capitalizeFirstLetter(
            product.name
          )} 제품이 수정되었습니다.`,
        });
      } else {
        await ProductService.productCreateProduct(
          data as ProductCreate
        );
        toast.success("신규 제품 추가 완료");
        reset();
        onSuccess?.();
      }
    } catch (err) {
      handleApiError(err, (m) =>
        toast.error(m.title, { description: m.description })
      );
    } finally {
      fetchProductList();
    }
  };

  return (
    <FormProvider {...methods}>
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant={mode === "edit" ? "ghost" : "default"}
            className={mode !== "edit" ? "w-full" : ""}
          >
            {mode === "edit" ? "제품 수정" : "제품 추가"}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>
              {mode === "edit" ? "제품 수정" : "제품 추가"}
            </DialogTitle>
            <DialogDescription>
              {mode === "edit"
                ? `제품 \"${product?.name}\"을 수정합니다.`
                : "신규 제품을 추가합니다."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-3">
            <div className="flex w-full items-center gap-2">
              <MySelect
                name="category_id"
                label="카테고리"
                placeholder="카테고리 선택"
                items={categories.map((c) => ({
                  label: c.name,
                  value: c._id,
                }))}
                onValueChange={(val) =>
                  setSelectedCategory(
                    categories.find((c) => c._id === val)!
                  )
                }
              />
              <MySelect
                name="brand_id"
                label="브랜드"
                placeholder="브랜드 선택"
                items={brands.map((b) => ({ label: b.name, value: b._id }))}
                onValueChange={(val) =>
                  setSelectedBrand(
                    brands.find((b) => b._id === val)!
                  )
                }
              />
            </div>

            <MyInput title="제품명" registerName="name" />

            <LocaleNameFields />

            <FileUpload name="media_urls" accept="image/*" maxFiles={5} />

            <MyTextArea title="제품 설명" registerName="description" />

            <DialogFooter>
              <MyButton
                type="submit"
                isLoading={isSubmitting}
                disabled={!isDirty || isSubmitting}
              >
                {mode === "edit" ? "수정" : "추가"}
              </MyButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </FormProvider>
  );
}
