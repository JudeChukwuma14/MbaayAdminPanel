import axios, { AxiosHeaders, InternalAxiosRequestConfig } from "axios";
import { jwtDecode, JwtPayload } from "jwt-decode";
import store from "../components/redux/store";
import { logout, updateTokens } from "../components/redux/slices/adminSlice";

const REFRESH_URL = "https://ilosiwaju-mbaay-2025.com/api/v1/admin/refresh_token";
const PUBLIC_ENDPOINTS = new Set(["/login_admin", "/create_admin"]);

export interface AdminTokenClaims extends JwtPayload {
  role?: string;
}

type AuthRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
  _sessionVersion?: number;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function firstToken(...values: unknown[]): string | null {
  return values.find((value): value is string =>
    typeof value === "string" && value.trim().length > 0
  ) ?? null;
}

export function getSessionTokens(response: unknown) {
  const body = asRecord(response);
  const data = asRecord(body.data);
  return {
    token: firstToken(body.accessToken, data.accessToken, body.token, data.token),
    refreshToken: firstToken(body.refreshToken, data.refreshToken),
  };
}

export function isAdminRole(role: unknown): role is string {
  return role === "Admin" || role === "Super Admin" || role === "Customer care";
}

export function isAccessTokenExpired(token: string | null): boolean {
  if (!token) return true;
  try {
    const { exp } = jwtDecode<AdminTokenClaims>(token);
    return exp !== undefined && (!Number.isFinite(exp) || exp * 1000 <= Date.now());
  } catch {
    return true;
  }
}

function isTokenError(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false;
  const status = error.response?.status;
  const message = asRecord(error.response?.data).message;
  return status === 401 || (status === 403 && typeof message === "string" &&
    /jwt expired|jwt malformed|invalid (?:access )?token|(?:access )?token (?:has )?expired|invalid signature/i.test(message));
}

function isRefreshRejected(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false;
  const status = error.response?.status;
  const message = asRecord(error.response?.data).message;
  return status === 401 || status === 403 || (status === 400 &&
    typeof message === "string" && /invalid|expired|revoked/i.test(message) &&
    /token/i.test(message));
}

let pendingRefresh: {
  token: string | null;
  refreshToken: string;
  sessionVersion: number;
  promise: Promise<string>;
} | null = null;

export function refreshAdminSession(): Promise<string> {
  const session = store.getState().admin;
  const { token, refreshToken } = session;
  const sessionVersion = session.sessionVersion ?? 0;
  if (!refreshToken) {
    store.dispatch(logout());
    return Promise.reject(new Error("Your session has expired. Please log in again."));
  }

  if (pendingRefresh?.token === token && pendingRefresh.refreshToken === refreshToken &&
    pendingRefresh.sessionVersion === sessionVersion) {
    return pendingRefresh.promise;
  }

  const isCurrentSession = () => {
    const current = store.getState().admin;
    return current.token === token && current.refreshToken === refreshToken &&
      (current.sessionVersion ?? 0) === sessionVersion;
  };

  const refresh = {
    token,
    refreshToken,
    sessionVersion,
    promise: Promise.resolve(""),
  };
  refresh.promise = (async () => {
    try {
      // Refresh tokens may be opaque. The server validates them.
      const response = await axios.post(REFRESH_URL, { refreshToken });
      const renewed = getSessionTokens(response.data);
      if (!renewed.token || isAccessTokenExpired(renewed.token)) {
        throw new Error("The server did not return a valid access token.");
      }
      if (!isCurrentSession()) {
        throw new Error("The session changed while renewing it.");
      }

      const claims = jwtDecode<AdminTokenClaims>(renewed.token);
      store.dispatch(updateTokens({
        token: renewed.token,
        refreshToken: renewed.refreshToken ?? undefined,
        role: claims.role,
      }));
      return renewed.token;
    } catch (error) {
      // An offline connection or server outage must not erase a saved session.
      if (isCurrentSession() && isRefreshRejected(error)) {
        store.dispatch(logout());
      }
      throw error;
    } finally {
      if (pendingRefresh === refresh) pendingRefresh = null;
    }
  })();
  pendingRefresh = refresh;
  return refresh.promise;
}

export function createAuthenticatedApi(baseURL: string) {
  const instance = axios.create({ baseURL });

  instance.interceptors.request.use(async (config: AuthRequestConfig) => {
    if (PUBLIC_ENDPOINTS.has(config.url ?? "")) return config;

    const session = store.getState().admin;
    if (config._sessionVersion !== undefined &&
      config._sessionVersion !== (session.sessionVersion ?? 0)) {
      throw new Error("The session changed before retrying the request.");
    }
    let token = session.token;
    if (token && isAccessTokenExpired(token)) {
      token = await refreshAdminSession();
    }
    if ((store.getState().admin.sessionVersion ?? 0) !== (session.sessionVersion ?? 0)) {
      throw new Error("The session changed before sending the request.");
    }

    config.headers = AxiosHeaders.from(config.headers);
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
      config._sessionVersion = session.sessionVersion ?? 0;
    } else {
      config.headers.delete("Authorization");
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
      if (!axios.isAxiosError(error)) throw error;
      const config = error.config as AuthRequestConfig | undefined;
      if (!config || PUBLIC_ENDPOINTS.has(config.url ?? "") || !isTokenError(error)) {
        throw error;
      }

      const session = store.getState().admin;
      const sentToken = AxiosHeaders.from(config.headers).get("Authorization");
      if (!sentToken || !session.token) throw error;

      // A late response from a logged-out or replaced account cannot renew it.
      const sameSession = config._sessionVersion === (session.sessionVersion ?? 0);
      if (!sameSession) throw error;
      if (config._retry) {
        if (sentToken === `Bearer ${session.token}`) store.dispatch(logout());
        throw error;
      }

      config._retry = true;
      // Another request may already have renewed this access token.
      const token = sentToken !== `Bearer ${session.token}` && !isAccessTokenExpired(session.token)
        ? session.token
        : await refreshAdminSession();
      config.headers = AxiosHeaders.from(config.headers);
      config.headers.set("Authorization", `Bearer ${token}`);
      return instance(config);
    },
  );

  return instance;
}
