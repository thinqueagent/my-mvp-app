import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Upload, FileText, Globe, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { BrandGuideline, InsertGuideline } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BrandEditor from "@/components/brand-editor";
import BrandIdentityVisualization from "@/components/brand-identity-visualization";

export default function BrandGuidelines() {
  const [location] = useLocation();
  const { toast } = useToast();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [setupStep, setSetupStep] = useState<
    "initial" | "document" | "website" | "manual" | "validate"
  >("initial");
  const [currentGuidelineData, setCurrentGuidelineData] = useState<Partial<InsertGuideline>>({});

  const { data: guidelines } = useQuery<BrandGuideline[]>({
    queryKey: ["/api/guidelines"],
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await apiRequest("POST", "/api/guidelines/upload", formData);
      return res.json();
    },
    onSuccess: (data) => {
      setCurrentGuidelineData(data);
      setSetupStep("validate");
      queryClient.invalidateQueries({ queryKey: ["/api/guidelines"] });
      toast({
        title: "Success",
        description: "Brand guidelines uploaded and analyzed successfully",
      });
    },
  });

  const websiteAnalysisMutation = useMutation({
    mutationFn: async (url: string) => {
      const res = await apiRequest("POST", "/api/guidelines/analyze-website", {
        url,
      });
      return res.json();
    },
    onSuccess: (data) => {
      setCurrentGuidelineData(data);
      setSetupStep("validate");
      queryClient.invalidateQueries({ queryKey: ["/api/guidelines"] });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      
      // Create FormData and add document type
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", "brand-guidelines");
      
      // Call the modified uploadMutation
      uploadMutationWithDocType.mutate(formData);
    }
  };
  
  // Updated mutation that takes FormData with document type
  const uploadMutationWithDocType = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await apiRequest("POST", "/api/guidelines/upload", formData);
      return res.json();
    },
    onSuccess: (data) => {
      setCurrentGuidelineData(data);
      setSetupStep("validate");
      queryClient.invalidateQueries({ queryKey: ["/api/guidelines"] });
      toast({
        title: "Success",
        description: "Brand guidelines uploaded and analyzed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive"
      });
    }
  });

  const handleWebsiteAnalysis = () => {
    if (websiteUrl) {
      websiteAnalysisMutation.mutate(websiteUrl);
    }
  };

  // Check for the upload action in URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("action") === "upload") {
      setSetupStep("document");
    }
  }, [location]);

  const renderSetupStep = () => {
    switch (setupStep) {
      case "initial":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Create Brand Guidelines</h2>
            <p className="text-muted-foreground">
              Let's set up your brand guidelines. Choose how you'd like to start:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setSetupStep("document")}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Upload Document
                  </CardTitle>
                  <CardDescription>
                    Upload an existing brand guidelines document (PDF, DOC)
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setSetupStep("website")}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Analyze Website
                  </CardTitle>
                  <CardDescription>
                    Extract brand guidelines from your website
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setSetupStep("manual")}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Start Fresh
                  </CardTitle>
                  <CardDescription>
                    Create brand guidelines from scratch
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        );

      case "document":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Upload Brand Document</h2>
            <div className="space-y-4">
              <Input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
              />
              <Button
                onClick={() => setSetupStep("initial")}
                variant="outline"
                className="mr-2"
              >
                Back
              </Button>
            </div>
          </div>
        );

      case "website":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Analyze Website</h2>
            <div className="space-y-4">
              <Input
                type="url"
                placeholder="Enter your website URL"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => setSetupStep("initial")}
                  variant="outline"
                >
                  Back
                </Button>
                <Button
                  onClick={handleWebsiteAnalysis}
                  disabled={!websiteUrl || websiteAnalysisMutation.isPending}
                >
                  Analyze Website
                </Button>
              </div>
            </div>
          </div>
        );

      case "validate":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Validate Brand Profile</h2>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Detected Brand Tone</CardTitle>
                  <CardDescription>
                    Here's what we detected from your {currentGuidelineData.sourceType}:
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium">Primary Tone</h3>
                      <p className="text-muted-foreground">
                        {currentGuidelineData.detectedTone?.primary}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium">Sample Captions</h3>
                      <div className="space-y-2">
                        {currentGuidelineData.sampleCaptions?.map((caption, index) => (
                          <div
                            key={index}
                            className="p-3 rounded-lg bg-muted"
                          >
                            {caption}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <BrandEditor
                guideline={currentGuidelineData as BrandGuideline}
                onSave={(data) => {
                  // Handle saving the validated guidelines
                }}
              />
            </div>
          </div>
        );

      case "manual":
        return (
          <BrandEditor
            onSave={(data) => {
              // Handle saving the manual guidelines
            }}
          />
        );
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Brand Guidelines</h1>
          <Button onClick={() => setSetupStep("initial")}>
            <Plus className="mr-2 h-4 w-4" />
            Create Guidelines
          </Button>
        </div>

        <Dialog open={setupStep !== "initial"} onOpenChange={() => setSetupStep("initial")}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Brand Guidelines Setup</DialogTitle>
            </DialogHeader>
            {renderSetupStep()}
          </DialogContent>
        </Dialog>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {guidelines?.map((guideline) => (
            <div key={guideline.id} className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{guideline.name}</CardTitle>
                  <CardDescription>
                    Created from {guideline.sourceType}
                    {guideline.sourceUrl && ` - ${guideline.sourceUrl}`}
                  </CardDescription>
                </CardHeader>
              </Card>
              <BrandIdentityVisualization guideline={guideline} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}