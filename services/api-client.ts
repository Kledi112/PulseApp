import { useConnectionErrorStore } from '@/store/connection-error-store';
import { useLoadingStore } from '@/store/loading-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function clearAuthToken() {
  authToken = null;
}

// Every screen's data fetch goes through this one function, so this is the single
// place that needs to detect "can't reach the backend at all" and tell the user -
// individual screens still get the rejected promise to handle their own state
// (clearing a list, resetting a loading flag, etc.) but don't need to show their
// own "can't connect" message anymore.
const MAX_ATTEMPTS = 3;
const ATTEMPT_TIMEOUT_MS = 1500; // 3 attempts x 1.5s = 4.5s worst case, under the 5s budget

let lastConnectionAlertAt = 0;
const CONNECTION_ALERT_COOLDOWN_MS = 6000;

function notifyConnectionError() {
  const now = Date.now();
  if (now - lastConnectionAlertAt < CONNECTION_ALERT_COOLDOWN_MS) return;
  lastConnectionAlertAt = now;
  useConnectionErrorStore.getState().show('Connection problem', 'There was a problem, please try again later.');
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function request<T>(path: string, options: RequestInit = {}, attemptTimeoutMs: number = ATTEMPT_TIMEOUT_MS): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const fetchOptions: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(options.headers ?? {}),
    },
  };

  // Every request bumps a shared counter so a single full-screen overlay
  // (GlobalLoadingOverlay) can cover any in-flight fetch app-wide, instead of
  // each screen building its own loading UI.
  useLoadingStore.getState().start();
  try {
    let response: Response | undefined;
    let networkError: unknown;

    // Retry only on network-level failures (unreachable/timed out) - a real HTTP error
    // response (401, 404, ...) means the backend IS reachable, so retrying won't help.
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      try {
        response = await fetchWithTimeout(url, fetchOptions, attemptTimeoutMs);
        networkError = undefined;
        break;
      } catch (err) {
        networkError = err;
      }
    }

    if (!response) {
      notifyConnectionError();
      throw networkError;
    }

    if (!response.ok) {
      const body = await response.text();
      let detail = body;
      try {
        const parsed = JSON.parse(body);
        if (typeof parsed?.detail === 'string') detail = parsed.detail;
      } catch {
        // body wasn't JSON - fall back to the raw text above
      }
      const error = new Error(detail || `API request to ${path} failed (${response.status})`) as Error & {
        status?: number;
        detail?: string;
      };
      error.status = response.status;
      error.detail = detail;
      throw error;
    }
    if (response.status === 204) return undefined as T;
    return response.json() as Promise<T>;
  } finally {
    useLoadingStore.getState().finish();
  }
}

export const api = {
  get: <T>(path: string, timeoutMs?: number) => request<T>(path, {}, timeoutMs),
  post: <T>(path: string, body?: unknown, timeoutMs?: number) =>
    request<T>(path, { method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined }, timeoutMs),
  put: <T>(path: string, body?: unknown, timeoutMs?: number) =>
    request<T>(path, { method: 'PUT', body: body !== undefined ? JSON.stringify(body) : undefined }, timeoutMs),
};
