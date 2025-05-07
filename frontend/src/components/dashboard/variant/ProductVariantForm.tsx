"use client";
import React, { useEffect } from "react";
import {
  FormProvider,
  useForm,
  Controller,
  type SubmitHandler,
} from "react-hook-form";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { MyButton } from "@/components/common/buttons/submit-button"; // Custom ShadCN-based button
import {
  MediaAssetCreate,
  ProductPublic,
  ProductUpdate,
  VariantCreate,
  VariantPublic,
  VariantUpdate,
} from "@/client/management";

import { toast } from "sonner";
import { MediaService, ProductService, VariantService } from "@/lib/api";
import { handleApiError } from "@/lib/errorHandler";
import { useState } from "react";
import Loading from "@/components/common/Loading";

import { Button } from "@/components/ui/button";
import { Edit, PlusCircle, Trash2 } from "lucide-react";
import { capitalizeFirstLetter } from "@/utils/formatName";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VariantFormProps {
  mode?: "add" | "create" | "edit";
  product_id?: string;
  variant?: VariantPublic;
  onSuccess?: () => void;
}

export default function VariantForm({
  mode,
  product_id,
  variant,

  onSuccess,
}: VariantFormProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [products, setProducts] = useState<ProductPublic[]>([]);


  const methods = useForm<VariantUpdate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues:
      mode === "edit" && "create" && variant
        ? { 
            product_id: variant?.product._id,
            name: variant?.name,          
            options: variant?.options || [],
            barcode: variant?.barcode,
            media_assets: variant?.media_assets || [],
            price: variant?.price,
          }
        : {
            product_id: product_id,
            name: "",
            options: variant?.options || [],
            price: 0,
          },
  });

  const {
    register,
    control,
    setValue,
    handleSubmit,
    watch,
    reset,

    formState: { isSubmitting, isDirty },
  } = methods;

  const fetchProducts = async () => {
    try {
      const response = await ProductService.productListProducts();
      setProducts(response.data);
    } catch (err) {
      handleApiError(err, (message) =>
        toast.error(message.title, { description: message.description })
      );
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const editVariant = async (data: VariantUpdate) => {
    setLoading(true);
    try {
      if (!variant) {
        toast.error("제품이 선택되지 않았습니다.");
        return;
      }
      await VariantService.variantUpdateVariant(
        variant._id,
        data
      );
      toast.success("제품변형 성공.", {
        description: `${capitalizeFirstLetter(
          variant?.name
        )} 이 수정 되었습니다.`,
      });
      reset();
      onSuccess?.();
    } catch (err) {
      handleApiError(err, (message) =>
        toast.error(message.title, { description: message.description })
      );
    } finally {
      setLoading(false);
    }
  };

  const addVariant = async (data: VariantCreate) => {
    setLoading(true);
    try {
      await VariantService.variantCreateVariant(data);
      reset();
      await VariantService.variantListVariants()
      toast.success("신규 제품 변형 추가.", {
        description: `${capitalizeFirstLetter(
          variant?.name
        )} 제품 변형이 추가 되었습니다.`,
      });
      reset();
    } catch (err) {
      handleApiError(err, (message) =>
        toast.error(message.title, { description: message.description })
      );
    } finally {
      setLoading(false);
    }
  };

  const options = watch("options");

  const onSubmit: SubmitHandler<VariantUpdate | VariantCreate> = (
    data
  ) => {
    if (mode === "add") {
      return addVariant(data as VariantCreate);
    }
    if (mode === "edit") {
      return editVariant(data as VariantUpdate);
    }
  };
  const handleAddOption = () => {
    setValue("options", [
      ...(options || []),
      { name: "",value: "" },
    ]);
  };

  const handleRemoveOption = (index: number) => {
    const newSubcategories = [...(options || [])];
    newSubcategories.splice(index, 1);
    setValue("options", newSubcategories);
  };

  const handleAddImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      for (const file of Array.from(files)) {
        try {
          const mediaAssetData: MediaAssetCreate = {
            doc_id: variant?._id || "",
            type: file.type,
            file_name: file.name,
            mime_type: file.type,
          };

          const mediaResponse = await MediaService.mediaUploadMedia(
            mediaAssetData
          );
          // 반환받은 URL을 media_assets 배열에 추가
          setValue("media_assets", [...(watch("media_assets") || []), mediaResponse.data.url]);
        } catch (error) {
          console.error("이미지 업로드 실패", error);
          toast.error("이미지 업로드에 실패했습니다.");
        }
      }
    }
  };
  const handleRemoveImage = (index: number) => {
    const updatedImages = [...(watch("media_assets") || [])];
    updatedImages.splice(index, 1);
    setValue("media_assets", updatedImages);
  };


  if (loading) {
    return <Loading />;
  }

  return (
    <FormProvider {...methods}>
      <Dialog>
        <DialogTrigger asChild>
          {mode === "add"  ? (
            <Button variant="ghost">
              <PlusCircle />
              추가{" "}
            </Button>
          ) : ( mode === "create" ? ( 
            <Button variant="default">
              <PlusCircle />
              생성{" "}
            </Button>
          ): (

            <Button variant="ghost">
              <Edit />
              수정{" "}
            </Button>
          )
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {mode === "add" || mode === "create" ? "제품 변형 추가" : "제품 변형 수정"}
            </DialogTitle>
            <DialogDescription>
              {mode === "add" || mode === "create"
                ? "제품 변형을 추가합니다."
                : `제품 변형 "${variant?.name}"을 수정합니다.`}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div className="grid gap-4 py-2">
                <Label htmlFor="category_id">제품</Label>
                <Controller
                  control={control}
                  name="product_id"
                  render={({ field: { value } }) => (
                    <Select
                      onValueChange={(value) => {
                        setValue("product_id", value);
                      }}
                      defaultValue={value ?? undefined}
                      
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="제품 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem
                            key={product._id}
                            value={product._id || ""}
                          >
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="grid gap-4 py-2">
                <Label htmlFor="name" >명칭</Label>
                <Input 
                  id="name"
                  defaultValue={variant?.name} 
                  placeholder='제품 변형 명칭을 입력하세요'
                  {...register("name")} />
              </div>
              {/* Options */}
              <div className="grid gap-2">
                <Label htmlFor="options">옵션</Label>
                {options?.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      {...register(`options.${index}.name`)}
                      placeholder="이름"
                      defaultValue={option.name}
                      type="text"
                    />
                    <Input
                      {...register(`options.${index}.value`)}
                      placeholder="값"
                      defaultValue={option.value as string | number | readonly string[] | undefined}
                      type="text"
                    />
                    <Input
                      {...register(`options.${index}.unit`)}
                      placeholder="단위"
                      defaultValue={option.unit ?? undefined}
                      type="text"
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => handleRemoveOption(index)}
                      className="text-sm"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddOption}
                  className="mt-2 text-sm"
                >
                  <PlusCircle className="h-5 w-5" />
                </Button>
              </div>
              <div className="grid gap-4 py-2">
                <Label htmlFor="price">가격</Label>
                <Input
                  id="price"
                  type="number"
                  defaultValue={variant?.price}
                  {...register("price")}
                />
              </div>

            </div>
            <DialogFooter>
              <MyButton
                type="submit"
                disabled={isSubmitting || !isDirty}
                isLoading={isSubmitting}
              >
                저장
              </MyButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </FormProvider>
  );
}
