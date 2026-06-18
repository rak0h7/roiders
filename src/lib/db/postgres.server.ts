import "server-only";
import pg from "pg";
import { resolveDatabaseUrls } from "@/lib/db/connection";

let pool: pg.Pool | null = null;
let poolUrl: string | null = null;

export function isPostgresConfigured(): boolean {
  return resolveDatabaseUrls().length > 0;
}

async function connectPg(): Promise<pg.Pool> {
  if (pool) return pool;

  const urls = resolveDatabaseUrls();
  if (urls.length === 0) {
    throw new Error("Missing DATABASE_URL");
  }

  const errors: string[] = [];
  for (const connectionString of urls) {
    const candidate = new pg.Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 2,
    });

    try {
      const client = await candidate.connect();
      client.release();
      pool = candidate;
      poolUrl = connectionString;
      return pool;
    } catch (err) {
      errors.push(
        `${connectionString.replace(/:[^:@]+@/, ":***@")}: ${err instanceof Error ? err.message : String(err)}`,
      );
      await candidate.end().catch(() => undefined);
    }
  }

  throw new Error(`Could not connect to Postgres:\n${errors.join("\n")}`);
}

export function getPgPool(): pg.Pool {
  if (!pool) {
    throw new Error("Postgres pool not initialized — call queryPg() first");
  }
  return pool;
}

export async function queryPg<T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<pg.QueryResult<T>> {
  const activePool = await connectPg();
  const client = await activePool.connect();
  try {
    return await client.query<T>(text, params);
  } finally {
    client.release();
  }
}

export function getActiveDatabaseUrl(): string | null {
  return poolUrl;
}