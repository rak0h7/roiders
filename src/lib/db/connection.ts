function projectRefFromUrl(url: string | undefined): string | null {
  return (url ?? "").match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] ?? null;
}

function projectRefFromHost(host: string | undefined): string | null {
  if (!host) return null;
  const direct = host.match(/^db\.([^.]+)\.supabase\.co$/)?.[1];
  if (direct) return direct;
  return null;
}

/** Build candidate Postgres URLs — pooler first on Vercel (direct host often unreachable). */
export function resolveDatabaseUrls(): string[] {
  const password = process.env.POSTGRES_PASSWORD ?? process.env.SUPABASE_DB_PASSWORD;
  const projectRef =
    projectRefFromUrl(process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL) ??
    projectRefFromHost(process.env.POSTGRES_HOST);

  const urls: string[] = [];
  const onVercel = Boolean(process.env.VERCEL);

  if (password && projectRef) {
    const enc = encodeURIComponent(password);
    const poolers = [
      `postgresql://postgres.${projectRef}:${enc}@aws-0-eu-west-1.pooler.supabase.com:6543/postgres`,
      `postgresql://postgres.${projectRef}:${enc}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
      `postgresql://postgres.${projectRef}:${enc}@aws-0-us-west-1.pooler.supabase.com:6543/postgres`,
    ];
    const direct = `postgresql://postgres:${enc}@db.${projectRef}.supabase.co:5432/postgres`;

    if (onVercel) urls.push(...poolers, direct);
    else urls.push(direct, ...poolers);
  }

  for (const candidate of [
    process.env.DATABASE_URL,
    process.env.SUPABASE_DB_URL,
    process.env.POSTGRES_URL,
    process.env.POSTGRES_URL_NON_POOLING,
  ]) {
    if (candidate?.trim() && !urls.includes(candidate)) urls.push(candidate);
  }

  const host = process.env.POSTGRES_HOST;
  if (host && password && !urls.some((u) => u.includes(host))) {
    const enc = encodeURIComponent(password);
    const user = process.env.POSTGRES_USER ?? "postgres";
    const database = process.env.POSTGRES_DATABASE ?? "postgres";
    urls.push(`postgresql://${user}:${enc}@${host}:5432/${database}`);
  }

  return urls;
}