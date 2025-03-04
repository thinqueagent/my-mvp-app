import { storage } from "../storage";
import type { ContextHistory, Content, BrandGuideline } from "@shared/schema";

interface ContentContext {
  previousContent: Content[];
  guidelines: BrandGuideline;
  performance: {
    engagement: Record<string, number>;
    sentiment: string;
    effectiveness: number;
  };
}

interface AIFeedback {
  understanding: string;
  reasoning: string;
  improvements: string[];
}

export class ContextManager {
  private static readonly MAX_HISTORY_ITEMS = 5;

  static async getContentContext(userId: number, guidelineId: number): Promise<ContentContext> {
    // Get recent successful content for this guideline
    const allContent = await storage.getContent(userId);
    const relevantContent = allContent
      .filter(c => c.guidelineId === guidelineId && c.status === "posted")
      .sort((a, b) => {
        const aEngagement = Object.values(a.engagement as Record<string, number>).reduce((sum, val) => sum + val, 0);
        const bEngagement = Object.values(b.engagement as Record<string, number>).reduce((sum, val) => sum + val, 0);
        return bEngagement - aEngagement;
      })
      .slice(0, this.MAX_HISTORY_ITEMS);

    const guidelines = await storage.getGuideline(guidelineId);
    if (!guidelines) throw new Error("Guidelines not found");

    return {
      previousContent: relevantContent,
      guidelines,
      performance: this.aggregatePerformance(relevantContent),
    };
  }

  static async trackInteraction(
    userId: number,
    contentId: number,
    type: "generation" | "edit" | "approval" | "feedback",
    context: ContentContext,
    aiFeedback: AIFeedback
  ): Promise<void> {
    await storage.createContext({
      userId,
      contentId,
      interactionType: type,
      context,
      aiFeedback,
      performance: {},
    });
  }

  private static aggregatePerformance(content: Content[]): ContentContext["performance"] {
    const totalEngagement = content.reduce((acc, curr) => {
      const engagement = curr.engagement as Record<string, number>;
      Object.entries(engagement).forEach(([key, value]) => {
        acc[key] = (acc[key] || 0) + value;
      });
      return acc;
    }, {} as Record<string, number>);

    // Calculate effectiveness score (0-1)
    const effectiveness = content.length > 0 ? 
      Object.values(totalEngagement).reduce((sum, val) => sum + val, 0) / (content.length * 100) : 
      0;

    return {
      engagement: totalEngagement,
      sentiment: this.calculateOverallSentiment(totalEngagement),
      effectiveness: Math.min(1, effectiveness),
    };
  }

  private static calculateOverallSentiment(engagement: Record<string, number>): string {
    const total = Object.values(engagement).reduce((sum, val) => sum + val, 0);
    if (total > 1000) return "viral";
    if (total > 500) return "high";
    if (total > 100) return "moderate";
    return "low";
  }
}
