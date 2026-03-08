import { pgTable, text, serial, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  allergies: jsonb("allergies").$type<string[]>().default([]).notNull(),
  languagePreference: text("language_preference").default("en").notNull(),
  emergencyContact: text("emergency_contact"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const scanHistory = pgTable("scan_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  extractedText: text("extracted_text").notNull(),
  result: text("result").notNull(), // SAFE | CAUTION | NOT SAFE
  matchedAllergen: text("matched_allergen"),
  documentUrl: text("document_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users, {
  allergies: z.array(z.string())
}).omit({ id: true, createdAt: true });
export const insertScanHistorySchema = createInsertSchema(scanHistory).omit({ id: true, createdAt: true });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type ScanHistory = typeof scanHistory.$inferSelect;
export type InsertScanHistory = z.infer<typeof insertScanHistorySchema>;

export type CreateUserRequest = InsertUser;
export type UpdateUserRequest = Partial<InsertUser>;

export type ScanAnalysisRequest = {
  extractedText: string;
  allergies: string[];
  language: string;
  userId?: number;
};

export type ScanAnalysisResponse = {
  status: "SAFE" | "CAUTION" | "NOT SAFE";
  matchedAllergen: string | null;
  message: string;
};
