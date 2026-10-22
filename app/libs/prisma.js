import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../../generated/prisma/client.ts";
import fs from "node:fs"
import path from "node:path"

const caPath = path.resolve(process.cwd(), process.env.CA)

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  ssl: {
    ca: fs.readFileSync(caPath)
  },
  connectionLimit: 5,
});
const prisma = new PrismaClient({ adapter });

export { prisma };