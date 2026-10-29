
import type { Schedule } from "../types/schedule";

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "")
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

export function getFileUrl(path?: string) {
  if (!path) return undefined;

  if (/^https?:\/\//i.test(path)) return path;

  return `${API_URL}/${path.replace(/^\/+/, "")}`;
}

export function formatDate(date?: string) {
  if (!date) return "";

  const d = new Date(date);

  if (Number.isNaN(d.getTime())) return date;

  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

async function parse<T>(response: Response): Promise<T> {
  const json = await response.json().catch(() => null);

  if (!response.ok || !json?.success) {
    throw new Error(
      json?.message ?? `Request failed (${response.status}).`
    );
  }

  return json.data as T;
}

function requireApiUrl() {
  if (!API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not configured in .env.local"
    );
  }
}

// Public: fetch schedules
export async function fetchSchedules(): Promise<Schedule[]> {
  requireApiUrl();

  const response = await fetch(`${API_URL}/api/schedules`, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  return parse<Schedule[]>(response);
}

// Create schedule without JWT
export async function createSchedule(
  formData: FormData
): Promise<Schedule> {
  requireApiUrl();

  const response = await fetch(`${API_URL}/api/schedules`, {
    method: "POST",
    body: formData,
  });

  return parse<Schedule>(response);
}

// Update schedule without JWT
export async function updateSchedule(
  id: string,
  formData: FormData
): Promise<Schedule> {
  requireApiUrl();

  const response = await fetch(
    `${API_URL}/api/schedules/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      body: formData,
    }
  );

  return parse<Schedule>(response);
}

// Delete schedule without JWT
export async function deleteSchedule(id: string): Promise<void> {
  requireApiUrl();

  const response = await fetch(
    `${API_URL}/api/schedules/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    }
  );

  await parse<null>(response);
}
