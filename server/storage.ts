import { IStorage } from "./types";
import session from "express-session";
import createMemoryStore from "memorystore";
import { User, BrandGuideline, Content, ContextHistory, InsertUser, InsertGuideline, InsertContent, InsertContext } from "@shared/schema";

const MemoryStore = createMemoryStore(session);

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private guidelines: Map<number, BrandGuideline>;
  private content: Map<number, Content>;
  private contextHistory: Map<number, ContextHistory>;
  sessionStore: session.Store;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.guidelines = new Map();
    this.content = new Map();
    this.contextHistory = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.currentId++;
    const newUser = { 
      ...user, 
      id,
      role: user.role || "editor" 
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async getGuidelines(userId: number): Promise<BrandGuideline[]> {
    return Array.from(this.guidelines.values()).filter(
      (g) => g.userId === userId,
    );
  }

  async getGuideline(id: number): Promise<BrandGuideline | undefined> {
    return this.guidelines.get(id);
  }

  async createGuideline(guideline: InsertGuideline & { userId: number }): Promise<BrandGuideline> {
    const id = this.currentId++;
    const newGuideline = {
      ...guideline,
      id,
      created: new Date(),
    };
    this.guidelines.set(id, newGuideline);
    return newGuideline;
  }

  async updateGuideline(id: number, guideline: InsertGuideline & { userId: number }): Promise<BrandGuideline> {
    const existing = await this.getGuideline(id);
    if (!existing) {
      throw new Error("Guideline not found");
    }
    if (existing.userId !== guideline.userId) {
      throw new Error("Unauthorized");
    }
    const updatedGuideline = {
      ...guideline,
      id,
      created: existing.created,
    };
    this.guidelines.set(id, updatedGuideline);
    return updatedGuideline;
  }

  async getContent(userId: number): Promise<Content[]> {
    return Array.from(this.content.values()).filter(
      (c) => c.userId === userId,
    );
  }

  async createContent(content: InsertContent & { userId: number }): Promise<Content> {
    const id = this.currentId++;
    const newContent = {
      ...content,
      id,
      engagement: {},
      created: new Date(),
      scheduledFor: content.scheduledFor || null 
    };
    this.content.set(id, newContent);
    return newContent;
  }

  async getContextHistory(contentId: number): Promise<ContextHistory[]> {
    return Array.from(this.contextHistory.values()).filter(
      (c) => c.contentId === contentId,
    );
  }

  async createContext(context: InsertContext & { userId: number }): Promise<ContextHistory> {
    const id = this.currentId++;
    const newContext = {
      ...context,
      id,
      created: new Date(),
      performance: {} 
    };
    this.contextHistory.set(id, newContext);
    return newContext;
  }

  async getUserContextHistory(userId: number): Promise<ContextHistory[]> {
    return Array.from(this.contextHistory.values()).filter(
      (c) => c.userId === userId,
    );
  }
}

export const storage = new MemStorage();