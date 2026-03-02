import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post(api.users.create.path, async (req, res) => {
    try {
      const input = api.users.create.input.parse(req.body);
      const user = await storage.createUser(input);
      res.status(201).json(user);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get(api.users.get.path, async (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    const user = await storage.getUser(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  });

  app.put(api.users.update.path, async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const input = api.users.update.input.parse(req.body);
      const user = await storage.updateUser(id, input);
      res.json(user);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.post(api.scans.analyze.path, async (req, res) => {
    try {
      const input = api.scans.analyze.input.parse(req.body);
      
      const { extractedText, allergies, language, userId } = input;
      const lowerText = extractedText.toLowerCase();
      
      let status: "SAFE" | "CAUTION" | "NOT SAFE" = "SAFE";
      let matchedAllergen: string | null = null;
      
      // Simple exact match logic for allergens
      for (const allergen of allergies) {
        if (lowerText.includes(allergen.toLowerCase())) {
          status = "NOT SAFE";
          matchedAllergen = allergen;
          break;
        }
      }
      
      if (status === "SAFE") {
        if (lowerText.includes("may contain") || lowerText.includes("processed in facility")) {
          status = "CAUTION";
        }
      }
      
      let message = "";
      if (language === 'hi') {
        if (status === "SAFE") message = "यह भोजन आपके लिए सुरक्षित है।";
        else if (status === "CAUTION") message = "इस भोजन में एलर्जी कारक हो सकते हैं।";
        else message = "इस भोजन में एलर्जी कारक मौजूद हैं।";
      } else {
        if (status === "SAFE") message = "This food is safe for you.";
        else if (status === "CAUTION") message = "This food may contain allergens.";
        else message = "This food contains allergens.";
      }
      
      if (userId) {
        await storage.createScanHistory({
          userId,
          extractedText,
          result: status,
          matchedAllergen
        });
      }
      
      res.json({ status, matchedAllergen, message });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.scans.history.path, async (req, res) => {
    const userId = Number(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    const history = await storage.getUserScanHistory(userId);
    res.json(history);
  });

  return httpServer;
}
