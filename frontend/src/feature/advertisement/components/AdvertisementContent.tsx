"use client";

import { useEffect, useState } from "react";

interface Advertisement {
  _id?: string;
  id?: string | number;
  title: string;
  description: string;
  image?: string;
  imageUrl?: string;
  lastDate?: string;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  link?: string;
  pdf?: string;
}

export default function AdvertisementContent() {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function fetchAdvertisements() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        if (!apiUrl) {
          throw new Error(
            "Advertisement API URL is not configured. Check .env.local."
          );
        }

        const baseUrl = apiUrl.replace(/\/+$/, "");

        const response = await fetch(`${baseUrl}/api/ads`, {
          method: "GET",
          cache: "no-store",
          headers: { Accept: "application/json" },
        });

        if (!response.ok) {
          throw new Error(
            `Unable to load advertisements. Server returned ${response.status}.`
          );
        }

        const contentType = response.headers.get("content-type");

        if (!contentType?.includes("application/json")) {
          throw new Error(
            "Backend ne JSON response nahi diya. API route check karein."
          );
        }

        const result = await response.json();

        const items: Advertisement[] = Array.isArray(result)
          ? result
          : Array.isArray(result.advertisements)
            ? result.advertisements
            : Array.isArray(result.data)
              ? result.data
              : [];

        if (active) {
          setAdvertisements(items);
          setError("");
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong while loading advertisements."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchAdvertisements();

    return () => {
      active = false;
    };
  }, []);

  const getFileUrl = (path?: string) => {
    if (!path) return undefined;
    if (/^https?:\/\//i.test(path)) return path;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) return path;

    return `${apiUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
  };

  // Format: MM/DD/YYYY  (e.g. 10/27/2026)
  const formatDate = (date?: string) => {
    if (!date) return "";

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return date;

    return parsedDate.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  return (
    <main className="mx-auto my-12 w-full max-w-[1140px] flex-1 px-4 sm:my-16">
      <h1 className="mb-8 text-center text-3xl font-bold leading-tight text-[#212529] sm:text-4xl">
        Current Advertisements
      </h1>

      {loading && (
        <div
          className="flex flex-col items-center justify-center py-16"
          role="status"
        >
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#ffc107]" />
          <p className="mt-4 text-sm text-gray-600">
            Loading advertisements...
          </p>
        </div>
      )}

      {!loading && error && (
        <div
          className="rounded-lg border border-red-200 bg-red-50 p-6 text-center"
          role="alert"
        >
          <h2 className="text-lg font-bold text-red-700">
            Unable to Load Advertisements
          </h2>
          <p className="mt-2 text-sm leading-6 text-red-600">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 rounded-md bg-red-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-800"
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && advertisements.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white px-5 py-14 text-center shadow-sm">
          <h2 className="text-xl font-bold text-gray-800">
            No Advertisements Available
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-600">
            Current advertisements will appear here when they are published.
            Please check back later.
          </p>
        </div>
      )}

      {!loading && !error && advertisements.length > 0 && (
        <div className="space-y-5">
          {advertisements.map((advertisement, index) => {
            const imageSrc = getFileUrl(
              advertisement.imageUrl || advertisement.image
            );
            const pdfUrl = getFileUrl(advertisement.pdf);
            const postedOn = advertisement.startDate || advertisement.createdAt;
            const lastDate = advertisement.lastDate || advertisement.endDate;

            return (
              <article
                key={
                  advertisement._id ??
                  advertisement.id ??
                  `${advertisement.title}-${index}`
                }
                className="rounded-lg border border-gray-300 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.12)]"
              >
                <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-6">
                  {/* Left: text content */}
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-medium leading-tight text-[#212529]">
                      {advertisement.title}
                    </h2>

                    <p className="mt-3 whitespace-pre-line text-base text-[#212529]">
                      {advertisement.description}
                    </p>

                    {(postedOn || lastDate) && (
                      <p className="mt-5 text-sm text-gray-600">
                        {postedOn && <>Posted on: {formatDate(postedOn)}</>}
                        {postedOn && lastDate && " | "}
                        {lastDate && <>Last date: {formatDate(lastDate)}</>}
                      </p>
                    )}

                    <div className="mt-5 flex flex-wrap gap-3">
                      <a
                        href="/login"
                        className="inline-flex items-center justify-center rounded-md border border-[#ffc107] bg-[#ffc107] px-4 py-2 text-base text-white transition hover:border-[#e0a800] hover:bg-[#e0a800]"
                      >
                        Apply Online
                      </a>

                      {pdfUrl && (
                        <a
                          href={pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center rounded-md border border-[#ffc107] bg-white px-4 py-2 text-base text-[#ffc107] transition hover:bg-[#ffc107] hover:text-white"
                        >
                          Download PDF
                        </a>
                      )}

                      {advertisement.link && (
                        <a
                          href={getFileUrl(advertisement.link)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base text-gray-700 transition hover:bg-gray-100"
                        >
                          View Details
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Right: image */}
                  {imageSrc && (
                    <div className="flex shrink-0 items-center justify-center sm:w-[260px] md:w-[300px]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageSrc}
                        alt={advertisement.title}
                        className="max-h-[160px] w-auto max-w-full object-contain"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}