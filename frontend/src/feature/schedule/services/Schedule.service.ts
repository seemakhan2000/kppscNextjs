
import type { Schedule } from "../types/schedule";

const BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || ""
).replace(/\/+$/, "");

const API_URL = BASE_URL.endsWith("/api")
  ? BASE_URL
  : `${BASE_URL}/api`;

export async function fetchSchedules(): Promise<Schedule[]> {
  const response = await fetch(`${API_URL}/schedules`, {
    cache: "no-store",
  });

  const result = await response.json();

  if (!response.ok || result?.success === false) {
    throw new Error(result?.message || "Failed to fetch schedules.");
  }

  return result.data;
}

export async function createSchedule(data: FormData) {
  const response = await fetch(`${API_URL}/schedules`, {
    method: "POST",
    body: data,
  });

  const result = await response.json();

  if (!response.ok || result?.success === false) {
    throw new Error(result?.message || "Failed to create schedule.");
  }

  return result;
}

export async function updateSchedule(id: string, data: FormData) {
  const response = await fetch(
    `${API_URL}/schedules/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      body: data,
    }
  );

  const result = await response.json();

  if (!response.ok || result?.success === false) {
    throw new Error(result?.message || "Failed to update schedule.");
  }

  return result;
}

export async function deleteSchedule(id: string) {
  const response = await fetch(
    `${API_URL}/schedules/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    }
  );

  const result = await response.json();

  if (!response.ok || result?.success === false) {
    throw new Error(result?.message || "Failed to delete schedule.");
  }

  return result;
}

export function formatDate(value: string | Date | undefined): string {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function getFileUrl(pdf?: string): string {
  if (!pdf) return "";

  if (/^https?:\/\//i.test(pdf)) {
    return pdf;
  }

  return `${BASE_URL}/${pdf.replace(/^\/+/, "")}`;
}
