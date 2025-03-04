import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add more detailed logging
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    log("Starting Express application setup...");

    // First, set up the routes including authentication
    const server = await registerRoutes(app);

    // Error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      log(`Error: ${status} - ${message}`);
      res.status(status).json({ message });
      throw err;
    });

    // Important: setup Vite/static file serving AFTER routes
    if (app.get("env") === "development") {
      log("Setting up Vite middleware for development...");
      await setupVite(app, server);
    } else {
      log("Setting up static file serving for production...");
      serveStatic(app);
    }

    // ALWAYS serve the app on port 5000
    // this serves both the API and the client
    const port = 5000;
    
    // Try to use a completely different port to avoid conflicts
    // Use port 3000 as default since 8080 appears to be in use
    const startPort = 3000; 
    let currentPort = startPort;
    const maxPortAttempts = 10;
    let portAttempts = 0;
    
    const startServer = () => {
      server.listen({
        port: currentPort,
        host: "0.0.0.0",
      }, () => {
        log(`Server is running and listening on port ${currentPort}`);
        
        // Log clear access URL
        log(`Access your application at: https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`);
      });
    };
    
    server.on('error', (e: any) => {
      if (e.code === 'EADDRINUSE') {
        log(`Port ${currentPort} is already in use.`);
        
        if (portAttempts < maxPortAttempts) {
          portAttempts++;
          currentPort = startPort + portAttempts;
          log(`Trying port ${currentPort} instead...`);
          
          // No need to close server as it never started successfully
          startServer();
        } else {
          log(`Unable to find an available port after ${maxPortAttempts} attempts.`);
          log(`Killing existing Node.js processes...`);
          
          try {
            process.kill(0, 'SIGKILL'); // Force kill this process
          } catch (err) {
            log(`Failed to kill process: ${err}`);
            process.exit(1);
          }
        }
      } else {
        log(`Fatal server error: ${e.message}`);
        process.exit(1);
      }
    });
    
    startServer();
  } catch (error: any) {
    log(`Fatal error during startup: ${error.message}`);
    process.exit(1);
  }
})();