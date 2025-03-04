import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Bot,
  Send,
  Sparkles,
  MessageSquare,
  RefreshCw,
  Clock,
  Lightbulb,
  Calendar
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Message {
  role: "assistant" | "user" | "system";
  content: string;
  timestamp: Date;
}

interface Suggestion {
  title: string;
  description: string;
  icon: React.ElementType;
  prompt: string;
  systemMessage: string;
}

const suggestions: Suggestion[] = [
  {
    title: "Generate Content Ideas",
    description: "Get AI-powered content suggestions based on your brand guidelines",
    icon: Lightbulb,
    prompt: "I need fresh content ideas for my social media posts. Consider trending topics and engagement patterns.",
    systemMessage: "Switching to content ideation mode. I'll help you generate creative and engaging content ideas."
  },
  {
    title: "Write Engaging Captions",
    description: "Create platform-optimized captions for your posts",
    icon: MessageSquare,
    prompt: "Help me write engaging captions that are optimized for social media engagement.",
    systemMessage: "Entering caption writing mode. I'll help you craft compelling captions that drive engagement."
  },
  {
    title: "Schedule Posts",
    description: "Get recommendations for optimal posting times",
    icon: Calendar,
    prompt: "What are the best times to post my content for maximum engagement?",
    systemMessage: "Analyzing optimal posting schedules. I'll provide data-driven recommendations for your content."
  },
  {
    title: "Content Analysis",
    description: "Analyze your content performance and get improvement suggestions",
    icon: Sparkles,
    prompt: "Analyze my recent posts and suggest improvements for better engagement.",
    systemMessage: "Starting content analysis. I'll review your content and provide actionable improvement suggestions."
  }
];

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your AI assistant. I can help you create, optimize, and schedule your social media content. What would you like to do?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", "/api/content/generate", {
        prompt: content,
        type: "caption"
      });
      return res.json();
    },
    onSuccess: (data) => {
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: data.content,
          timestamp: new Date()
        }
      ]);
    }
  });

  const handleSuggestionClick = (suggestion: Suggestion) => {
    // Add system message to indicate mode change
    setMessages(prev => [
      ...prev,
      {
        role: "system",
        content: suggestion.systemMessage,
        timestamp: new Date()
      }
    ]);

    // Add user message with the suggestion's prompt
    setMessages(prev => [
      ...prev,
      {
        role: "user",
        content: suggestion.prompt,
        timestamp: new Date()
      }
    ]);

    // Send the prompt to get AI response
    sendMessage.mutate(suggestion.prompt);
  };

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages(prev => [
      ...prev,
      {
        role: "user",
        content: input,
        timestamp: new Date()
      }
    ]);

    sendMessage.mutate(input);
    setInput("");
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Bot className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">AI Assistant</h1>
            <p className="text-muted-foreground">Your intelligent content creation partner</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle>Chat with AI</CardTitle>
                <CardDescription>Ask questions or get help with content creation</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ScrollArea className="flex-1 pr-4">
                  <div className="space-y-4">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex gap-3 ${
                          message.role === "system" 
                            ? "justify-center" 
                            : message.role === "assistant" 
                              ? "flex-row" 
                              : "flex-row-reverse"
                        }`}
                      >
                        {message.role !== "system" && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {message.role === "assistant" ? "AI" : "You"}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`rounded-lg p-3 ${
                            message.role === "system"
                              ? "bg-muted/50 text-center text-sm text-muted-foreground max-w-md mx-auto"
                              : message.role === "assistant"
                                ? "bg-muted max-w-[80%]"
                                : "bg-primary text-primary-foreground ml-auto max-w-[80%]"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <span className="text-xs opacity-70 mt-1 block">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="flex gap-2 mt-4 pt-4 border-t">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  />
                  <Button onClick={handleSend} disabled={sendMessage.isPending}>
                    {sendMessage.isPending ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {suggestions.map((suggestion, index) => (
              <Card 
                key={index} 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <suggestion.icon className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{suggestion.title}</CardTitle>
                  </div>
                  <CardDescription>{suggestion.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}