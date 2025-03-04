import { Loader2 } from "lucide-react";

export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 text-muted-foreground p-4">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span className="text-sm">AI is thinking...</span>
    </div>
  );
}
