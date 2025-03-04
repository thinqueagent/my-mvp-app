import { useState, useEffect } from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface ImagePreviewProps {
  file: File;
  platform: "twitter" | "instagram" | "linkedin" | "pinterest";
}

export default function ImagePreview({ file, platform }: ImagePreviewProps) {
  const [preview, setPreview] = useState<string>();

  useEffect(() => {
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    return () => {
      reader.abort();
    };
  }, [file]);

  if (!preview) return null;

  return (
    <div className="mt-4 rounded-lg overflow-hidden border bg-muted">
      <div className="aspect-video">
        <img
          src={preview}
          alt="Content preview"
          className="object-contain w-full h-full"
        />
      </div>
      <div className="p-2 text-xs text-muted-foreground">
        Preview for {platform.charAt(0).toUpperCase() + platform.slice(1)}
      </div>
    </div>
  );
}