import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertGuidelineSchema, insertContentSchema } from "@shared/schema";
import { generateSocialContent, analyzeContentTone } from "./lib/openai";
import multer from "multer";
import { parseGuidelines } from "./lib/document-parser";

// Configure multer with improved error handling and larger file size limit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit
    files: 1
  },
  fileFilter: (req, file, cb) => {
    // Check file types
    const allowedMimes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and Word documents are allowed.') as any);
    }
  }
}).single('file');

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication first before any other routes
  setupAuth(app);

  // Check if authentication is working
  app.get("/api/auth-check", (req, res) => {
    res.json({ isAuthenticated: req.isAuthenticated() });
  });

  // Brand Guidelines Management
  app.get("/api/guidelines", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const guidelines = await storage.getGuidelines(req.user.id);
    res.json(guidelines);
  });

  app.post("/api/guidelines", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const data = insertGuidelineSchema.parse(req.body);
    const guideline = await storage.createGuideline({
      ...data,
      userId: req.user.id,
    });
    res.status(201).json(guideline);
  });

  // File upload endpoint with detailed error handling and improved logging
  app.post("/api/guidelines/analyze-website", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: "Website URL is required" });
  }
  
  try {
    // Simple placeholder implementation until full scraping is implemented
    const websiteData = {
      name: new URL(url).hostname.replace('www.', ''),
      sourceType: "website",
      detectedTone: {
        primary: "Professional",
        attributes: ["Modern", "Trustworthy", "Informative"]
      },
      sampleCaptions: [
        "Delivering excellence in every interaction.",
        "Building trust through innovative solutions."
      ]
    };
    
    res.json(websiteData);
  } catch (error: any) {
    console.error("Website analysis error:", error);
    res.status(500).json({ error: "Failed to analyze website", details: error.message });
  }
});

app.post("/api/guidelines/upload", (req, res) => {
    console.log("\n📤 Processing file upload request");

    // Check authentication first
    if (!req.isAuthenticated()) {
      console.log("❌ Authentication failed");
      return res.status(401).json({ error: "Authentication required" });
    }

    upload(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        console.error("❌ Multer error:", err);
        return res.status(400).json({ 
          error: err.code === 'LIMIT_FILE_SIZE' 
            ? "File is too large. Maximum size is 10MB." 
            : `File upload error: ${err.message}`
        });
      } else if (err) {
        console.error("❌ Upload error:", err);
        return res.status(500).json({ error: "File upload failed", details: err.message });
      }

      try {
        // Validate file exists
        if (!req.file) {
          console.error("❌ No file in request");
          return res.status(400).json({ error: "No file uploaded" });
        }

        console.log("\n📋 Upload details:", {
          fileName: req.file.originalname,
          fileSize: req.file.size,
          mimeType: req.file.mimetype
        });

        // Log file content type for debugging
        console.log("File content type:", req.file.mimetype);
        
        // Validate file type
        const validMimeTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!validMimeTypes.includes(req.file.mimetype)) {
          console.error(`❌ Invalid file type: ${req.file.mimetype}`);
          return res.status(400).json({ 
            error: "Invalid file type. Only PDF and Word documents are supported." 
          });
        }

        // Validate document type
        const documentType = req.body.documentType;
        if (!documentType) {
          console.error("❌ Missing document type");
          return res.status(400).json({ error: "Document type is required" });
        }

        console.log("📄 Processing document type:", documentType);
        
        // Additional document logging
        console.log("📑 File details:", {
          name: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype
        });

        try {
          // Parse the uploaded document with retry logic
          let parsedGuidelines;
          let attempts = 0;
          const maxAttempts = 3; // Increased retry attempts
          
          while (attempts < maxAttempts) {
            try {
              attempts++;
              console.log(`\n🔄 Parsing attempt ${attempts}/${maxAttempts}`);
              
              parsedGuidelines = await parseGuidelines(
                req.file.buffer,
                req.file.originalname,
                documentType
              );
              
              console.log("✅ Parsing successful, extracted guidelines:", 
                JSON.stringify(parsedGuidelines).substring(0, 200) + "...");
              
              // If we get here, parsing succeeded
              break;
            } catch (parseError: any) {
              console.error(`❌ Parsing attempt ${attempts} failed:`, parseError.message);
              console.error(parseError.stack);
              
              // Only throw on final attempt
              if (attempts >= maxAttempts) {
                throw parseError;
              }
              
              // Wait longer before retry
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          }

          // Ensure we have valid guidelines data
          if (!parsedGuidelines || !parsedGuidelines.name) {
            throw new Error("Failed to parse document: Invalid or missing guideline data");
          }

          // Create guidelines
          const guideline = await storage.createGuideline({
            ...parsedGuidelines,
            userId: req.user.id,
          });

          console.log("✅ Successfully created guideline:", guideline.id);
          res.status(201).json(guideline);
        } catch (processingError: any) {
          console.error("❌ Document processing error:", processingError);
          res.status(500).json({ 
            error: "Failed to process document",
            details: processingError.message,
            phase: "document_parsing"
          });
        }

      } catch (error: any) {
        console.error("❌ Document processing error:", error);
        res.status(500).json({ 
          error: "Failed to process document",
          details: error.message
        });
      }
    });
  });

  app.patch("/api/guidelines/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const data = insertGuidelineSchema.parse(req.body);
    const guideline = await storage.updateGuideline(parseInt(req.params.id), {
      ...data,
      userId: req.user.id,
    });
    res.json(guideline);
  });

  // Content Management with Context Tracking
  app.get("/api/content", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const content = await storage.getContent(req.user.id);
    res.json(content);
  });

  app.post("/api/content/generate", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const { guidelineId, prompt, platform, type, content } = req.body;

    let guideline = null;
    if (guidelineId) {
      guideline = await storage.getGuideline(guidelineId);
      if (!guideline) return res.status(404).send("Guideline not found");
    }

    try {
      const generatedContent = await generateSocialContent({
        userId: req.user.id,
        guidelineId: guidelineId ? parseInt(guidelineId) : undefined,
        platform,
        objective: prompt,
        type: type || "caption",
        content,
      });

      res.json(generatedContent);
    } catch (error) {
      console.error("Content generation error:", error);
      res.status(500).json({ error: "Failed to generate content" });
    }
  });

  app.post("/api/content", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const data = insertContentSchema.parse(req.body);
    const content = await storage.createContent({
      ...data,
      userId: req.user.id,
    });

    try {
      // Analyze the content and track the context
      const analysis = await analyzeContentTone(
        content.content,
        req.user.id,
        content.id,
        content.guidelineId
      );

      res.status(201).json({ ...content, analysis });
    } catch (error) {
      console.error("Content analysis error:", error);
      res.status(201).json(content);
    }
  });

  // New endpoint for context history
  app.get("/api/content/:id/context", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const contextHistory = await storage.getContextHistory(parseInt(req.params.id));
    res.json(contextHistory);
  });

  const httpServer = createServer(app);
  return httpServer;
}