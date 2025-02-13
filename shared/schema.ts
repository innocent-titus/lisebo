import { pgTable, text, uuid, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table for admin authentication
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("admin"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Reports table
export const reports = pgTable("reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  anonymousToken: text("anonymous_token").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  location: varchar("location", { length: 255 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertReportSchema = createInsertSchema(reports).pick({
  title: true,
  description: true,
  category: true,
  location: true,
});

// Evidence table
export const evidence = pgTable("evidence", {
  id: uuid("id").primaryKey().defaultRandom(),
  reportId: uuid("report_id").references(() => reports.id),
  fileType: varchar("file_type", { length: 50 }).notNull(),
  storagePath: text("storage_path").notNull(),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
});

export const insertEvidenceSchema = createInsertSchema(evidence).pick({
  reportId: true,
  fileType: true,
  storagePath: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Evidence = typeof evidence.$inferSelect;
export type InsertEvidence = z.infer<typeof insertEvidenceSchema>;

export const REPORT_CATEGORIES = [
  "Corruption",
  "Fraud",
  "Environmental Violation",
  "Workplace Safety",
  "Discrimination",
  "Other"
] as const;

export const REPORT_STATUSES = [
  "pending",
  "under_review",
  "verified",
  "closed",
  "rejected"
] as const;
