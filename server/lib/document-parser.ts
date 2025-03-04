import fs from "fs";
import path from "path";
import PDFParser from "pdf-parse";
import * as cheerio from "cheerio";
import { BrandGuideline } from "@shared/schema";

// Define constants for parsing limits
const MAX_CONTENT_LENGTH = 50000; // Maximum characters to process from a document
const MAX_SECTIONS = 20; // Maximum number of sections to extract

export async function parseGuidelines(
  filePath: string,
  fileType: string
): Promise<Partial<BrandGuideline>> {
  try {
    const fileContent = await fs.promises.readFile(filePath);
    let extractedText = "";

    if (fileType.includes("pdf")) {
      const pdfData = await PDFParser(fileContent);
      extractedText = pdfData.text.slice(0, MAX_CONTENT_LENGTH);
    } else if (fileType.includes("html")) {
      const $ = cheerio.load(fileContent.toString());
      extractedText = $("body").text().slice(0, MAX_CONTENT_LENGTH);
    } else {
      extractedText = fileContent.toString().slice(0, MAX_CONTENT_LENGTH);
    }

    // Extract brand guidelines from the text
    const guidelines: Partial<BrandGuideline> = {
      brandValues: extractBrandValues(extractedText),
      brandVoice: extractBrandVoice(extractedText),
      colorPalette: extractColorPalette(extractedText),
      typography: extractTypography(extractedText),
      logoUsage: extractLogoUsage(extractedText),
    };

    return guidelines;
  } catch (error) {
    console.error("Error parsing document:", error);
    return {};
  }
}

function extractBrandValues(text: string): string[] {
  // Look for sections that might contain brand values
  const valueRegex = /(?:brand\s+values?|core\s+values?|values?|principles|mission|vision)(?:\s*:\s*|\s*-\s*|\n+)([\s\S]*?)(?:\n\n|\n[A-Z]|$)/gi;
  const matches = [...text.matchAll(valueRegex)];

  const brandValues: string[] = [];

  for (const match of matches) {
    if (match[1]) {
      // Split by bullet points, numbers, or new lines
      const values = match[1]
        .split(/(?:\r?\n|\s*•\s*|\s*-\s*|\s*\d+\.\s*|\s*\[\s*\]\s*)/)
        .map(v => v.trim())
        .filter(v => v.length > 3 && v.length < 100); // Filter reasonable length values

      brandValues.push(...values);

      if (brandValues.length >= MAX_SECTIONS) break;
    }
  }

  return [...new Set(brandValues)]; // Remove duplicates
}

function extractBrandVoice(text: string): string[] {
  // Look for sections that might contain brand voice information
  const voiceRegex = /(?:brand\s+voice|tone\s+of\s+voice|tone|voice|communication\s+style|messaging)(?:\s*:\s*|\s*-\s*|\n+)([\s\S]*?)(?:\n\n|\n[A-Z]|$)/gi;
  const matches = [...text.matchAll(voiceRegex)];

  const brandVoice: string[] = [];

  for (const match of matches) {
    if (match[1]) {
      // Split by bullet points, numbers, or new lines
      const voices = match[1]
        .split(/(?:\r?\n|\s*•\s*|\s*-\s*|\s*\d+\.\s*|\s*\[\s*\]\s*)/)
        .map(v => v.trim())
        .filter(v => v.length > 3 && v.length < 100); // Filter reasonable length values

      brandVoice.push(...voices);

      if (brandVoice.length >= MAX_SECTIONS) break;
    }
  }

  return [...new Set(brandVoice)]; // Remove duplicates
}

function extractColorPalette(text: string): Record<string, string> {
  const colorPalette: Record<string, string> = {};

  // Look for hex color codes or color names with values
  const colorRegex = /(?:(?:#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3})|(?:rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\))|(?:rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[0-9.]+\s*\)))/g;
  const colorMatches = [...text.matchAll(colorRegex)];

  // Look for color names near hex codes
  const namedColorRegex = /([A-Za-z\s]+)(?:\s*[-:]\s*)(?:#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}|rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)|rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[0-9.]+\s*\))/g;
  const namedMatches = [...text.matchAll(namedColorRegex)];

  // Add named colors
  for (const match of namedMatches) {
    if (match[1]) {
      const colorName = match[1].trim().toLowerCase();
      if (colorName && match[0]) {
        const hexCode = match[0].match(colorRegex)?.[0];
        if (hexCode && colorName.length < 30) { // Avoid overly long "names"
          colorPalette[colorName] = hexCode;
        }
      }
    }
  }

  // Add any remaining unnamed colors with generic names
  let colorCount = Object.keys(colorPalette).length;
  for (const match of colorMatches) {
    const hexCode = match[0];
    if (!Object.values(colorPalette).includes(hexCode) && colorCount < MAX_SECTIONS) {
      colorPalette[`color${colorCount + 1}`] = hexCode;
      colorCount++;
    }
  }

  return colorPalette;
}

function extractTypography(text: string): Record<string, string> {
  const typography: Record<string, string> = {};

  // Look for font names and styles
  const fontRegex = /(?:font|typeface|typography)(?:\s*:\s*|\s*-\s*|\n+)([^.,;:\n]+)/gi;
  const fontMatches = [...text.matchAll(fontRegex)];

  // Match specific font categories
  const headingRegex = /(?:heading|header|title|h1|h2|h3)(?:\s*:\s*|\s*-\s*|\n+)([^.,;:\n]+)/gi;
  const bodyRegex = /(?:body|paragraph|text|content)(?:\s*font|typeface)?(?:\s*:\s*|\s*-\s*|\n+)([^.,;:\n]+)/gi;

  // Extract general fonts
  for (const match of fontMatches) {
    if (match[1] && match[1].trim().length > 0) {
      const fontName = match[1].trim();
      if (fontName.length < 50 && !typography["primary"]) {
        typography["primary"] = fontName;
      } else if (fontName.length < 50 && !typography["secondary"] && fontName !== typography["primary"]) {
        typography["secondary"] = fontName;
      }
    }
  }

  // Extract heading font
  const headingMatches = [...text.matchAll(headingRegex)];
  for (const match of headingMatches) {
    if (match[1] && match[1].trim().length > 0) {
      const fontName = match[1].trim();
      if (fontName.length < 50) {
        typography["heading"] = fontName;
        break;
      }
    }
  }

  // Extract body font
  const bodyMatches = [...text.matchAll(bodyRegex)];
  for (const match of bodyMatches) {
    if (match[1] && match[1].trim().length > 0) {
      const fontName = match[1].trim();
      if (fontName.length < 50) {
        typography["body"] = fontName;
        break;
      }
    }
  }

  return typography;
}

function extractLogoUsage(text: string): string[] {
  // Look for logo usage guidelines
  const logoRegex = /(?:logo\s+usage|logo\s+guidelines|logo)(?:\s*:\s*|\s*-\s*|\n+)([\s\S]*?)(?:\n\n|\n[A-Z]|$)/gi;
  const matches = [...text.matchAll(logoRegex)];

  const logoUsage: string[] = [];

  for (const match of matches) {
    if (match[1]) {
      // Split by bullet points, numbers, or new lines
      const guidelines = match[1]
        .split(/(?:\r?\n|\s*•\s*|\s*-\s*|\s*\d+\.\s*|\s*\[\s*\]\s*)/)
        .map(v => v.trim())
        .filter(v => v.length > 10 && v.length < 200); // Filter reasonable length guidelines

      logoUsage.push(...guidelines);

      if (logoUsage.length >= MAX_SECTIONS) break;
    }
  }

  return [...new Set(logoUsage)]; // Remove duplicates
}

import type { InsertGuideline } from "@shared/schema";
import { OpenAI } from "openai";
import { spawnSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MAX_CONTENT_LENGTH_OPENAI = 12000;


async function extractPdfText(pdfBuffer: Buffer): Promise<string> {
  console.log("\n📄 Starting enhanced PDF extraction...");

  try {
    const pdfJs = await import('pdfjs-dist');
    const pdfjsLib = pdfJs.default;

    // Configure PDF.js with higher quality settings
    const loadingTask = pdfjsLib.getDocument({ 
      data: pdfBuffer,
      // Force using advanced text extraction mode
      disableFontFace: false,
      cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
      cMapPacked: true,
    });

    const pdfDocument = await loadingTask.promise;
    const numPages = pdfDocument.numPages;
    let fullText = '';
    let extractionStats = {
      totalItems: 0,
      emptyItems: 0,
      shortItems: 0,
      longItems: 0
    };

    // Enhanced text extraction with better structure preservation
    for (let i = 1; i <= numPages; i++) {
      const page = await pdfDocument.getPage(i);
      const textContent = await page.getTextContent({ normalizeWhitespace: true });

      // Process text with structure preservation
      let pageLines: string[] = [];
      let lastY: number | null = null;
      let lineBuffer: string[] = [];

      // Track extraction quality metrics
      extractionStats.totalItems += textContent.items.length;

      // Process items to preserve layout
      for (const item of textContent.items) {
        if ('str' in item && item.str) {
          const currentY = ('transform' in item) ? item.transform[5] : null;

          // If Y position changed significantly, consider it a new line
          if (lastY !== null && currentY !== null && Math.abs(lastY - currentY) > 5) {
            if (lineBuffer.length > 0) {
              pageLines.push(lineBuffer.join(' '));
              lineBuffer = [];
            }
          }

          lineBuffer.push(item.str);
          lastY = currentY;

          // Statistics for content quality
          if (item.str.trim().length === 0) {
            extractionStats.emptyItems++;
          } else if (item.str.length < 3) {
            extractionStats.shortItems++;
          } else if (item.str.length > 100) {
            extractionStats.longItems++;
          }
        }
      }

      // Add final line buffer
      if (lineBuffer.length > 0) {
        pageLines.push(lineBuffer.join(' '));
      }

      // Join lines with appropriate spacing
      const pageText = pageLines.join('\n');
      fullText += pageText + '\n\n';
    }

    // Trim and normalize whitespace
    fullText = fullText.replace(/\s+/g, ' ').trim();

    // Check if extraction was successful
    const contentQuality = calculateContentQuality(extractionStats);
    console.log(`📊 Extraction quality score: ${contentQuality.toFixed(2)}`);

    // Limit content length if necessary
    if (fullText.length > MAX_CONTENT_LENGTH_OPENAI) {
      console.log(`⚠️ Truncating content from ${fullText.length} to ${MAX_CONTENT_LENGTH_OPENAI} characters`);
      fullText = fullText.substring(0, MAX_CONTENT_LENGTH_OPENAI);
    }

    return fullText;
  } catch (error) {
    console.error("❌ PDF extraction error:", error);
    return "";
  }
}

function calculateContentQuality(stats: { 
  totalItems: number; 
  emptyItems: number; 
  shortItems: number; 
  longItems: number 
}): number {
  if (stats.totalItems === 0) return 0;

  // Calculate penalty for empty and very short items
  const emptyRatio = stats.emptyItems / stats.totalItems;
  const shortRatio = stats.shortItems / stats.totalItems;

  // Calculate bonus for substantial content items
  const longRatio = stats.longItems / stats.totalItems;

  // Quality score from 0-10
  return 10 * (1 - (emptyRatio * 0.5 + shortRatio * 0.3 - longRatio * 0.2));
}

function findSections(text: string, keywords: string[]): string[] {
  const sections: string[] = [];

  keywords.forEach(keyword => {
    const contentPattern = new RegExp(`(?:${keyword})[^.!?]*[.!?][^.!?]*[.!?]`, 'gi');
    const matches = text.match(contentPattern) || [];
    sections.push(...matches.map(m => m.trim()));
  });

  return [...new Set(sections)].filter(section => section.length >= 50);
}

function calculateBaseConfidence(sections: Record<string, string[]>): number {
  const weights = {
    mission: 25,
    vision: 25,
    values: 30,
    voice: 20
  };

  let totalScore = 25; // Start with base 25%
  let hasContent = false;

  Object.entries(sections).forEach(([key, matches]) => {
    if (matches.length > 0) {
      hasContent = true;
      const weight = weights[key as keyof typeof weights];
      totalScore += weight * Math.min(1, matches.length / 2);
    }
  });

  if (!hasContent) {
    return 25; // Return minimum confidence if no content is found
  }

  return Math.min(100, Math.max(25, totalScore));
}

export async function parseGuidelinesOpenAI(fileBuffer: Buffer, fileName: string, documentType: string = "brand-guidelines"): Promise<InsertGuideline> {
  console.log("\n🔍 Processing document:", fileName);

  try {
    const textContent = await extractPdfText(fileBuffer);
    console.log("\nExtracted Text:\n", textContent); 

    const sections = {
      mission: findSections(textContent, ['mission', 'purpose', 'about us']),
      vision: findSections(textContent, ['vision', 'future', 'aspiration']),
      values: findSections(textContent, ['values', 'principles', 'beliefs']),
      voice: findSections(textContent, ['voice', 'tone', 'personality'])
    };

    const baseConfidence = calculateBaseConfidence(sections);

    console.log("\n📑 Found Content Sections:");
    Object.entries(sections).forEach(([key, matches]) => {
      console.log(`\n${key.toUpperCase()}:`);
      matches.forEach((match, i) => console.log(`${i + 1}. "${match}"`));
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4o", 
      messages: [
        {
          role: "system",
          content: `You are analyzing brand guidelines. Return a detailed JSON analysis of the content.
Important: Minimum confidence must be ${baseConfidence}%. Found sections:
${Object.entries(sections)
  .map(([key, matches]) => `${key}: ${matches.length} matches`)
  .join('\n')}
Required JSON format:
{
  "brandIdentity": {
    "mission": "Complete mission statement",
    "vision": "Full vision statement",
    "values": ["Value 1 with description", "Value 2 with context"]
  },
  "voice": {
    "primary": "Main characteristic",
    "secondary": ["Additional traits"],
    "formalityLevel": number
  },
  "detectedTone": {
    "primary": "Main tone",
    "attributes": ["Detailed attributes"]
  },
  "confidence": {
    "missionClarity": number,
    "valuesIdentification": number,
    "voiceConsistency": number,
    "overall": number
  }
}`
        },
        {
          role: "user",
          content: `Please analyze this brand content and provide a JSON response. Found sections:\n${JSON.stringify(sections, null, 2)}\n\nContent:\n${textContent}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const analysis = JSON.parse(response.choices[0].message.content);

    return {
      name: `${documentType.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}`,
      industry: analysis.industry || "General",
      targetAudience: analysis.targetAudience || { demographics: [], interests: [] },
      preferredPlatforms: analysis.preferredPlatforms || ["twitter", "instagram"],
      coreValues: analysis.brandIdentity?.values || [],
      competitors: analysis.competitors || [],
      useEmojis: analysis.tone?.useEmojis || false,
      formalityScale: analysis.voice?.formalityLevel || 3,
      voice: analysis.voice?.primary || "professional",
      tone: analysis.detectedTone?.primary || "neutral",
      detectedTone: analysis.detectedTone,
      style: analysis.style || "professional",
      keywords: analysis.keywords || [],
      sampleCaptions: analysis.sampleCaptions || [],
      hashtagRecommendations: [],
      sourceType: "document",
      sourceUrl: null
    };

  } catch (error: any) {
    console.error("\n❌ Document analysis failed:", error);
    throw new Error(`Failed to analyze document: ${error.message || error}`);
  }
}

export { extractPdfText, parseGuidelinesOpenAI };