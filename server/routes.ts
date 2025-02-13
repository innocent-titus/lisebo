import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import multer from "multer";
import path from "path";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertReportSchema, insertEvidenceSchema } from "@shared/schema";
import { v4 as uuid } from "uuid";
import { whatsappService } from "./services/whatsapp";

// Store connected clients
const clients = new Set<WebSocket>();

const upload = multer({
  storage: multer.diskStorage({
    destination: "uploads/",
    filename: (_req, file, cb) => {
      const uniqueId = uuid();
      cb(null, uniqueId + path.extname(file.originalname));
    },
  }),
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf", "text/plain"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Submit new report
  app.post("/api/reports", async (req, res) => {
    try {
      const reportData = insertReportSchema.parse(req.body);
      const report = await storage.createReport(reportData);

      // Notify all connected clients about new report
      const notification = {
        type: "NEW_REPORT",
        data: {
          id: report.id,
          title: report.title,
          category: report.category,
          status: report.status,
        },
      };

      broadcast(notification);
      res.status(201).json(report);
    } catch (error) {
      res.status(400).json({ error: "Invalid report data" });
    }
  });

  // Upload evidence
  app.post("/api/evidence/upload", upload.single("file"), async (req: Request, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    try {
      const evidence = await storage.addEvidence({
        reportId: req.body.reportId,
        fileType: req.file.mimetype,
        storagePath: req.file.path,
      });

      // Notify about new evidence
      const notification = {
        type: "NEW_EVIDENCE",
        data: {
          reportId: evidence.reportId,
          fileType: evidence.fileType,
        },
      };

      broadcast(notification);
      res.status(201).json(evidence);
    } catch (error) {
      res.status(400).json({ error: "Invalid evidence data" });
    }
  });

  // Get report by anonymous token
  app.get("/api/reports/track/:token", async (req, res) => {
    const report = await storage.getReportByToken(req.params.token);
    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }
    res.json(report);
  });

  // Protected admin routes
  app.get("/api/reports", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const reports = await storage.getAllReports();
    res.json(reports);
  });

  // Modify the existing PATCH /api/reports/:id/status endpoint
  app.patch("/api/reports/:id/status", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const report = await storage.updateReportStatus(req.params.id, req.body.status);
    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    // Notify about status change via WebSocket
    const notification = {
      type: "STATUS_CHANGE",
      data: {
        id: report.id,
        status: report.status,
      },
    };

    broadcast(notification);

    // Send WhatsApp notification if the report was submitted via WhatsApp
    if (report.location === "Submitted via WhatsApp") {
      try {
        await whatsappService.sendStatusUpdate(
          report.anonymousToken, // Using anonymousToken as reference
          report.id,
          report.status
        );
      } catch (error) {
        console.error('Failed to send WhatsApp status update:', error);
      }
    }

    res.json(report);
  });

  // WhatsApp webhook endpoint
  app.post("/api/whatsapp/webhook", async (req, res) => {
    try {
      const { from, message } = req.body;
      const report = await whatsappService.handleIncomingMessage(from, message);
      res.status(200).json(report);
    } catch (error) {
      console.error('WhatsApp webhook error:', error);
      res.status(500).json({ error: "Failed to process WhatsApp message" });
    }
  });

  // WhatsApp webhook verification (required by Meta)
  app.get("/api/whatsapp/webhook", (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    // In production, verify_token should be a secure random string stored in environment variables
    if (mode === "subscribe" && token === "your_verify_token") {
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  });

  const httpServer = createServer(app);

  // Setup WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    clients.add(ws);

    ws.on('close', () => {
      clients.delete(ws);
    });
  });

  return httpServer;
}

// Broadcast message to all connected clients
function broadcast(message: any) {
  const messageStr = JSON.stringify(message);
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(messageStr);
    }
  });
}