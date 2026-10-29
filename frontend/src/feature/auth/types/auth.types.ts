
export type Gender = "male" | "female";

export interface SignupFormData {
  name: string;
  gender: Gender | "";
  cnic: string;
  district: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginFormData {
  cnic: string;
  password: string;
}

export interface ApiResponse {
  message?: string;
  token?: string;
  user?: Record<string, unknown>;
  [key: string]: unknown;
}

export type ToastType = "success" | "error";
