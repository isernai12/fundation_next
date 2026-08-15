import { ApiError } from "./errors";

export interface RequestOptions extends Omit<RequestInit, "body"> {
  params?: Record<string, string | number | boolean | undefined | null>;
  body?: any;
  token?: string;
  timeoutMs?: number;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    if (baseUrl !== undefined) {
      this.baseUrl = baseUrl.replace(/\/$/, "");
    } else if (typeof window !== "undefined") {
      // In browser environment, use empty string to fetch via same-origin relative URLs
      this.baseUrl = "";
    } else {
      // In server environment (SSR / Server Actions), connect to backend FastAPI instance
      const defaultUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        process.env.INTERNAL_API_URL ||
        process.env.FASTAPI_INTERNAL_URL ||
        "http://127.0.0.1:8000";
      this.baseUrl = defaultUrl.replace(/\/$/, "");
    }
  }

  private buildUrl(path: string, params?: Record<string, any>): string {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    let url: URL;

    if (typeof window !== "undefined") {
      const base = this.baseUrl || window.location.origin;
      url = new URL(cleanPath, base);
    } else {
      url = new URL(`${this.baseUrl}${cleanPath}`);
    }

    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
          url.searchParams.append(key, String(val));
        }
      });
    }

    return url.toString();
  }

  async request<T = any>(path: string, options: RequestOptions = {}): Promise<T> {
    const { params, body, token, timeoutMs = 15000, headers = {}, ...fetchOptions } = options;

    const url = this.buildUrl(path, params);

    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

    const reqHeaders: Record<string, string> = {
      Accept: "application/json",
      ...(headers as Record<string, string>),
    };

    if (!isFormData && !reqHeaders["Content-Type"]) {
      reqHeaders["Content-Type"] = "application/json";
    }

    if (token) {
      reqHeaders["Authorization"] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: reqHeaders,
        body: isFormData ? body : (body !== undefined ? JSON.stringify(body) : undefined),
        signal: controller.signal,
        credentials: "include",
      });

      clearTimeout(timer);

      // Handle 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      const contentType = response.headers.get("content-type");
      let data: any = null;

      if (contentType && contentType.includes("application/json")) {
        data = await response.json().catch(() => null);
      } else {
        const text = await response.text().catch(() => "");
        data = { message: text };
      }

      if (!response.ok) {
        const errorMessage =
          data?.detail ||
          data?.message ||
          data?.error ||
          `Request failed with status ${response.status}`;
        throw new ApiError(
          typeof errorMessage === "string" ? errorMessage : JSON.stringify(errorMessage),
          response.status,
          data,
          data?.code
        );
      }

      return data as T;
    } catch (err: any) {
      clearTimeout(timer);
      if (err.name === "AbortError") {
        throw new ApiError("Request timed out", 408);
      }
      if (err instanceof ApiError) {
        throw err;
      }
      throw new ApiError(err.message || "Network request failed", 500);
    }
  }

  get<T = any>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: "GET" });
  }

  post<T = any>(path: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: "POST", body });
  }

  patch<T = any>(path: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: "PATCH", body });
  }

  put<T = any>(path: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: "PUT", body });
  }

  delete<T = any>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
