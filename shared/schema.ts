import { pgTable, text, serial, integer, boolean, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["admin", "editor"] }).notNull().default("editor"),
});

export const brandGuidelines = pgTable("brand_guidelines", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  industry: text("industry").notNull(),
  // Enhanced target audience data
  targetAudience: json("target_audience").notNull(), // Stores demographics and interests

  // Platform preferences
  preferredPlatforms: text("platform", { enum: ["twitter", "instagram", "linkedin", "pinterest"] }).array().notNull(),

  // Core brand identity
  coreValues: text("core_values").array().notNull(),
  competitors: text("competitors").array().notNull(),

  // Content style preferences
  useEmojis: boolean("use_emojis").notNull().default(true),
  formalityScale: integer("formality_scale").notNull(), // 1-5 scale: 1=Casual, 5=Corporate

  // Enhanced brand voice and tone data
  voice: text("voice").notNull(),
  tone: text("tone").notNull(),
  detectedTone: json("detected_tone").default(null), // Stores AI-detected tone attributes
  style: text("style").notNull(),
  keywords: text("keywords").array().notNull(),

  // Sample content and validation
  sampleCaptions: json("sample_captions").default([]), // Stores AI-generated and user-validated captions
  hashtagRecommendations: text("hashtag_recommendations").array().default([]),

  // Source tracking
  sourceType: text("source_type", { enum: ["manual", "document", "website"] }).notNull(),
  sourceUrl: text("source_url"), // Website URL if applicable

  created: timestamp("created").notNull().defaultNow(),
});

// Enhanced guideline schema with new fields
export const insertGuidelineSchema = createInsertSchema(brandGuidelines).pick({
  name: true,
  industry: true,
  targetAudience: true,
  preferredPlatforms: true,
  coreValues: true,
  competitors: true,
  useEmojis: true,
  formalityScale: true,
  voice: true,
  tone: true,
  detectedTone: true,
  style: true,
  keywords: true,
  sampleCaptions: true,
  hashtagRecommendations: true,
  sourceType: true,
  sourceUrl: true,
});

// Export types
export type InsertGuideline = z.infer<typeof insertGuidelineSchema>;
export type BrandGuideline = typeof brandGuidelines.$inferSelect;

export const content = pgTable("content", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  guidelineId: integer("guideline_id").notNull(),
  content: text("content").notNull(),
  platform: text("platform", { enum: ["twitter", "instagram", "linkedin", "pinterest"] }).notNull(),
  status: text("status", { enum: ["draft", "pending", "approved", "posted"] }).notNull(),
  scheduledFor: timestamp("scheduled_for"),
  engagement: json("engagement").default({}),
  created: timestamp("created").notNull().defaultNow(),
});

// New table for context tracking
export const contextHistory = pgTable("context_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  contentId: integer("content_id").notNull(),
  interactionType: text("interaction_type", {
    enum: ["generation", "edit", "approval", "feedback"]
  }).notNull(),
  context: json("context").notNull(), // Stores previous interactions, prompt history
  aiFeedback: json("ai_feedback").notNull(), // Stores AI's understanding and reasoning
  performance: json("performance").default({}), // Tracks how well this context performed
  created: timestamp("created").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
});

export const insertContentSchema = createInsertSchema(content).pick({
  guidelineId: true,
  content: true,
  platform: true,
  status: true,
  scheduledFor: true,
});

// New schema for context history
export const insertContextSchema = createInsertSchema(contextHistory).pick({
  contentId: true,
  interactionType: true,
  context: true,
  aiFeedback: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertContent = z.infer<typeof insertContentSchema>;
export type InsertContext = z.infer<typeof insertContextSchema>;

export type User = typeof users.$inferSelect;
export type Content = typeof content.$inferSelect;
export type ContextHistory = typeof contextHistory.$inferSelect;