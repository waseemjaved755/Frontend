const API_URL = resolveApiUrl();

function resolveApiUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (raw) {
    return raw.replace(/\/$/, "");
  }
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:8000";
  }
  return "";
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export type ApiResponseMeta = {
  photoCache?: string | null;
  commentsCache?: string | null;
};

type RequestOptions = {
  method?: string;
  token?: string;
  body?: unknown;
  onMeta?: (meta: ApiResponseMeta) => void;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (!API_URL) {
    throw new ApiError(
      "NEXT_PUBLIC_API_URL is not set. Add your deployed backend URL in Vercel → Environment Variables.",
      0,
    );
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(text || response.statusText, response.status);
  }

  options.onMeta?.({
    photoCache: response.headers.get("X-Photo-Cache"),
    commentsCache: response.headers.get("X-Comments-Cache"),
  });

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
