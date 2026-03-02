import { db } from "./db";
import {
  users,
  scanHistory,
  type User,
  type InsertUser,
  type UpdateUserRequest,
  type ScanHistory,
  type InsertScanHistory
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: UpdateUserRequest): Promise<User>;
  
  createScanHistory(history: InsertScanHistory): Promise<ScanHistory>;
  getUserScanHistory(userId: number): Promise<ScanHistory[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, userUpdates: UpdateUserRequest): Promise<User> {
    const [user] = await db.update(users)
      .set(userUpdates)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async createScanHistory(history: InsertScanHistory): Promise<ScanHistory> {
    const [scan] = await db.insert(scanHistory).values(history).returning();
    return scan;
  }

  async getUserScanHistory(userId: number): Promise<ScanHistory[]> {
    return await db.select()
      .from(scanHistory)
      .where(eq(scanHistory.userId, userId));
  }
}

export const storage = new DatabaseStorage();
