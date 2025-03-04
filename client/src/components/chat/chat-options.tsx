import { Button } from "@/components/ui/button";
import { FileText, Globe, Sparkles, ArrowRight } from "lucide-react";

interface ChatOption {
  icon: React.ReactNode;
  label: string;
  description: string;
  action: () => void;
}

interface ChatOptionsProps {
  options: ChatOption[];
}

export default function ChatOptions({ options }: ChatOptionsProps) {
  return (
    <div className="space-y-2 p-4">
      {options.map((option, index) => (
        <Button
          key={index}
          variant="outline"
          className="w-full justify-start gap-3 h-auto p-4"
          onClick={option.action}
        >
          <div className="flex-shrink-0">{option.icon}</div>
          <div className="text-left">
            <div className="font-medium">{option.label}</div>
            <div className="text-sm text-muted-foreground">{option.description}</div>
          </div>
        </Button>
      ))}
    </div>
  );
}
