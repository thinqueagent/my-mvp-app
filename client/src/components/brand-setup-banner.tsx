import { AlertTriangle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

export default function BrandSetupBanner() {
  return (
    <Alert className="bg-primary/5 border-primary/20">
      <AlertTriangle className="h-5 w-5 text-primary" />
      <AlertTitle className="text-primary">Set Up Your Brand</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>You haven't set up your brand yet! Do it now for better AI-generated content.</span>
        <Link href="/brand-setup">
          <Button variant="default" size="sm">
            Set Up Now
          </Button>
        </Link>
      </AlertDescription>
    </Alert>
  );
}
