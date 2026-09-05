import "dotenv/config";
import pg from "pg";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
const isSSL = process.env.NODE_ENV === "production" || connectionString?.includes("sslmode=") || connectionString?.includes("render.com");

const pool = new pg.Pool({
  connectionString,
  ssl: isSSL ? { rejectUnauthorized: false } : false,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default prisma;