import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import SidebarNav from "@/components/sidebar-nav";
import ContentPreview from "@/components/content-preview";
import ImagePreview from "@/components/image-preview";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Content, BrandGuideline, InsertContent } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CalendarIcon, ImageIcon, Plus, Upload, Loader2, MessageSquarePlus, Layout, Clock, Hash, Sparkles, RefreshCw } from "lucide-react";

export default function ContentManager() {
  const { toast } = useToast();
  const [selectedGuidelineId, setSelectedGuidelineId] = useState<string>();
  const [prompt, setPrompt] = useState("");
  const [platform, setPlatform] = useState<"twitter" | "instagram" | "linkedin" | "pinterest">("twitter");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("12:00");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<{
    caption?: string;
    hashtags?: string[];
    optimizedVersion?: string;
  }>({});
  const [selectedContent, setSelectedContent] = useState("");
  const [step, setStep] = useState<"create" | "preview" | "schedule">("create");

  const { data: guidelines = [] } = useQuery<BrandGuideline[]>({
    queryKey: ["/api/guidelines"],
  });

  const { data: content } = useQuery<Content[]>({
    queryKey: ["/api/content"],
  });

  const generateCaption = useMutation({
    mutationFn: async () => {
      if (!prompt) {
        throw new Error("Please enter a content prompt");
      }
      const res = await apiRequest("POST", "/api/content/generate", {
        guidelineId: selectedGuidelineId ? parseInt(selectedGuidelineId) : undefined,
        prompt,
        platform,
        type: "caption",
        objective: prompt // Using prompt as objective
      });
      return res.json();
    },
    onError: (error) => {
      toast({
        title: "Generation failed",
        description: error.message,
        variant: "destructive",
      });
    },
    onSuccess: (data) => {
      setGeneratedContent(prev => ({ ...prev, caption: data.content }));
      setSelectedContent(data.content);
    },
  });

  const generateHashtags = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/content/generate", {
        guidelineId: selectedGuidelineId ? parseInt(selectedGuidelineId) : undefined,
        prompt,
        platform,
        type: "hashtags"
      });
      return res.json();
    },
    onSuccess: (data) => {
      setGeneratedContent(prev => ({ ...prev, hashtags: data.hashtags }));
    },
  });

  const optimizeEngagement = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/content/generate", {
        guidelineId: selectedGuidelineId ? parseInt(selectedGuidelineId) : undefined,
        content: selectedContent,
        platform,
        type: "optimize"
      });
      return res.json();
    },
    onSuccess: (data) => {
      setGeneratedContent(prev => ({ ...prev, optimizedVersion: data.content }));
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertContent) => {
      if (selectedImage) {
        const formData = new FormData();
        formData.append('file', selectedImage);
        formData.append('content', JSON.stringify(data));
        return await apiRequest("POST", "/api/content/with-media", formData);
      }
      const res = await apiRequest("POST", "/api/content", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/content"] });
      resetForm();
      toast({
        title: "Success",
        description: "Content created successfully",
      });
    },
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
  };

  const resetForm = () => {
    setSelectedGuidelineId(undefined);
    setPrompt("");
    setPlatform("twitter");
    setSelectedDate(undefined);
    setSelectedTime("12:00");
    setSelectedImage(null);
    setShowCreateDialog(false);
    setShowScheduler(false);
    setGeneratedContent({});
    setSelectedContent("");
    setStep("create");
  };

  const handleCreate = () => {
    if (!selectedContent) {
      toast({
        title: "Error",
        description: "Please generate or enter content first",
        variant: "destructive",
      });
      return;
    }

    let scheduledFor;
    if (selectedDate) {
      const [hours, minutes] = selectedTime.split(":");
      const date = new Date(selectedDate);
      date.setHours(parseInt(hours), parseInt(minutes));
      scheduledFor = date.toISOString();
    }

    createMutation.mutate({
      guidelineId: selectedGuidelineId ? parseInt(selectedGuidelineId) : undefined,
      content: selectedContent,
      platform,
      status: scheduledFor ? "scheduled" : "pending",
      scheduledFor,
    });
  };

  const pendingContent = content?.filter((c) => c.status === "pending") || [];
  const approvedContent = content?.filter((c) => c.status === "approved") || [];
  const postedContent = content?.filter((c) => c.status === "posted") || [];
  const draftContent = content?.filter((c) => c.status === "draft") || [];

  const contentByDate = content?.reduce((acc, item) => {
    if (item.scheduledFor) {
      const date = format(new Date(item.scheduledFor), 'yyyy-MM-dd');
      if (!acc[date]) acc[date] = [];
      acc[date].push(item);
    }
    return acc;
  }, {} as Record<string, Content[]>);

  return (
    <div className="flex min-h-screen">
      <SidebarNav />
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Content Manager</h1>
            <Button size="lg" onClick={() => setShowCreateDialog(true)}>
              <MessageSquarePlus className="mr-2 h-5 w-5" />
              Create New Post
            </Button>
          </div>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {step === "create" ? "Create New Post" :
                    step === "preview" ? "Preview Post" :
                      "Schedule Post"}
                </DialogTitle>
              </DialogHeader>

              {step === "create" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Platform</label>
                      <Select
                        value={platform}
                        onValueChange={(value: "twitter" | "instagram" | "linkedin" | "pinterest") => setPlatform(value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="twitter">X (Twitter)</SelectItem>
                          <SelectItem value="instagram">Instagram</SelectItem>
                          <SelectItem value="linkedin">LinkedIn</SelectItem>
                          <SelectItem value="pinterest">Pinterest</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Brand Guidelines (Optional)</label>
                      <Select
                        value={selectedGuidelineId}
                        onValueChange={setSelectedGuidelineId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select guidelines (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {guidelines.map((g) => (
                            <SelectItem key={g.id} value={g.id.toString()}>
                              {g.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Content Prompt</label>
                    <div className="space-y-4">
                      <Textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe what kind of content you want to generate..."
                        className="mb-2"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => generateCaption.mutate()}
                          disabled={!prompt || generateCaption.isPending}
                        >
                          {generateCaption.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <MessageSquarePlus className="mr-2 h-4 w-4" />
                              Generate Caption
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {generatedContent.caption && (
                      <div className="mt-4 space-y-4">
                        <div className="p-4 bg-muted rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <label className="text-sm font-medium">Generated Caption</label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => generateCaption.mutate()}
                              disabled={generateCaption.isPending}
                            >
                              <RefreshCw className="h-4 w-4 mr-1" />
                              Regenerate
                            </Button>
                          </div>
                          <Textarea
                            value={selectedContent}
                            onChange={(e) => setSelectedContent(e.target.value)}
                            className="mb-2"
                          />
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => optimizeEngagement.mutate()}
                              disabled={optimizeEngagement.isPending}
                            >
                              <Sparkles className="h-4 w-4 mr-1" />
                              Optimize
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => generateHashtags.mutate()}
                              disabled={generateHashtags.isPending}
                            >
                              <Hash className="h-4 w-4 mr-1" />
                              Add Hashtags
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {generatedContent.hashtags && (
                      <div className="p-4 bg-muted rounded-lg mt-4">
                        <label className="text-sm font-medium mb-2 block">Suggested Hashtags</label>
                        <div className="flex flex-wrap gap-2">
                          {generatedContent.hashtags.map((tag, index) => (
                            <Button
                              key={index}
                              variant="secondary"
                              size="sm"
                              onClick={() => setSelectedContent(prev => `${prev} ${tag}`)}
                            >
                              {tag}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {generatedContent.optimizedVersion && (
                      <div className="p-4 bg-muted rounded-lg mt-4">
                        <label className="text-sm font-medium mb-2 block">Optimized Version</label>
                        <p className="text-sm mb-2">{generatedContent.optimizedVersion}</p>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setSelectedContent(generatedContent.optimizedVersion!)}
                        >
                          Use This Version
                        </Button>
                      </div>
                    )}

                    {selectedImage ? (
                      <div className="space-y-4">
                        <ImagePreview file={selectedImage} platform={platform} />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleRemoveImage}
                          className="mt-2"
                        >
                          <ImageIcon className="mr-2 h-4 w-4" />
                          Remove Image
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2 mt-4">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <label
                          htmlFor="image-upload"
                          className="cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
                        >
                          <ImageIcon className="mr-2 h-4 w-4" />
                          Add Image
                        </label>
                      </div>
                    )}
                    <div className="flex gap-2 mt-4">
                      <Button
                        onClick={() => setStep("preview")}
                        disabled={!selectedContent}
                      >
                        Preview Post
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {step === "preview" && (
                <div className="space-y-4">
                  <ContentPreview
                    content={{
                      id: 0,
                      content: selectedContent,
                      platform,
                      status: "draft",
                      mediaUrl: selectedImage ? URL.createObjectURL(selectedImage) : undefined,
                    }}
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setStep("create")}>
                      Edit
                    </Button>
                    <Button onClick={() => setStep("schedule")}>
                      Continue to Scheduling
                    </Button>
                  </div>
                </div>
              )}

              {step === "schedule" && (
                <div className="space-y-4">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                  />
                  <div>
                    <label className="text-sm font-medium mb-2 block">Time</label>
                    <Input
                      type="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setStep("preview")}>
                      Back to Preview
                    </Button>
                    <Button onClick={handleCreate}>
                      {selectedDate ? 'Schedule Post' : 'Publish Now'}
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <Tabs defaultValue="pending" className="w-full">
            <TabsList>
              <TabsTrigger value="pending">
                Pending ({pendingContent.length})
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved ({approvedContent.length})
              </TabsTrigger>
              <TabsTrigger value="posted">
                Posted ({postedContent.length})
              </TabsTrigger>
              <TabsTrigger value="calendar">
                Calendar View
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {pendingContent.map((item) => (
                  <ContentPreview
                    key={item.id}
                    content={item}
                    onApprove={() => approveMutation.mutate(item.id)}
                    onRegenerate={() => regenerateMutation.mutate(item.id)}
                    isLoading={approveMutation.isPending || regenerateMutation.isPending}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="approved" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {approvedContent.map((item) => (
                  <ContentPreview key={item.id} content={item} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="posted" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {postedContent.map((item) => (
                  <ContentPreview key={item.id} content={item} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="calendar" className="mt-6">
              <div className="space-y-8">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                  modifiers={{
                    hasContent: (date) => {
                      const dateStr = format(date, 'yyyy-MM-dd');
                      return !!contentByDate?.[dateStr];
                    }
                  }}
                  modifiersStyles={{
                    hasContent: { backgroundColor: 'var(--primary)', color: 'white' }
                  }}
                />
                {selectedDate && contentByDate?.[format(selectedDate, 'yyyy-MM-dd')] && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {contentByDate[format(selectedDate, 'yyyy-MM-dd')].map((item) => (
                      <ContentPreview key={item.id} content={item} />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

const Card = ({ children }: { children: React.ReactNode }) => (
  <div className="border border-gray-200 rounded-lg shadow-sm">
    {children}
  </div>
);