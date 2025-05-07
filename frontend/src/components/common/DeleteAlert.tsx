"use client";
import { useForm } from "react-hook-form";
import * as React from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { MyButton } from "@/components/common/buttons/submit-button";
import { handleApiError } from "@/lib/errorHandler";
import { AlertDialogCancel } from "@radix-ui/react-alert-dialog";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";
interface DeleteProps {
  id: string;
  title: string;
  description: string;
  deleteApi: (id: string) => Promise<void>;
  onClose: () => void;
}

export default function Delete({
  id,
  title,
  description,
  onClose,
  deleteApi,
}: DeleteProps) {
  const cancelRef = React.useRef<HTMLButtonElement | null>(null);
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useForm();

  // 타입별로 삭제 처리 로직

  const deleteEntityHandler = async (id: string) => {
    try {
      await deleteApi(id);
      onClose();
    } catch (err) {
      handleApiError(err, (message) =>
        toast.error(message.title, { description: message.description })
      );
    }
  };

  const onSubmit = () => {
    deleteEntityHandler(id);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" className="p-2" aria-label="Actions">
          <Trash2 />{title} 삭제
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <AlertDialogHeader>
            <AlertDialogTitle>{title} 삭제</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground mt-2">
              <span>
                {description}
                <strong> 이 작업은 취소할 수 없습니다 </strong>
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="space-x-2">
            <MyButton
              variant="destructive"
              type="submit"
              isLoading={isSubmitting}
            >
              삭제
            </MyButton>
            <AlertDialogCancel>
              <MyButton
                ref={cancelRef}
                onClick={onClose}
                disabled={isSubmitting}
                variant="outline"
                type="button"
              >
                취소
              </MyButton>
            </AlertDialogCancel>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
