import { ReactNode } from "react";
import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  type: "ai" | "user";
  children: ReactNode;
}

export default function ChatMessage({ type, children }: ChatMessageProps) {
  return (
    <div className={`flex gap-4 p-4 ${type === "ai" ? "bg-muted/50" : ""}`}>
      <div className="flex-shrink-0">
        {type === "ai" ? (
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="h-5 w-5 text-primary" />
          </div>
        ) : (
          <div className="h-8 w-8 rounded-full bg-secondary/10 flex items-center justify-center">
            <User className="h-5 w-5 text-secondary" />
          </div>
        )}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}
