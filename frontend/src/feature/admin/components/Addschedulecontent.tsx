
"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import type { Schedule } from "../types/schedule";
import {
  createSchedule,
  updateSchedule,
  deleteSchedule,
  fetchSchedules,
  formatDate,
  getFileUrl,
} from "../services/Schedule.service";

const emptyForm = {
  post: "",
  applicationStart: "",
  applicationEnd: "",
  examDate: "",
};

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-700/20";

type Message = {
  type: "success" | "error";
  text: string;
};

function toDateInput(value: string | Date | undefined): string {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export default function AddScheduleContent() {
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [fileKey, setFileKey] = useState(0);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<Message | null>(null);

  const load = useCallback(async () => {
    try {
      setSchedules(await fetchSchedules());
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err instanceof Error
            ? err.message
            : "Failed to load schedules.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const updateField =
    (field: keyof typeof emptyForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const resetForm = () => {
    setForm(emptyForm);
    setFile(null);
    setFileKey((key) => key + 1);
    setEditingId(null);
  };

  const handleEdit = (schedule: Schedule) => {
    setForm({
      post: schedule.post ?? "",
      applicationStart: toDateInput(schedule.applicationStart),
      applicationEnd: toDateInput(schedule.applicationEnd),
      examDate: toDateInput(schedule.examDate),
    });

    setFile(null);
    setFileKey((key) => key + 1);
    setEditingId(schedule._id);
    setMessage(null);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const validate = () => {
    if (!form.post.trim()) {
      return "Post / Exam name is required.";
    }

    if (
      !form.applicationStart ||
      !form.applicationEnd ||
      !form.examDate
    ) {
      return "All dates are required.";
    }

    if (form.applicationEnd < form.applicationStart) {
      return "Application end date cannot be before start date.";
    }

    if (form.examDate < form.applicationEnd) {
      return "Exam date cannot be before application end date.";
    }

    if (file && file.type !== "application/pdf") {
      return "Only PDF files are allowed.";
    }

    if (file && file.size > 5 * 1024 * 1024) {
      return "PDF must be 5 MB or smaller.";
    }

    return null;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);

    const error = validate();

    if (error) {
      setMessage({ type: "error", text: error });
      return;
    }

    const data = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      data.append(key, value);
    });

    if (file) {
      data.append("pdf", file);
    }

    try {
      setSubmitting(true);

      if (editingId) {
        await updateSchedule(editingId, data);

        setMessage({
          type: "success",
          text: "Schedule updated successfully.",
        });
      } else {
        await createSchedule(data);

        setMessage({
          type: "success",
          text: "Schedule added successfully.",
        });
      }

      resetForm();
      await load();
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err instanceof Error
            ? err.message
            : "Failed to save schedule.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (schedule: Schedule) => {
    const confirmed = window.confirm(
      `Delete schedule "${schedule.post}"?`
    );

    if (!confirmed) return;

    setMessage(null);

    try {
      await deleteSchedule(schedule._id);

      setSchedules((prev) =>
        prev.filter((item) => item._id !== schedule._id)
      );

      if (editingId === schedule._id) {
        resetForm();
      }

      setMessage({
        type: "success",
        text: "Schedule deleted successfully.",
      });
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err instanceof Error
            ? err.message
            : "Failed to delete schedule.",
      });
    }
  };

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6">
      <p className="text-sm font-semibold text-green-800">
        KPPSC / Administration
      </p>

      <h1 className="mt-2 text-3xl font-bold text-gray-900">
        Exam Schedule
      </h1>

      <p className="mt-1 text-sm text-gray-600">
        Add, edit, and manage exam schedules shown on the public website.
      </p>

      {message && (
        <div
          role="alert"
          className={`mt-6 rounded-lg border px-4 py-3 text-sm ${
            message.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {editingId ? "Edit Schedule" : "Add New Schedule"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {editingId
                ? "Update the schedule details below."
                : "Enter the exam details and optionally attach a PDF."}
            </p>
          </div>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-5 grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label
              htmlFor="post"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Post / Exam
            </label>

            <input
              id="post"
              type="text"
              maxLength={200}
              required
              value={form.post}
              onChange={updateField("post")}
              className={inputClass}
              placeholder="e.g. Junior Clerk"
            />
          </div>

          <div>
            <label
              htmlFor="start"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Application Start Date
            </label>

            <input
              id="start"
              type="date"
              required
              value={form.applicationStart}
              onChange={updateField("applicationStart")}
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="end"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Application End Date
            </label>

            <input
              id="end"
              type="date"
              required
              min={form.applicationStart || undefined}
              value={form.applicationEnd}
              onChange={updateField("applicationEnd")}
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="exam"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Exam Date
            </label>

            <input
              id="exam"
              type="date"
              required
              min={form.applicationEnd || undefined}
              value={form.examDate}
              onChange={updateField("examDate")}
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="pdf"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              PDF (optional, max 5 MB)
            </label>

            <input
              key={fileKey}
              id="pdf"
              type="file"
              accept="application/pdf,.pdf"
              onChange={(e) =>
                setFile(e.target.files?.[0] ?? null)
              }
              className={`${inputClass} file:mr-3 file:rounded-md file:border-0 file:bg-green-50 file:px-3 file:py-1 file:text-sm file:font-semibold file:text-green-800`}
            />

            {editingId && (
              <p className="mt-1.5 text-xs text-gray-500">
                Select a new PDF only if you want to replace the existing one.
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-3 md:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-green-800 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? "Saving..."
                : editingId
                  ? "Update Schedule"
                  : "Save Schedule"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                disabled={submitting}
                className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900">
            Published Schedules
          </h2>

          <p className="text-sm text-gray-600">
            {schedules.length} total
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left text-sm">
            <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-6 py-3">Post / Exam</th>
                <th className="px-6 py-3">Application Start</th>
                <th className="px-6 py-3">Application End</th>
                <th className="px-6 py-3">Exam Date</th>
                <th className="px-6 py-3">PDF</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    Loading schedules...
                  </td>
                </tr>
              )}

              {!loading && schedules.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    No schedules added yet.
                  </td>
                </tr>
              )}

              {!loading &&
                schedules.map((schedule) => (
                  <tr
                    key={schedule._id}
                    className={`hover:bg-gray-50 ${
                      editingId === schedule._id ? "bg-green-50" : ""
                    }`}
                  >
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {schedule.post}
                    </td>

                    <td className="px-6 py-4 text-gray-700">
                      {formatDate(schedule.applicationStart)}
                    </td>

                    <td className="px-6 py-4 text-gray-700">
                      {formatDate(schedule.applicationEnd)}
                    </td>

                    <td className="px-6 py-4 text-gray-700">
                      {formatDate(schedule.examDate)}
                    </td>

                    <td className="px-6 py-4">
                      {schedule.pdf ? (
                        <a
                          href={getFileUrl(schedule.pdf)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-green-800 hover:underline"
                        >
                          View PDF
                        </a>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(schedule)}
                          className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(schedule)}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
