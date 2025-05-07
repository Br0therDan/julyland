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
  InventoryCreate,
  InventoryPublic,
  VariantPublic,
  InventoryCreateChangeTypeEnum,
} from "@/client/management";
import { toast } from "sonner";
import { InventoryService, VariantService } from "@/lib/api";
import { handleApiError } from "@/lib/errorHandler";
import { useState } from "react";
import Loading from "@/components/common/Loading";
import { Button } from "@/components/ui/button";
import { Edit, PlusCircle } from "lucide-react";
import { capitalizeFirstLetter } from "@/utils/formatName";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface InventoryFormProps {
  mode?: "add" | "edit";
  variant: VariantPublic;
  inventory?: InventoryPublic;
  onSuccess?: () => void;
}

export default function InventoryForm({
  mode,
  variant,
  inventory,
  onSuccess,
}: InventoryFormProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [variants, setVariants] = useState<VariantPublic[]>([]);

  const methods = useForm<InventoryCreate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues:
      mode === "edit" && inventory
        ? {
            variant_id: inventory.variant._id,
            change_type: inventory.change_type,
            quantity: inventory.quantity,
          }
        : {
            variant_id: variant._id,
            change_type: "in",
            quantity: 0,
          },
  });

  const {
    register,
    control,
    setValue,
    handleSubmit,
    reset,

    formState: { isSubmitting, isDirty },
  } = methods;

  const fetchVariants = async () => {
    try {
      const response = await VariantService.variantListVariants();
      setVariants(response.data);
    } catch (err) {
      handleApiError(err, (message) =>
        toast.error(message.title, { description: message.description })
      );
    }
  };

  useEffect(() => {
    fetchVariants();
  }, []);
  const editInventory = async (data: InventoryCreate) => {
    setLoading(true);
    try {
      if (!inventory) {
        toast.error("인벤토리가 선택되지 않았습니다.");
        return;
      }
      await InventoryService.inventoryUpdateInventory(inventory._id, data);
      toast.success("인벤토리 수정 성공.", {
        description: `${capitalizeFirstLetter(
          inventory?.variant.name
        )} 인벤토리가 수정 되었습니다.`,
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

  const addInventory = async (data: InventoryCreate) => {
    setLoading(true);
    try {
      await InventoryService.inventoryCreateInventory(data);
      reset();
      await VariantService.variantListVariants();
      toast.success("인벤토리 추가.", {
        description: `${capitalizeFirstLetter(
          inventory?.variant.product.name
        )} 의 인벤토리가 추가 되었습니다.`,
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

  const onSubmit: SubmitHandler<InventoryCreate> = (data) => {
    if (mode === "add") {
      return addInventory(data);
    }
    if (mode === "edit") {
      return editInventory(data);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <FormProvider {...methods}>
      <Dialog>
        <DialogTrigger asChild>
          {mode === "add" ? (
            <Button variant="ghost">
              {" "}
              <PlusCircle />
              재고
            </Button>
          ) : (
            <Button variant="ghost">
              <Edit />
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {mode === "add" ? "인벤토리 추가" : "인벤토리 수정"}
            </DialogTitle>
            <DialogDescription>
              {mode === "add"
                ? `${inventory?.variant.product.name}[${variant.name}]의 인벤토리를 수정합니다.`
                : `${inventory?.variant.product.name}[${inventory?.variant.name}]의 인벤토리를 수정합니다.`}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <div className="grid gap-4 py-2">
                <Label htmlFor="category_id">아이템</Label>
                <Controller
                  control={control}
                  name="variant_id"
                  render={({ field: { value } }) => (
                    <Select
                      onValueChange={(value) => {
                        setValue("variant_id", value);
                      }}
                      defaultValue={value ?? undefined}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="제품 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {variants.map((variant) => (
                          <SelectItem
                            key={variant._id}
                            value={variant._id || ""}
                          >
                            {variant.product.name} [{variant.name}{" "}
                            {variant.options?.map(
                              (option) =>
                                `${option.name} : ${option.value} ${option.unit}`
                            )}
                            ]
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="grid gap-4 py-2">
                <Label htmlFor="change_type">유형</Label>
                <Controller
                  control={control}
                  name="change_type"
                  render={({ field: { value } }) => (
                    <Select
                      onValueChange={(value: InventoryCreateChangeTypeEnum) => {
                        setValue("change_type", value);
                      }}
                      defaultValue={value ?? undefined}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="인벤토리 유형선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in">입고</SelectItem>
                        <SelectItem value="adjust">변경</SelectItem>
                        <SelectItem value="out">출고</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="grid gap-4 py-2">
                <Label htmlFor="quantity">수량</Label>
                <Input
                  id="quantity"
                  placeholder="수량을 입력하세요."
                  defaultValue={inventory?.quantity}
                  {...register("quantity", { required: true })}
                />
              </div>
            </div>
            <DialogFooter>
              <MyButton
                type="submit"
                disabled={isSubmitting || !isDirty}
                isLoading={isSubmitting}
              >
                {mode === "add" ? "추가" : "수정"}
              </MyButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </FormProvider>
  );
}
