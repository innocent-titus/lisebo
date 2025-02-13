import { User, Report, Evidence, InsertUser, InsertReport, InsertEvidence, users, reports, evidence } from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { db, pool } from "./db";
import { eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Report operations
  createReport(report: InsertReport): Promise<Report>;
  getReport(id: string): Promise<Report | undefined>;
  getReportByToken(token: string): Promise<Report | undefined>;
  getAllReports(): Promise<Report[]>;
  updateReportStatus(id: string, status: string): Promise<Report | undefined>;

  // Evidence operations
  addEvidence(evidence: InsertEvidence): Promise<Evidence>;
  getEvidenceForReport(reportId: string): Promise<Evidence[]>;

  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        id: uuid(),
        role: "admin"
      })
      .returning();
    return user;
  }

  async createReport(report: InsertReport): Promise<Report> {
    const [newReport] = await db
      .insert(reports)
      .values({
        ...report,
        id: uuid(),
        anonymousToken: uuid(),
        status: "pending",
        createdAt: new Date(),
      })
      .returning();
    return newReport;
  }

  async getReport(id: string): Promise<Report | undefined> {
    const [report] = await db.select().from(reports).where(eq(reports.id, id));
    return report;
  }

  async getReportByToken(token: string): Promise<Report | undefined> {
    const [report] = await db
      .select()
      .from(reports)
      .where(eq(reports.anonymousToken, token));
    return report;
  }

  async getAllReports(): Promise<Report[]> {
    return db.select().from(reports);
  }

  async updateReportStatus(id: string, status: string): Promise<Report | undefined> {
    const [updated] = await db
      .update(reports)
      .set({ status })
      .where(eq(reports.id, id))
      .returning();
    return updated;
  }

  async addEvidence(insertEvidence: InsertEvidence): Promise<Evidence> {
    const [newEvidence] = await db
      .insert(evidence)
      .values({
        ...insertEvidence,
        id: uuid(),
        uploadedAt: new Date(),
      })
      .returning();
    return newEvidence;
  }

  async getEvidenceForReport(reportId: string): Promise<Evidence[]> {
    return db.select().from(evidence).where(eq(evidence.reportId, reportId));
  }
}

export const storage = new DatabaseStorage();