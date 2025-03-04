import { useState } from "react";
import { useLocation } from "wouter";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, ArrowRight } from "lucide-react";

interface QuickStartChecklistProps {
  hasGuidelines: boolean;
  hasContent: boolean;
}

export default function QuickStartChecklist({
  hasGuidelines,
  hasContent,
}: QuickStartChecklistProps) {
  const [, navigate] = useLocation();
  const [showGuidelinesPrompt, setShowGuidelinesPrompt] = useState(!hasGuidelines);
  const [showContentPrompt, setShowContentPrompt] = useState(hasGuidelines && !hasContent);

  const handleSetupGuidelines = () => {
    navigate("/brand-guidelines");
    setShowGuidelinesPrompt(false);
  };

  const handleCreateContent = () => {
    navigate("/ai-assistant");
    setShowContentPrompt(false);
  };

  if (!hasGuidelines) {
    return (
      <AlertDialog open={showGuidelinesPrompt} onOpenChange={setShowGuidelinesPrompt}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Welcome to Your Dashboard!</AlertDialogTitle>
            <AlertDialogDescription>
              We noticed you don't have brand guidelines yet. Setting them up will help
              our AI create better, more consistent content for your brand.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowGuidelinesPrompt(false)}>
              Remind Me Later
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleSetupGuidelines}>
              Set Up Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  if (!hasContent) {
    return (
      <>
        <Card className="border-dashed border-2 bg-muted/50">
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <Sparkles className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold">Ready to Create Your First Post?</h3>
                <p className="text-muted-foreground">
                  Let AI generate your first post based on your brand guidelines.
                </p>
              </div>
            </div>
            <Button onClick={handleCreateContent}>
              Generate AI Post
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <AlertDialog open={showContentPrompt} onOpenChange={setShowContentPrompt}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Create Your First Post</AlertDialogTitle>
              <AlertDialogDescription>
                Great! Your brand guidelines are set up. Would you like to create
                your first AI-generated post now?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowContentPrompt(false)}>
                Maybe Later
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleCreateContent}>
                Create Post
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  return null;
}
