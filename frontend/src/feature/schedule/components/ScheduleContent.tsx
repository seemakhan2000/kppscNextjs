
"use client";

import { useCallback, useEffect, useState } from "react";
import type { Schedule } from "../types/schedule";
import {
  fetchSchedules,
  formatDate,
  getFileUrl,
} from "../services/Schedule.service";

const tableHeadings = [
  "#",
  "Post / Exam",
  "Application Start Date",
  "Application End Date",
  "Exam Date",
  "Download",
];

export default function ScheduleContent() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSchedules = useCallback(async () => {
    try {
      setError("");
      const data = await fetchSchedules();
      setSchedules(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load exam schedules."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSchedules();
  }, [loadSchedules]);

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-center text-2xl font-semibold text-gray-800 sm:text-3xl">
        Exam Schedule
      </h1>

      <div className="overflow-x-auto rounded-sm border border-gray-300">
        <table className="w-full min-w-[850px] border-collapse text-left text-sm text-gray-800">
          <thead className="bg-[#d1e7dd] text-gray-900">
            <tr>
              {tableHeadings.map((heading) => (
                <th
                  key={heading}
                  scope="col"
                  className="border border-gray-300 px-4 py-3 font-semibold"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td
                  colSpan={6}
                  className="border border-gray-300 px-4 py-10 text-center text-gray-500"
                >
                  Loading exam schedules...
                </td>
              </tr>
            )}

            {!loading && error && (
              <tr>
                <td
                  colSpan={6}
                  className="border border-gray-300 px-4 py-8 text-center text-red-600"
                >
                  <p>{error}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setLoading(true);
                      void loadSchedules();
                    }}
                    className="mt-3 rounded bg-green-800 px-4 py-2 text-white hover:bg-green-900"
                  >
                    Try Again
                  </button>
                </td>
              </tr>
            )}

            {!loading && !error && schedules.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="border border-gray-300 px-4 py-10 text-center text-gray-500"
                >
                  No exam schedules are currently available.
                </td>
              </tr>
            )}

            {!loading &&
              !error &&
              schedules.map((exam, index) => (
                <tr
                  key={exam._id}
                  className={
                    index % 2 === 0
                      ? "bg-white hover:bg-green-50"
                      : "bg-gray-50 hover:bg-green-50"
                  }
                >
                  <td className="border border-gray-300 px-4 py-3">
                    {index + 1}
                  </td>

                  <td className="border border-gray-300 px-4 py-3 font-medium">
                    {exam.post}
                  </td>

                  <td className="border border-gray-300 px-4 py-3">
                    {formatDate(exam.applicationStart)}
                  </td>

                  <td className="border border-gray-300 px-4 py-3">
                    {formatDate(exam.applicationEnd)}
                  </td>

                  <td className="border border-gray-300 px-4 py-3">
                    {formatDate(exam.examDate)}
                  </td>

                  <td className="border border-gray-300 px-4 py-3">
                    {exam.pdf ? (
                      <a
                        href={getFileUrl(exam.pdf)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex rounded border border-gray-500 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-700 hover:text-white"
                      >
                        PDF
                      </a>
                    ) : (
                      <span
                        title="PDF is not available yet"
                        className="inline-flex cursor-not-allowed rounded border border-gray-300 px-3 py-1.5 text-xs text-gray-400"
                      >
                        PDF
                      </span>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <p className="mt-8 text-center text-sm text-gray-700 sm:text-base">
        For detailed schedule, please contact KPPSC or check the relevant
        official advertisement.
      </p>
    </main>
  );
}
