import { apiRequest, type ApiResponseMeta } from "@/lib/api/client";
import { getAccessToken } from "@/lib/auth/access-token";

type AuthenticatedRequestOptions = {
  method?: string;
  body?: unknown;
  onMeta?: (meta: ApiResponseMeta) => void;
};

export async function apiRequestAuth<T>(
  path: string,
  options: AuthenticatedRequestOptions = {},
): Promise<T> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error("You must be signed in.");
  }
  return apiRequest<T>(path, { ...options, token });
}
