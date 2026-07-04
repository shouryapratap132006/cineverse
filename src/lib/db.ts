import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prismaInstance: PrismaClient;

if (typeof window === "undefined") {
  // Instantiated only on the server
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL || "postgresql://shouryapratap@localhost:5432/cineverse",
  });
  const adapter = new PrismaPg(pool);
  
  prismaInstance = globalForPrisma.prisma ?? new PrismaClient({ adapter });
  
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prismaInstance;
  }
} else {
  // Prevent client-side execution crashes
  prismaInstance = null as any;
}

export const db = prismaInstance;
export default db;
