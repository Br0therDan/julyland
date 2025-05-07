// src/components/product/ProductNameInput.tsx
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MyIputProps {
  title: string;
  registerName: string;
  className?: string; 
}

export default function MyInput( { title, registerName, className}: MyIputProps) {
  const { register } = useFormContext();

  return (
    <div className="space-y-2">
      <Label className='capitalize'>{title}</Label>
      <Input className={className} {...register(`${registerName}`)} placeholder={`${title}을 입력하세요`} />
    </div>
  );
}