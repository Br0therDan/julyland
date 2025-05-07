"use client";
import React, { useEffect } from "react";
import {
  useForm,
  SubmitHandler,
  FormProvider,
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
  DialogOverlay,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/ui/form";
import { MyButton } from "@/components/common/buttons/submit-button";


import { handleApiError } from "@/lib/errorHandler";
import { useState } from "react";
import Loading from "@/components/common/Loading";
import {
  CategoryCreate,
  CategoryPublic,
  CategoryUpdate,
} from "@/client/management";

import SelectForm from "@/components/common/forms/Select";
import { Button } from "@/components/ui/button";
import { Edit, PlusCircle, Trash2 } from "lucide-react";
import { CategoryService } from '@/lib/api';
import { set } from 'date-fns';

interface AddCategoryProps {
  mode: "add" | "edit";
  category?: CategoryPublic;
  isOpen?: boolean;
  onSuccess?: () => void;
}

export default function CategoryForm({
  mode,
  category,
  isOpen,
  onSuccess,
}: AddCategoryProps) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<CategoryPublic[]>([]);
  const methods = useForm<CategoryCreate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues:
      mode === "edit" && category
        ? {
            ...category,
            subcategories:
              category.subcategories?.map((subcategory) => subcategory) || [],
          }
        : {
            name: '',
            subcategories: [],
          },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = methods;

  const subcategories = watch('subcategories')

  const fetchCategories = async () => {
    try {
      const response = await CategoryService.categoryListCategories();
      setCategories(response.data);
    } catch (err) {
      handleApiError(err, (message) =>
        toast.error(message.title, { description: message.description })
      );
    }
  };
  useEffect(() => {
    fetchCategories();
  }, []);

  const addCategory = async (category: CategoryCreate) => {
    setLoading(true);
    try {
      await CategoryService.categoryCreateCategory(category);
      toast.success("카테고리 추가", {
        description: `${category.name} 카테고리 추가 완료`,
      });
      onSuccess?.();
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

  const updateCategory = async (data: CategoryUpdate) => {
    setLoading(true);
    try {
      if (category?._id) {
        await CategoryService.categoryUpdateCategory(category._id, data);
      } else {
        throw new Error("Category ID is undefined.");
      }
      toast.success("카테고리 수정", {
        description: `${data.name} 카테고리 수정 완료`,
      });
      reset();
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

  const onSubmit: SubmitHandler<CategoryCreate | CategoryUpdate> = async (data) => {

    if (mode === "add") {
      await addCategory(data as CategoryCreate);
    } else if (mode === "edit" && category) {
      await updateCategory(data as CategoryUpdate);
    }
  };

  const handleAddSubcategory = () => {
    setValue('subcategories', [...(subcategories || []), ''])
  }

  const handleRemoveSubcategory = (index: number) => {
    const newSubcategories = [...(subcategories || [])]
    newSubcategories.splice(index, 1)
    setValue('subcategories', newSubcategories)
  }

  if (loading) {
    return <Loading />;
  }

  return (
    <FormProvider {...methods}>
      <Dialog open={isOpen} onOpenChange={onSuccess}>
        <DialogTrigger asChild>
          {mode === "add" ? (
            <Button variant="default" className="w-full">
              {" "}
              <PlusCircle />
              카테고리 추가{" "}
            </Button>
          ) : (
            <Button variant="ghost">
              <Edit />
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className='max-w-md '>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle className='text-2xl'>
                새 카테고리 추가
              </DialogTitle>
              <DialogDescription>
                신규 카테고리를 추가하려면 카테고리 이름과 하위 카테고리를 입력하세요.
              </DialogDescription>
            </DialogHeader>

            <div className='grid gap-4 py-4'>
              {/* Category Name */}
              <div className='grid gap-2'>
                <Label htmlFor='name'>
                  카테고리 이름
                </Label>
                <Input
                  id='name'
                  {...register('name', {
                    required: '카테고리 이름은 필수입니다 ',
                  })}
                  placeholder='카테고리 이름을 입력하세요'
                  type='text'
                />
                {errors.name && (
                  <FormMessage>{errors.name.message}</FormMessage>
                )}
              </div>

              {/* Subcategories */}
              <div className='grid gap-2'>
                <Label htmlFor='subcategories'>
                  하위 카테고리
                </Label>
                {subcategories?.map((subcategory, index) => (
                  <div key={index} className='flex items-center gap-2'>
                    <Input
                      {...register(`subcategories.${index}`)}
                      placeholder='하위 카테고리 이름을 입력하세요'
                      type='text'
                      value={subcategory}
                    />
                    <Button
                      type='button'
                      variant={'outline'}
                      onClick={() => handleRemoveSubcategory(index)}
                      className='text-sm'
                    >
                      <Trash2 className='h-5 w-5' />
                    </Button>
                  </div>
                ))}
                <Button
                  type='button'
                  variant={'outline'}
                  onClick={handleAddSubcategory}
                  className='mt-2 text-sm'
                >
                  <PlusCircle className='h-5 w-5' />
                </Button>
              </div>
            </div>

            <DialogFooter className='flex justify-end gap-3 pt-2'>
              <MyButton
                variant='default'
                type='submit'
                isLoading={isSubmitting}
                disabled={!isDirty}
                className='w-full'
              >
                저장
              </MyButton>
            </DialogFooter>
          </form>
          <DialogClose className='absolute top-4 right-4' />
        </DialogContent>
      </Dialog>
    </FormProvider>
  )
}
