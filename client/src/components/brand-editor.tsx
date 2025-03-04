import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertGuidelineSchema, type BrandGuideline } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

interface BrandEditorProps {
  guideline?: BrandGuideline;
  onSave: (data: any) => void;
  isLoading?: boolean;
}

export default function BrandEditor({ guideline, onSave, isLoading }: BrandEditorProps) {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const form = useForm({
    resolver: zodResolver(insertGuidelineSchema),
    defaultValues: {
      name: guideline?.name || "",
      industry: guideline?.industry || "",
      targetAudience: guideline?.targetAudience || { demographics: [], interests: [] },
      preferredPlatforms: guideline?.preferredPlatforms || [],
      coreValues: guideline?.coreValues || [],
      competitors: guideline?.competitors || [],
      useEmojis: guideline?.useEmojis ?? true,
      formalityScale: guideline?.formalityScale || 3,
      voice: guideline?.voice || "",
      tone: guideline?.tone || "",
      style: guideline?.style || "",
      keywords: guideline?.keywords || [],
    },
  });

  const handleNext = async () => {
    const stepFields = {
      1: ["name", "industry", "targetAudience"],
      2: ["preferredPlatforms", "coreValues", "competitors"],
      3: ["useEmojis", "formalityScale"],
      4: ["voice", "tone", "style", "keywords"],
    }[step];

    const isValid = await form.trigger(stepFields);
    if (isValid) {
      setStep(Math.min(step + 1, totalSteps));
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Clique Agency" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Industry/Niche</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="fashion">Fashion</SelectItem>
                        <SelectItem value="food">Food & Beverage</SelectItem>
                        <SelectItem value="health">Health & Wellness</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="entertainment">Entertainment</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="targetAudience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Audience</FormLabel>
                  <FormDescription>
                    Describe your target audience's demographics and interests
                  </FormDescription>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={typeof field.value === 'string' ? field.value : JSON.stringify(field.value, null, 2)}
                      onChange={(e) => {
                        try {
                          field.onChange(JSON.parse(e.target.value));
                        } catch {
                          field.onChange(e.target.value);
                        }
                      }}
                      placeholder="e.g., {'demographics': ['25-34', 'urban', 'professionals'], 'interests': ['technology', 'innovation']}"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      case 2:
        return (
          <>
            <FormField
              control={form.control}
              name="preferredPlatforms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Social Platforms</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      {["twitter", "instagram", "tiktok"].map((platform) => (
                        <div key={platform} className="flex items-center space-x-2">
                          <Switch
                            checked={field.value.includes(platform)}
                            onCheckedChange={(checked) => {
                              const newValue = checked
                                ? [...field.value, platform]
                                : field.value.filter((p: string) => p !== platform);
                              field.onChange(newValue);
                            }}
                          />
                          <span className="capitalize">{platform === "twitter" ? "X (Twitter)" : platform}</span>
                        </div>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="coreValues"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Core Brand Values</FormLabel>
                  <FormDescription>
                    Enter your brand's core values (e.g., innovation, reliability)
                  </FormDescription>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={Array.isArray(field.value) ? field.value.join(", ") : field.value}
                      onChange={(e) => field.onChange(e.target.value.split(",").map(v => v.trim()))}
                      placeholder="Enter values separated by commas"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="competitors"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Competitor Brands/Inspirations</FormLabel>
                  <FormDescription>
                    List competitors or brands that inspire your tone/style
                  </FormDescription>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={Array.isArray(field.value) ? field.value.join(", ") : field.value}
                      onChange={(e) => field.onChange(e.target.value.split(",").map(v => v.trim()))}
                      placeholder="Enter competitors separated by commas"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      case 3:
        return (
          <>
            <FormField
              control={form.control}
              name="useEmojis"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <div>
                      <FormLabel>Emoji Usage</FormLabel>
                      <FormDescription>
                        Should your brand use emojis in social media posts?
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="formalityScale"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Formality Scale</FormLabel>
                  <FormDescription>
                    Adjust the slider to set your brand's tone from casual to corporate
                  </FormDescription>
                  <FormControl>
                    <div className="space-y-4">
                      <Slider
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                        max={5}
                        min={1}
                        step={1}
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Casual</span>
                        <span>Professional</span>
                        <span>Corporate</span>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      case 4:
        return (
          <>
            <FormField
              control={form.control}
              name="voice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand Voice</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe your brand's voice (e.g., professional, friendly, authoritative)"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand Tone</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe your brand's tone (e.g., casual, formal, inspirational)"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="style"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Writing Style</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe your brand's writing style (e.g., concise, storytelling, technical)"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="keywords"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keywords</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={Array.isArray(field.value) ? field.value.join(", ") : field.value}
                      onChange={(e) => field.onChange(e.target.value.split(",").map(v => v.trim()))}
                      placeholder="Enter keywords separated by commas"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {guideline ? "Edit Brand Guidelines" : "Create Brand Guidelines"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
            <div className="space-y-4">
              {renderStep()}
            </div>

            <div className="flex justify-between mt-6">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                >
                  Previous
                </Button>
              )}
              {step < totalSteps ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className={step === 1 ? "w-full" : ""}
                >
                  Next
                </Button>
              ) : (
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Guidelines"}
                </Button>
              )}
            </div>

            <div className="flex justify-center gap-1 mt-4">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2 w-2 rounded-full ${
                    i + 1 === step
                      ? "bg-primary"
                      : i + 1 < step
                      ? "bg-primary/50"
                      : "bg-border"
                  }`}
                />
              ))}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}