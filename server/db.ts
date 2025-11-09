import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@shared/schema";

// DATABASE_URL is required at runtime. Use the typed helper so TS knows it's present.
const databaseUrl = getEnv('DATABASE_URL');
const sql = neon(databaseUrl);
export const db = drizzle(sql, { schema });
