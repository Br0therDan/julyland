// src/components/product/ProductNameInput.tsx
import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Textarea } from '@/components/ui/textarea';

interface MyIputProps {
  title: string;
  registerName: string;
  className?: string;
}

export default function MyTextArea( { title, registerName, className }: MyIputProps) {
  const { register } = useFormContext();

  return (
    <div className="space-y-2">
      <Label className='flex capitalize w-full'>{title}</Label>
      <Textarea className={className} {...register(`${registerName}`)} placeholder={`${title}을 입력하세요`} />
    </div>
  );
}