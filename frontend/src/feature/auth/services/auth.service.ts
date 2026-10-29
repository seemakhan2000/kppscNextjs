
import type {
  ApiResponse,
  LoginFormData,
  SignupFormData,
} from "../types/auth.types";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

async function postRequest<T>(
  endpoint: string,
  payload: T
): Promise<ApiResponse> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const contentType = response.headers.get("content-type") || "";

  let result: ApiResponse = {};

  if (contentType.includes("application/json")) {
    result = await response.json();
  } else {
    const responseText = await response.text();

    console.error("API response:", responseText);

    result.message = `Server returned status ${response.status}`;
  }

  if (!response.ok) {
    throw new Error(
      typeof result.message === "string"
        ? result.message
        : `Request failed: ${response.status}`
    );
  }

  return result;
}

// confirmPassword is not sent to the backend.
export function registerUser(
  data: Omit<SignupFormData, "confirmPassword">
): Promise<ApiResponse> {
  return postRequest("/api/users/register", data);
}

export function loginUser(
  data: LoginFormData
): Promise<ApiResponse> {
  return postRequest("/api/login", data);
}
