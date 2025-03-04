import OpenAI from "openai";
import { ContextManager } from "./context-manager";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface BrandVoiceAnalysis {
  detectedTone: {
    primary: string;
    secondary: string;
    attributes: string[];
  };
  confidence: number;
  sampleCaptions: string[];
  suggestedRefinements: string[];
}

interface ContentGenerationParams {
  userId: number;
  voice?: string;
  tone?: string;
  style?: string;
  keywords?: string[];
  platform: "twitter" | "instagram" | "linkedin" | "pinterest";
  objective: string;
  guidelineId?: number;
  type: "caption" | "hashtags" | "optimize";
  content?: string; // For optimization
}

export async function analyzeBrandVoice(answers: Record<string, any>): Promise<BrandVoiceAnalysis> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are a brand analysis expert. Based on the provided answers, determine the brand's voice, tone, and style. 
        Generate sample captions that match this voice. Provide a confidence score (0-100) on how well you understand the brand.
        Return response in JSON format with the following structure:
        {
          "detectedTone": {
            "primary": "string",
            "secondary": "string",
            "attributes": ["string"]
          },
          "confidence": number,
          "sampleCaptions": ["string"],
          "suggestedRefinements": ["string"]
        }`
      },
      {
        role: "user",
        content: `Analyze these brand questionnaire answers and generate a complete brand voice profile: ${JSON.stringify(answers)}`
      }
    ],
    response_format: { type: "json_object" }
  });

  return JSON.parse(response.choices[0].message.content);
}

export async function generateQuestionnaire(previousAnswers?: Record<string, any>): Promise<{
  questions: Array<{ id: string; question: string; type: "text" | "scale" | "multiselect"; options?: string[] }>;
}> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `Generate the next set of brand voice questions based on previous answers. 
        Return in JSON format with structure:
        {
          "questions": [
            {
              "id": "string",
              "question": "string",
              "type": "text" | "scale" | "multiselect",
              "options": ["string"] // only for multiselect
            }
          ]
        }`
      },
      {
        role: "user",
        content: previousAnswers 
          ? `Generate follow-up questions based on these answers: ${JSON.stringify(previousAnswers)}`
          : "Generate initial brand voice questions"
      }
    ],
    response_format: { type: "json_object" }
  });

  return JSON.parse(response.choices[0].message.content);
}

export async function generateSocialContent(params: ContentGenerationParams): Promise<{
  content?: string;
  hashtags?: string[];
  understanding: string;
  reasoning: string;
  improvements: string[];
}> {
  try {
    const context = params.guidelineId ? 
      await ContextManager.getContentContext(params.userId, params.guidelineId) :
      null;

    const systemPrompt = `You are a social media content creator specializing in ${params.platform}. 
Please provide your response in JSON format with the following structure:
${params.type === "hashtags" ? `{
  "hashtags": ["tag1", "tag2", "tag3"],
  "understanding": "How you understood the request",
  "reasoning": "Why you chose these hashtags",
  "improvements": ["suggestion1", "suggestion2"]
}` : `{
  "content": "The generated social media post",
  "understanding": "How you understood the request",
  "reasoning": "Why you chose this approach",
  "improvements": ["suggestion1", "suggestion2"]
}`}

${context ? `Use these brand guidelines:
Voice: ${context.guidelines.voice}
Tone: ${context.guidelines.tone}
Style: ${context.guidelines.style}
Keywords: ${context.guidelines.keywords?.join(", ")}

Historical Context:
- Previous successful posts: ${context.previousContent.map(c => c.content).join("\n")}
- Overall engagement level: ${context.performance.sentiment}
- Most effective elements: ${JSON.stringify(context.performance.engagement)}` : ""}

Follow platform best practices:
Twitter: Max 280 chars, engaging, concise
Instagram: Visual focus, emoji-friendly, hashtag-optimized
LinkedIn: Professional tone, industry insights, longer-form
Pinterest: Visual-first, descriptive, keyword-rich

${params.type === "optimize" ? "Optimize the provided content for maximum engagement while maintaining the core message." :
  params.type === "hashtags" ? "Generate relevant, trending hashtags that will maximize reach and engagement." :
  "Generate an engaging caption based on the provided prompt."}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: params.type === "optimize" ? 
            `Optimize this content for ${params.platform}: ${params.content}` :
            params.type === "hashtags" ?
            `Suggest hashtags for this content on ${params.platform}: ${params.content}` :
            `Create a ${params.platform} post with objective: ${params.objective}. Return the response in JSON format.`
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);

    if (context) {
      await ContextManager.trackInteraction(
        params.userId,
        -1,
        "generation",
        context,
        {
          understanding: result.understanding,
          reasoning: result.reasoning,
          improvements: result.improvements
        }
      );
    }

    return result;
  } catch (error: any) {
    console.error("OpenAI generation error:", error);
    throw new Error("Failed to generate content: " + error.message);
  }
}

export async function analyzeContentTone(
  content: string,
  userId: number,
  contentId: number,
  guidelineId: number
): Promise<{
  brandAlignment: number;
  engagement: number;
  sentiment: string;
}> {
  try {
    const context = await ContextManager.getContentContext(userId, guidelineId);

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Analyze this social media content and provide your response in JSON format:
{
  "brandAlignment": 0.95,
  "engagement": 0.85,
  "sentiment": "positive"
}

Context:
Previous content sentiment: ${context.performance.sentiment}
Brand effectiveness: ${context.performance.effectiveness}

Analyze and score:
- Brand alignment (0-1)
- Predicted engagement (0-1)
- Overall sentiment prediction`
        },
        { 
          role: "user", 
          content: `Analyze this content and return JSON response: ${content}` 
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);

    await ContextManager.trackInteraction(
      userId,
      contentId,
      "feedback",
      context,
      {
        understanding: "Content analysis performed",
        reasoning: `Alignment: ${result.brandAlignment}, Engagement: ${result.engagement}`,
        improvements: []
      }
    );

    return result;
  } catch (error: any) {
    console.error("OpenAI analysis error:", error);
    throw new Error("Failed to analyze content: " + error.message);
  }
}