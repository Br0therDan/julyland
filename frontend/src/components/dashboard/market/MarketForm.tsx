"use client";
import React from "react";
import {
  useForm,
  SubmitHandler,
  FormProvider,
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
import { handleApiError } from "@/lib/errorHandler";
import { useState } from "react";
import Loading from "@/components/common/Loading";
import {
  MarketPlaceCreate,
  MarketPlacePublic,
  MarketPlaceUpdate,
} from "@/client/management";
import { Button } from "@/components/ui/button";
import { Edit, PlusCircle } from "lucide-react";
import { MarketService } from '@/lib/api';

interface AddMarketProps {
  mode: "add" | "edit";
  market?: MarketPlacePublic;
  isOpen?: boolean;
  onSuccess?: () => void;
}

export default function MarketForm({
  mode,
  market,
  isOpen,
  onSuccess,
}: AddMarketProps) {
  const [loading, setLoading] = useState(false);
  const methods = useForm<MarketPlaceCreate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues:
      mode === "edit" && market
        ? {
            ...market,
          }
        : {
            name: '',
            description: '',
          },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = methods;

  const addMarket = async (market: MarketPlaceCreate) => {
    setLoading(true);
    try {
      await MarketService.marketCreateMarket(market);
      toast.success("마켓플레이스 추가", {
        description: `${market.name} 마켓플레이스 추가 완료`,
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

  const updateMarket = async (data: MarketPlaceUpdate) => {
    setLoading(true);
    try {
      if (market?._id) {
        await MarketService.marketUpdateMarket(market._id, data);
      } else {
        throw new Error("Market ID is undefined.");
      }
      toast.success("마켓플레이스 수정", {
        description: `${data.name} 마켓플레이스 수정 완료`,
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

  const onSubmit: SubmitHandler<MarketPlaceCreate | MarketPlaceUpdate> = async (data) => {

    if (mode === "add") {
      await addMarket(data as MarketPlaceCreate);
    } else if (mode === "edit" && market) {
      await updateMarket(data as MarketPlaceUpdate);
    }
  };



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
              마켓플레이스 추가{" "}
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
                새 마켓플레이스 추가
              </DialogTitle>
              <DialogDescription>
                신규 마켓플레이스를 추가하려면 마켓플레이스 이름과 하위 마켓플레이스를 입력하세요.
              </DialogDescription>
            </DialogHeader>

            <div className='grid gap-4 py-4'>
              {/* Market Name */}
              <div className='grid gap-2'>
                <Label htmlFor='name'>
                  마켓플레이스 이름
                </Label>
                <Input
                  id='name'
                  {...register('name', {
                    required: '마켓플레이스 이름은 필수입니다 ',
                  })}
                  placeholder='마켓플레이스 이름을 입력하세요'
                  type='text'
                />
                {errors.name && (
                  <FormMessage>{errors.name.message}</FormMessage>
                )}
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
