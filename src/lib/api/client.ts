/**
 * HTTP client for ventura-api, client-held bearer model.
 *
 * Mirrors the mobile reference (`lib/core/data/network/api_client.dart`):
 *  - attaches `Authorization: Bearer <accessToken>` to every non-/auth request
 *  - on a 401, refreshes once via `POST /auth/refresh` and retries the request
 *  - single-flight refresh: concurrent 401s share one refresh round-trip
 *  - on refresh failure, clears tokens and notifies the app (sign-out)
 */
import { env } from "@/lib/env";
import { tokenStore } from "@/lib/api/tokens";
import { ApiError, failureFromResponse, networkFailure } from "@/lib/api/errors";

export type Query = Record<string, string | number | boolean | undefined | null>;

export interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  /** JSON body; serialized automatically. */
  body?: unknown;
  query?: Query;
  /** Skip bearer attachment + refresh (used for /auth endpoints). */
  auth?: boolean;
  signal?: AbortSignal;
}

/** App-level sign-out hook, registered by the auth layer. */
let onAuthLost: (() => void) | null = null;
export function setOnAuthLost(cb: (() => void) | null): void {
  onAuthLost = cb;
}

function buildUrl(path: string, query?: Query): string {
  const url = new URL(`${env.apiBaseUrl}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

async function parseBody(res: Response): Promise<unknown> {
  if (res.status === 204) return null;
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// Single-flight refresh: all concurrent 401s await the same promise.
let refreshing: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) return false;

  try {
    const res = await fetch(buildUrl("/auth/refresh"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${refreshToken}`,
      },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const data = (await parseBody(res)) as {
      accessToken?: string;
      refreshToken?: string;
    } | null;
    if (!data?.accessToken || !data?.refreshToken) return false;
    tokenStore.save(data.accessToken, data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

async function doFetch(
  path: string,
  options: RequestOptions,
  attachToken: boolean,
): Promise<Response> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (attachToken) {
    const token = tokenStore.getAccess();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  return fetch(buildUrl(path, options.query), {
    method: options.method ?? "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  });
}

/**
 * Perform a request against ventura-api and return the parsed JSON body.
 * Throws an {@link ApiError} on any non-2xx response or network failure.
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const useAuth = options.auth ?? !path.startsWith("/auth/");

  let res: Response;
  try {
    res = await doFetch(path, options, useAuth);
  } catch {
    throw networkFailure();
  }

  // 401 on an authed request → refresh once, then retry.
  if (res.status === 401 && useAuth) {
    refreshing ??= refreshTokens().finally(() => {
      refreshing = null;
    });
    const refreshed = await refreshing;

    if (refreshed) {
      try {
        res = await doFetch(path, options, true);
      } catch {
        throw networkFailure();
      }
    } else {
      tokenStore.clear();
      onAuthLost?.();
      throw new ApiError("auth", "Your session has expired.", 401);
    }
  }

  const body = await parseBody(res);
  if (!res.ok) throw failureFromResponse(res.status, body);
  return body as T;
}
