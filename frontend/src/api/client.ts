const API_URL = import.meta.env.VITE_API_URL;

export class ApiError extends Error {
  status: number;

  constructor(
    status: number,
    message: string,
  ) {
    super(message);

    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);

  if (
    options.body !== undefined &&
    !(options.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set(
      "Content-Type",
      "application/json",
    );
  }

  const response = await fetch(
    `${API_URL}${path}`,
    {
      ...options,
      headers,
      credentials: "include",
    },
  );

  if (!response.ok) {
    let message = "Something went wrong";

    try {
      const data = (await response.json()) as {
        detail?: unknown;
      };

      if (typeof data.detail === "string") {
        message = data.detail;
      }
    } catch {
      // The response body was not valid JSON.
    }

    throw new ApiError(
      response.status,
      message,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}