import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface Message {
  role: "assistant" | "user";
  content: string;
  options?: string[];
  multiSelect?: boolean;
  selected?: string[];
  showCustomInput?: boolean;
}

interface ChatAssistantProps {
  onAnswer: (key: string, value: any) => void;
  isComplete: boolean;
}

export default function ChatAssistant({ onAnswer, isComplete }: ChatAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const questions = [
    {
      key: "name",
      question: "Hi! Let's get started by learning a bit about your brand. What is your brand name?",
    },
    {
      key: "industry",
      question: "What industry best describes your brand?",
      options: [
        "Technology",
        "Fashion",
        "Food & Beverage",
        "Health & Wellness",
        "Finance",
        "Education",
        "Entertainment",
        "Other"
      ],
    },
    {
      key: "targetAudience",
      question: "Select your target audience demographics (you can select multiple)",
      options: [
        "Young Adults (18-24)",
        "Professionals (25-34)",
        "Mid-Career (35-44)",
        "Senior Professionals (45+)",
        "Students",
        "Parents",
        "Urban",
        "Suburban"
      ],
      multiSelect: true,
      defaultValue: { demographics: [], interests: [] },
    },
    {
      key: "preferredPlatforms",
      question: "Which social media platforms would you like to focus on? (Select all that apply)",
      options: ["X (Twitter)", "Instagram", "TikTok"],
      multiSelect: true,
    },
    {
      key: "coreValues",
      question: "Select your brand's core values (you can select multiple)",
      options: [
        "Innovation",
        "Reliability",
        "Authenticity",
        "Sustainability",
        "Quality",
        "Creativity",
        "Leadership",
        "Community",
        "Custom"
      ],
      multiSelect: true,
    },
    {
      key: "useEmojis",
      question: "Would you like to use emojis in your posts?",
      options: ["Yes", "No"],
    },
    {
      key: "formalityScale",
      question: "How formal should your brand's tone be?",
      options: [
        "1 - Very Casual",
        "2 - Casual",
        "3 - Professional",
        "4 - Formal",
        "5 - Very Formal"
      ],
    },
    {
      key: "voice",
      question: "How would you describe your brand's voice?",
      options: [
        "Friendly & Approachable",
        "Professional & Authoritative",
        "Innovative & Bold",
        "Traditional & Reliable",
        "Playful & Energetic",
        "Educational & Informative",
        "Custom"
      ],
    },
    {
      key: "tone",
      question: "What's your brand's preferred tone?",
      options: [
        "Casual & Conversational",
        "Professional & Polished",
        "Inspirational & Motivating",
        "Technical & Precise",
        "Fun & Engaging",
        "Serious & Direct",
        "Custom"
      ],
    },
    {
      key: "style",
      question: "What's your preferred writing style?",
      options: [
        "Concise & Direct",
        "Storytelling & Narrative",
        "Technical & Detailed",
        "Conversational & Informal",
        "Professional & Structured",
        "Creative & Expressive",
        "Custom"
      ],
    },
    {
      key: "keywords",
      question: "Select key terms that align with your brand (you can select multiple)",
      options: [
        "Innovation",
        "Quality",
        "Experience",
        "Trust",
        "Growth",
        "Success",
        "Community",
        "Excellence",
        "Custom"
      ],
      multiSelect: true,
    },
  ];

  useEffect(() => {
    if (messages.length === 0 && !isComplete) {
      setMessages([
        {
          role: "assistant",
          content: "Welcome to Thinque Agent – Your AI-Powered Social Media Manager.",
        },
        {
          role: "assistant",
          content: questions[0].question,
          options: questions[0].options,
          multiSelect: questions[0].multiSelect,
        },
      ]);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleOptionSelect = (option: string) => {
    if (option === "Custom") {
      setShowCustomInput(true);
      return;
    }

    if (selectedOptions.includes(option)) {
      setSelectedOptions(prev => prev.filter(o => o !== option));
    } else {
      setSelectedOptions(prev => [...prev, option]);
    }
  };

  const processAnswer = (currentQuestion: any, input: string, isMultiSelect = false) => {
    let value = input;

    if (currentQuestion.key === "targetAudience") {
      value = { demographics: selectedOptions, interests: [] };
    } else if (currentQuestion.key === "useEmojis") {
      value = input.toLowerCase() === "yes";
    } else if (currentQuestion.key === "formalityScale") {
      value = parseInt(input.charAt(0));
    } else if (currentQuestion.key === "preferredPlatforms") {
      value = selectedOptions.map(p => {
        if (p.toLowerCase().includes("twitter")) return "twitter";
        if (p.toLowerCase().includes("tiktok")) return "tiktok";
        return p.toLowerCase();
      });
    } else if (isMultiSelect || currentQuestion.multiSelect) {
      value = showCustomInput && currentInput.trim() 
        ? [...selectedOptions, currentInput.trim()]
        : selectedOptions;
    }

    return value;
  };

  const handleSubmit = (input: string) => {
    if (!input.trim()) return;

    const currentQuestion = questions[currentStep];
    const value = processAnswer(currentQuestion, input);

    const newMessages = [
      ...messages,
      { role: "user", content: input }
    ];

    if (currentStep < questions.length - 1) {
      const nextQuestion = questions[currentStep + 1];
      newMessages.push({
        role: "assistant",
        content: nextQuestion.question,
        options: nextQuestion.options,
        multiSelect: nextQuestion.multiSelect,
      });
    } else {
      newMessages.push({
        role: "assistant",
        content: "Great! I've captured all your brand preferences. Creating your brand guidelines now...",
      });
    }

    setMessages(newMessages);
    setCurrentInput("");
    onAnswer(currentQuestion.key, value);
    setCurrentStep(prev => prev + 1);
    setSelectedOptions([]);
    setShowCustomInput(false);
  };

  const handleDoneMultiSelect = () => {
    if (selectedOptions.length > 0 || (showCustomInput && currentInput.trim())) {
      const currentQuestion = questions[currentStep];
      const value = processAnswer(currentQuestion, currentInput, true);

      const newMessages = [...messages];
      newMessages.push({
        role: "user",
        content: `Selected: ${Array.isArray(value) ? value.join(", ") : value}`
      });

      if (currentStep < questions.length - 1) {
        const nextQuestion = questions[currentStep + 1];
        newMessages.push({
          role: "assistant",
          content: nextQuestion.question,
          options: nextQuestion.options,
          multiSelect: nextQuestion.multiSelect,
        });
      } else {
        newMessages.push({
          role: "assistant",
          content: "Great! I've captured all your brand preferences. Creating your brand guidelines now...",
        });
      }

      setMessages(newMessages);
      onAnswer(currentQuestion.key, value);
      setCurrentStep(prev => prev + 1);
      setSelectedOptions([]);
      setShowCustomInput(false);
      setCurrentInput("");
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === "assistant"
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              <p>{message.content}</p>
              {message.options && (
                <div className="mt-2 space-x-2 flex flex-wrap gap-2">
                  {message.options.map((option) => (
                    <Button
                      key={option}
                      variant={message.multiSelect && selectedOptions.includes(option) ? "default" : "secondary"}
                      size="sm"
                      onClick={() => message.multiSelect ? handleOptionSelect(option) : handleSubmit(option)}
                      className="mb-2"
                    >
                      {option}
                    </Button>
                  ))}
                  {(message.multiSelect || showCustomInput) && (
                    <Button
                      className="mt-2"
                      onClick={handleDoneMultiSelect}
                      disabled={(selectedOptions.length === 0 && !showCustomInput) || (showCustomInput && !currentInput.trim())}
                    >
                      Done
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </CardContent>

      {!isComplete && currentStep < questions.length && (showCustomInput || !questions[currentStep].options) && (
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  if (showCustomInput) {
                    handleDoneMultiSelect();
                  } else {
                    handleSubmit(currentInput);
                  }
                }
              }}
              placeholder={showCustomInput ? "Enter custom value..." : "Type your answer..."}
            />
            <Button 
              onClick={() => showCustomInput ? handleDoneMultiSelect() : handleSubmit(currentInput)}
            >
              Send
            </Button>
          </div>
          <div className="mt-2 flex justify-between items-center text-sm text-muted-foreground">
            <span>Step {currentStep + 1} of {questions.length}</span>
            <div className="flex gap-1">
              {Array.from({ length: questions.length }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1 w-4 rounded-full ${
                    i <= currentStep ? "bg-primary" : "bg-border"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}