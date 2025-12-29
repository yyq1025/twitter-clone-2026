import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";

config({ path: ".env" });

export const db = drizzle({
  connection: process.env.DATABASE_URL!,
});
