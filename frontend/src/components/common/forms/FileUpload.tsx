// src/components/common/forms/FileUpload.tsx
import React, { useRef, useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import useFileUploader from "@/hooks/useFileUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, X, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface FileUploadProps {
  /** 폼 필드 이름 (e.g. "media_urls") */
  name: string;
  /** 최대 업로드 가능한 파일 개수 */
  maxFiles?: number;
  /** 허용할 파일 타입 (e.g. "image/*") */
  accept?: string;
}

export default function FileUpload({
  name,
  maxFiles = Infinity,
  accept = "image/*",
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { control, setValue } = useFormContext();
  const values: string[] = useWatch({ control, name }) || [];

  const {
    upload,
    pendingFiles,
    handleFileChange,
    removePendingFile,
    progresses,
    failedFiles,
    retryFailedUpload,
  } = useFileUploader();

  // 파일 선택 시 maxFiles 체크 후 pendingFiles에 추가
  const onFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (values.length + files.length > maxFiles) {
      toast.error(`최대 ${maxFiles}개까지 업로드할 수 있습니다.`);
      return;
    }
    handleFileChange(e);
  };

  // pendingFiles가 추가될 때마다 순차 업로드 수행
  useEffect(() => {
    if (pendingFiles.length === 0) return;

    const uploadAll = async () => {
      for (const { file } of pendingFiles) {
        try {
          const url = await upload(file);
          setValue(name, [...values, url], { shouldDirty: true });
        } catch {
          toast.error(`${file.name} 업로드에 실패했습니다.`);
        } finally {
          // 업로드 시도 후 해당 파일은 대기 목록에서 제거
          removePendingFile(pendingFiles.findIndex(p => p.file === file));
        }
      }
    };

    uploadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingFiles]);

  const handleRemove = (index: number) => {
    setValue(name, values.filter((_, i) => i !== index), { shouldDirty: true });
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 mb-2">
        {/* 이미 업로드된 파일들 */}
        {values.map((url, i) => (
          <div key={i} className="relative w-24 h-24">
            <img
              src={url}
              alt={`file-${i}`}
              className="w-full h-full object-cover rounded"
            />
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="absolute top-1 right-1"
              onClick={() => handleRemove(i)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}

        {/* 현재 업로드 중인 파일들 */}
        {pendingFiles.map(({ file, preview }, i) => (
          <div
            key={file.name}
            className="relative w-24 h-24 border rounded overflow-hidden"
          >
            <img
              src={preview}
              alt="preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${progresses[file.name] || 0}%` }}
              />
            </div>
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="absolute top-1 right-1 w-4 h-4"
              onClick={() => removePendingFile(i)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* 실패한 파일 업로드가 있을 때 재시도 */}
      {failedFiles.length > 0 && (
        <div className="text-sm text-red-500 flex items-center gap-2">
          일부 파일 업로드에 실패했습니다.
          <Button variant="link" onClick={() => retryFailedUpload}>
            <RotateCcw className="w-4 h-4 mr-1" /> 재시도
          </Button>
        </div>
      )}

      {/* 드래그 앤 드롭 / 파일 선택 영역 */}
      <div
        className="border-2 border-dashed border-gray-400 rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-100"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) =>
          handleFileChange({ target: { files: e.dataTransfer.files } } as any)
        }
      >
        <UploadCloud className="w-8 h-8 mb-2 text-gray-500" />
        <p className="text-sm text-gray-600">
          파일을 드래그하거나 클릭해서 업로드하세요
        </p>
        <Input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple
          className="hidden"
          onChange={onFilesSelected}
        />
      </div>
    </div>
  );
}
