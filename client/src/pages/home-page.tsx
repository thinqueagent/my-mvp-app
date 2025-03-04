import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, Plus, ArrowRight } from "lucide-react";
import type { BrandGuideline } from "@shared/schema";

export default function HomePage() {
  const [, navigate] = useLocation();
  const { data: guidelines } = useQuery<BrandGuideline[]>({
    queryKey: ["/api/guidelines"],
  });

  const stats = {
    brandGuidelines: guidelines?.length || 0,
    connectedAccounts: 0,
    scheduledPosts: 0,
  };

  const handleBrandSetup = () => {
    navigate("/brand-guidelines");
  };

  const handleUploadGuidelines = () => {
    navigate("/brand-guidelines?action=upload");
  };

  const handleExplorePlatform = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Welcome to Thinque Agent!
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Your AI-powered social media partner, here to create and manage on-brand content effortlessly.
        </p>
        <p className="text-base text-muted-foreground mb-12">
          Let's get your brand set up so we can start creating posts and automating your social media.
        </p>

        <div className="flex flex-col items-center gap-4">
          <Button
            size="lg"
            className="w-full max-w-sm"
            onClick={handleBrandSetup}
          >
            <Plus className="mr-2 h-5 w-5" />
            Start Brand Setup
          </Button>

          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={handleUploadGuidelines}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Guidelines
            </Button>
            <Button
              variant="outline"
              onClick={handleExplorePlatform}
            >
              Explore Platform
            </Button>
          </div>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.brandGuidelines}</div>
              <p className="text-sm text-muted-foreground">Brand Guidelines</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.connectedAccounts}</div>
              <p className="text-sm text-muted-foreground">Connected Accounts</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.scheduledPosts}</div>
              <p className="text-sm text-muted-foreground">Scheduled Posts</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-left">
          <h2 className="text-lg font-semibold mb-4">Next Steps</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <ArrowRight className="h-4 w-4" />
              <span>Set up your brand guidelines</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <ArrowRight className="h-4 w-4" />
              <span>Connect your social media accounts</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <ArrowRight className="h-4 w-4" />
              <span>Create your first AI-powered post</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}