const BASE_URL = "https://api.football-data.org/v4";

export async function footballServerFetch<T>(
  path: string,

  options?: {
    revalidate?: number;

    cache?: RequestCache;
  },
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "X-Auth-Token": process.env.NEXT_PUBLIC_FOOTBALL_API_KEY!,
    },

    cache: options?.cache,

    next:
      options?.revalidate !== undefined
        ? { revalidate: options.revalidate }
        : undefined,
  });

  if (!res.ok) {
    throw new Error(`Football API Error: ${res.status}`);
  }

  return res.json();
}
