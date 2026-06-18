export function projectRefFromUrl(url: string | undefined): string | null {
  return (url ?? "").match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] ?? null;
}

export function projectRefFromHost(host: string | undefined): string | null {
  if (!host) return null;
  return host.match(/^db\.([^.]+)\.supabase\.co$/)?.[1] ?? null;
}