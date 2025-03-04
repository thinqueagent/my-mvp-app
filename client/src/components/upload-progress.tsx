import { useState, useEffect } from "react";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export interface UploadProgressProps {
  status: "uploading" | "processing" | "analyzing" | "complete" | "error";
  fileName: string;
  progress?: number;
}

export default function UploadProgress({ status, fileName, progress = 0 }: UploadProgressProps) {
  const [progressValue, setProgressValue] = useState(0);

  useEffect(() => {
    if (status === "uploading") {
      setProgressValue(progress);
    } else if (status === "processing") {
      setProgressValue(65);
    } else if (status === "analyzing") {
      setProgressValue(85);
    } else if (status === "complete") {
      setProgressValue(100);
    }
  }, [status, progress]);

  return (
    <div className="space-y-2 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {status === "complete" ? (
            <CheckCircle className="h-5 w-5 text-primary animate-fade-in" />
          ) : status === "error" ? (
            <XCircle className="h-5 w-5 text-destructive animate-fade-in" />
          ) : (
            <Loader2 className="h-5 w-5 animate-spin" />
          )}
          <span className="font-medium">{fileName}</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {status === "uploading" && "Uploading..."}
          {status === "processing" && "Processing document..."}
          {status === "analyzing" && "Analyzing brand identity..."}
          {status === "complete" && "Analysis complete!"}
          {status === "error" && "Upload failed"}
        </span>
      </div>
      <Progress value={progressValue} className="h-2" />
      {status === "processing" && (
        <p className="text-sm text-muted-foreground">
          Extracting brand guidelines and analyzing tone...
        </p>
      )}
      {status === "analyzing" && (
        <p className="text-sm text-muted-foreground">
          Generating brand profile and sample content...
        </p>
      )}
    </div>
  );
}
