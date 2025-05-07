"use client";
import React from "react";
import {
  useForm,
  SubmitHandler,
  FormProvider,
  Controller,
  // Controller,
} from "react-hook-form";

import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/ui/form";
import { MyButton } from "@/components/common/buttons/submit-button";

import { BrandService } from "@/lib/api";
import { handleApiError } from "@/lib/errorHandler";
import { useState } from "react";
import Loading from "@/components/common/Loading";
import { BrandCreate, BrandPublic, BrandUpdate } from "@/client/management";

import { Button } from "@/components/ui/button";
import { Edit, PlusCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategory } from "@/hooks/useCategory";

interface AddBrandProps {
  mode: "add" | "edit";
  brand?: BrandPublic;
  isOpen?: boolean;
  onSuccess?: () => void;
}

export default function BrandForm({
  mode,
  brand,
  isOpen,
  onSuccess,
}: AddBrandProps) {
  const [loading, setLoading] = useState(false);
  const { categories, selectedCategory, fetchBrands } = useCategory();

  const methods = useForm<BrandCreate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues:
      mode === "edit" && brand
        ? {
            name: brand.name,
            logo_url: brand.logo_url,
            description: brand.description,
            category_id: brand.category._id,
          }
        : {
            name: "",
            logo_url: "",
            description: "",
            category_id: selectedCategory?._id,
          },
  });

  const {
    register,
    handleSubmit,
    // control,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = methods;

  const addBrand = async (brand: BrandCreate) => {
    setLoading(true);
    try {
      await BrandService.brandCreateBrand(brand);
      toast.success("브랜드 추가", {
        description: `${brand.name} 브랜드 추가 완료`,
      });
      onSuccess?.();
      fetchBrands(selectedCategory?.name);
      reset();
    } catch (err) {
      handleApiError(err, (message) =>
        toast.error(message.title, { description: message.description })
      );
    } finally {
      setLoading(false);
      isOpen = false;
    }
  };

  const updateBrand = async (data: BrandUpdate) => {
    setLoading(true);
    try {
      if (brand?._id) {
        await BrandService.brandUpdateBrand(brand._id, data);
      } else {
        throw new Error("Brand ID is undefined.");
      }
      toast.success("브랜드 수정", {
        description: `${data.name} 브랜드 수정 완료`,
      });
      reset();
      fetchBrands();
      onSuccess?.();
    } catch (err) {
      handleApiError(err, (message) =>
        toast.error(message.title, { description: message.description })
      );
    } finally {
      setLoading(false);
      isOpen = false;
    }
  };

  const onSubmit: SubmitHandler<BrandCreate | BrandUpdate> = async (data) => {
    if (mode === "add") {
      await addBrand(data as BrandCreate);
    } else if (mode === "edit" && brand) {
      await updateBrand(data as BrandUpdate);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <FormProvider {...methods}>
      <Dialog open={isOpen}>
        <DialogTrigger asChild>
          {mode === "add" ? (
            <Button variant="default" className="w-full">
              {" "}
              <PlusCircle />
              브랜드 추가{" "}
            </Button>
          ) : (
            <Button variant="ghost">
              <Edit /> 브랜드 수정
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="max-w-md ">
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle className="text-2xl">
                {mode === "add" ? "신규 브랜드 추가" : "브랜드 수정"}
              </DialogTitle>
              <DialogDescription>
                {mode === "add"
                  ? "신규 브랜드를 추가합니다."
                  : `브랜드 ${brand?.name}을 수정합니다.`}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* Category */}
              <div className="grid gap-2">
                <Label htmlFor="category_id">카테고리</Label>
                <Controller
                  name="category_id"
                  control={methods.control}
                  render={({ field: { onChange, value } }) => (
                    <Select
                      onValueChange={(value) => {
                        onChange(value);
                      }}
                      defaultValue={value}
                    >
                      <SelectTrigger className="w-full capitalize">
                        <SelectValue
                          placeholder={`카테고리 선택`}
                          className="capitalize"
                        />
                      </SelectTrigger>
                      <SelectContent className="w-full p-1 capitalize">
                        {categories.map((category) => (
                          <SelectItem
                            key={category._id}
                            value={category._id}
                            className="text-sm"
                          >
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="grid gap-4 py-4">
              {/* Brand Name */}
              <div className="grid gap-2">
                <Label htmlFor="name">브랜드 이름</Label>
                <Input
                  id="name"
                  {...register("name", {
                    required: "브랜드 이름은 필수입니다 ",
                  })}
                  placeholder="브랜드 이름을 입력하세요"
                  type="text"
                />
                {errors.name && (
                  <FormMessage>{errors.name.message}</FormMessage>
                )}
              </div>
            </div>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="logo_url">브랜드 로고 URL</Label>
                <Input
                  id="logo_url"
                  {...register("logo_url")}
                  placeholder="브랜드 로고 URL을 입력하세요"
                  type="text"
                />
                {errors.logo_url && (
                  <FormMessage>{errors.logo_url.message}</FormMessage>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="description">브랜드 설명</Label>
                <Input
                  id="description"
                  {...register("description")}
                  placeholder="브랜드 설명을 입력하세요"
                  type="text"
                />
              </div>
              {errors.description && (
                <FormMessage>{errors.description.message}</FormMessage>
              )}
            </div>

            <DialogFooter className="flex justify-end gap-3 pt-2">
              <MyButton
                variant="default"
                type="submit"
                isLoading={isSubmitting}
                disabled={!isDirty}
                className="w-full"
              >
                저장
              </MyButton>
            </DialogFooter>
          </form>
          <DialogClose className="absolute top-4 right-4" />
        </DialogContent>
      </Dialog>
    </FormProvider>
  );
}
