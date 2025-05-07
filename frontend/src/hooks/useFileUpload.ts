import { useState } from "react";
import { MediaAssetCreate } from "@/client/management";
import { MediaService } from "@/lib/api";
import axios from "axios";
import { toast } from "sonner";

interface PendingFile {
  file: File;
  preview: string;
}

export default function useFileUploader() {
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [progresses, setProgresses] = useState<Record<string, number>>({});
  const [failedFiles, setFailedFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement> | { target: { files: FileList | null } }) => {
    const files = Array.from(e.target.files || []);
    const withPreviews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setPendingFiles((prev) => [...prev, ...withPreviews]);
  };

  const upload = async (file: File): Promise<string> => {
    const mediaData: MediaAssetCreate = {
      type: file.type,
      file_name: file.name,
      mime_type: file.type,
    };

    const presignRes = await MediaService.mediaUploadMedia(mediaData);
    const presignedUrl: string = presignRes.data.url;

    const publicHost = process.env.NEXT_PUBLIC_S3_ENDPOINT!;
    const browserUrl = presignedUrl.replace(/^https?:\/\/[^/]+/, publicHost);

    await axios.put(browserUrl, file, {
      headers: { "Content-Type": file.type },
      onUploadProgress: (e) => {
        const pct = Math.round((e.loaded * 100) / (e.total || 1));
        setProgresses((prev) => ({ ...prev, [file.name]: pct }));
      },
    });

    return browserUrl.split("?")[0]; // Remove query string
  };

  const removePendingFile = (index: number) => {
    setPendingFiles((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const retryFailedUpload = async (onSuccess?: (url: string) => void) => {
    const retrying = [...failedFiles];
    setFailedFiles([]);
    for (const file of retrying) {
      try {
        const url = await upload(file);
        toast.success(`${file.name} 재업로드 완료`);
        if (onSuccess) onSuccess(url);
      } catch {
        setFailedFiles((prev) => [...prev, file]);
        toast.error(`${file.name} 재업로드 실패`);
      }
    }
  };

  return {
    pendingFiles,
    progresses,
    failedFiles,
    handleFileChange,
    upload,
    removePendingFile,
    retryFailedUpload,
  };
}
