
"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";

import {
  equivalencyOptions,
  divisionOptions,
  gradeOptions,
  distinctionOptions,
  educationNavigation,
} from "../data/education.data";

import type {
  EducationRecord,
  ToastType,
} from "../types/education.types";

const STORAGE_KEY = "education";
const PROFILE_KEY = "finalProfileData";

const initialForm: EducationRecord = {
  title: "",
  equivalency: "",
  institute: "",
  resultDate: "",
  obtainedMarks: "",
  totalMarks: "",
  cgpa: "",
  division: "",
  grade: "",
  distinction: "",
};

const inputClass =
  "mt-1 block h-[43px] w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100";

const labelClass = "block text-sm font-semibold text-gray-700";

type ToastState = {
  message: string;
  type: ToastType;
};

export default function EducationContent() {
  const [form, setForm] = useState<EducationRecord>(initialForm);
  const [records, setRecords] = useState<EducationRecord[]>([]);
  const [currentCnic, setCurrentCnic] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState<ToastState>({
    message: "",
    type: "success",
  });

  const showToast = useCallback(
    (message: string, type: ToastType = "success") => {
      setToast({ message, type });
    },
    []
  );

  // Load the logged-in user's education records.
  useEffect(() => {
    try {
      const finalProfile = JSON.parse(
        localStorage.getItem(PROFILE_KEY) || "{}"
      );

      const cnic = finalProfile?.profile?.cnic
        ? String(finalProfile.profile.cnic)
        : null;

      setCurrentCnic(cnic);

      if (!cnic) {
        setRecords([]);
        setReady(true);
        return;
      }

      const stored = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || '{"education":[],"cnic":null}'
      );

      if (stored.cnic !== cnic) {
        // Do not show another user's educational records.
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ education: [], cnic })
        );
        setRecords([]);
      } else {
        const education = Array.isArray(stored.education)
          ? stored.education
          : [];

        setRecords(education);
      }
    } catch (error) {
      console.error("Unable to load education records:", error);
      setRecords([]);
      showToast("Unable to load saved education records.", "error");
    } finally {
      setReady(true);
    }
  }, [showToast]);

  function updateField(
    field: keyof EducationRecord,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function persistRecords(updatedRecords: EducationRecord[]) {
    if (!currentCnic) {
      showToast(
        "Please complete your profile before adding education.",
        "error"
      );
      return false;
    }

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          education: updatedRecords,
          cnic: currentCnic,
        })
      );

      const finalProfile = JSON.parse(
        localStorage.getItem(PROFILE_KEY) || "{}"
      );

      finalProfile.education = updatedRecords;

      localStorage.setItem(PROFILE_KEY, JSON.stringify(finalProfile));

      setRecords(updatedRecords);
      return true;
    } catch (error) {
      console.error("Unable to save education records:", error);
      showToast("Unable to save records. Please try again.", "error");
      return false;
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!currentCnic) {
      showToast(
        "Please complete your profile before adding education.",
        "error"
      );
      return;
    }

    const obtained = Number(form.obtainedMarks);
    const total = Number(form.totalMarks);

    if (
      form.obtainedMarks.trim() === "" ||
      form.totalMarks.trim() === "" ||
      !Number.isFinite(obtained) ||
      !Number.isFinite(total) ||
      obtained < 0 ||
      total <= 0 ||
      obtained > total
    ) {
      showToast(
        "Please enter valid marks. Obtained marks cannot exceed total marks.",
        "error"
      );
      return;
    }

    const record: EducationRecord = {
      ...form,
      title: form.title.trim(),
      institute: form.institute.trim(),
      cgpa: form.cgpa.trim() || "-",
    };

    const updatedRecords = [...records, record];

    if (!persistRecords(updatedRecords)) return;

    setForm(initialForm);
    showToast(
      `${record.equivalency} record added successfully!`,
      "success"
    );
  }

  function deleteRecord(index: number) {
    const removedRecord = records[index];

    if (!removedRecord) return;

    const updatedRecords = records.filter(
      (_, recordIndex) => recordIndex !== index
    );

    if (!persistRecords(updatedRecords)) return;

    showToast(
      `${removedRecord.equivalency} record deleted successfully!`,
      "success"
    );
  }

  function getBadgeClass(equivalency: string) {
    const level = equivalency.toLowerCase();

    if (level.includes("intermediate")) {
      return "bg-cyan-600";
    }

    if (level.includes("bachelor")) {
      return "bg-amber-500 text-gray-900";
    }

    if (level.includes("master")) {
      return "bg-purple-700";
    }

    return "bg-green-600";
  }

  return (
    <main className="min-h-screen bg-[#f8f8f8] bg-[url('https://www.transparenttextures.com/patterns/white-wall.png')] font-sans text-gray-800">
      {/* Toast notification */}
      {toast.message && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed right-4 top-5 z-50 flex max-w-[calc(100%-2rem)] items-center gap-3 rounded-lg px-5 py-4 text-sm font-medium text-white shadow-xl sm:right-5 ${
            toast.type === "success" ? "bg-green-700" : "bg-red-600"
          }`}
        >
          <span aria-hidden="true" className="text-lg">
            {toast.type === "success" ? "✓" : "!"}
          </span>

          <span>{toast.message}</span>

          <button
            type="button"
            onClick={() =>
              setToast({ message: "", type: "success" })
            }
            className="ml-2 text-lg text-white/90 hover:text-white"
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      )}

      {/* KPPSC header */}
     <header className="bg-[#2e7d32] px-4 py-3 text-center text-base font-bold text-white shadow-sm sm:px-6 sm:text-lg">
        Khyber Pakhtunkhwa Public Service Commission
      </header>

      <div className="mx-auto max-w-[1600px] px-3 py-5 sm:px-5 lg:px-6">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-[250px_minmax(0,1fr)] lg:grid-cols-[280px_minmax(0,1fr)]">
          {/* Sidebar */}
          <aside>
            <nav className="rounded-md border border-gray-200 bg-white p-4 shadow-sm md:sticky md:top-5">
              <h2 className="mb-4 border-b border-gray-200 pb-3 text-base font-bold text-[#2c3e50]">
                Steps to Apply
              </h2>

              <div className="space-y-1">
                {educationNavigation.map((item) => {
                  const active = item.href === "/add-eduction";

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`block rounded px-3 py-2.5 text-sm transition ${
                        active
                          ? "bg-green-600 font-semibold text-white"
                          : "text-gray-700 hover:bg-green-50 hover:text-green-800"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </nav>
          </aside>

          {/* Main content */}
          <section className="min-w-0 space-y-5">
            {/* Education records */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-[0_8px_30px_rgba(20,40,80,0.08)] sm:p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-bold text-gray-800">
                  Educational Record
                </h2>

                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-800">
                  {records.length}{" "}
                  {records.length === 1 ? "Record" : "Records"}
                </span>
              </div>

              <p
                lang="ur"
                dir="rtl"
                className="mb-5 text-right text-sm leading-7 text-gray-600"
              >
                تعلیمی کوائف کا اندراج احتیاط سے کریں۔ غلطی کی صورت میں
                آپکی درخواست مسترد کی جاسکتی ہے۔
              </p>

              {!ready ? (
                <p className="py-5 text-sm text-gray-500">
                  Loading educational records...
                </p>
              ) : !currentCnic ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  Your profile CNIC was not found. Please{" "}
                  <Link
                    href="/profile"
                    className="font-bold underline"
                  >
                    complete your profile
                  </Link>{" "}
                  first.
                </div>
              ) : records.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center">
                  <div className="mb-2 text-3xl text-gray-400">
                    ▤
                  </div>
                  <p className="font-medium text-gray-700">
                    No educational record added yet.
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Add your qualification using the form below.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {records.map((record, index) => (
                    <article
                      key={`${record.title}-${record.resultDate}-${index}`}
                      className="flex flex-col justify-between gap-4 rounded-lg border border-gray-200 bg-white p-4 sm:flex-row sm:items-center"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex rounded px-2 py-1 text-xs font-semibold text-white ${getBadgeClass(record.equivalency)}`}
                          >
                            {record.equivalency.toUpperCase()}
                          </span>

                          {record.distinction === "Yes" && (
                            <span className="inline-flex rounded bg-blue-600 px-2 py-1 text-xs font-semibold text-white">
                              Distinction Claimed
                            </span>
                          )}
                        </div>

                        <h3 className="break-words font-bold text-gray-900">
                          {record.title}
                        </h3>

                        <p className="mt-1 text-sm text-gray-700">
                          Marks: {record.obtainedMarks}/
                          {record.totalMarks} · Grade: {record.grade}
                        </p>

                        <p className="mt-1 break-words text-sm text-gray-600">
                          {record.institute} · [{record.resultDate}]
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          Division: {record.division} · CGPA: {record.cgpa}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => deleteRecord(index)}
                        title="Delete education record"
                        aria-label={`Delete ${record.equivalency} record`}
                        className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-100 sm:self-center"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          className="h-4 w-4"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 6h18M9 6V4h6v2m-9 0 1 14h10l1-14M10 10v6m4-6v6"
                          />
                        </svg>
                        Delete
                      </button>
                    </article>
                  ))}
                </div>
              )}
            </div>

            {/* Add education form */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-[0_8px_30px_rgba(20,40,80,0.08)] sm:p-6 lg:p-7">
              <div className="mb-6 border-b border-gray-200 pb-4">
                <h2 className="text-xl font-bold text-gray-800 sm:text-2xl">
                  Add New Education / Qualification
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  All fields are mandatory, and no field is to be left blank.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                autoComplete="off"
                className="space-y-5"
              >
                <div>
                  <label htmlFor="title" className={labelClass}>
                    Title of Certificate / Degree / Diploma{" "}
                    <span className="text-pink-600">*</span>
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    className={inputClass}
                    value={form.title}
                    onChange={(e) => updateField("title", e.target.value)}
                    placeholder="Enter certificate or degree title"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="equivalency" className={labelClass}>
                    Level of Equivalency{" "}
                    <span className="text-pink-600">*</span>
                  </label>
                  <select
                    id="equivalency"
                    name="equivalency"
                    className={inputClass}
                    value={form.equivalency}
                    onChange={(e) =>
                      updateField("equivalency", e.target.value)
                    }
                    required
                  >
                    <option value="">[ Select Level ]</option>
                    {equivalencyOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="institute" className={labelClass}>
                    Board / University / DAI{" "}
                    <span className="text-pink-600">*</span>
                  </label>
                  <input
                    id="institute"
                    name="institute"
                    type="text"
                    className={inputClass}
                    value={form.institute}
                    onChange={(e) =>
                      updateField("institute", e.target.value)
                    }
                    placeholder="Enter board or university name"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="resultDate" className={labelClass}>
                      Result Declaration Date{" "}
                      <span className="text-pink-600">*</span>
                    </label>
                    <input
                      id="resultDate"
                      name="resultDate"
                      type="date"
                      className={inputClass}
                      value={form.resultDate}
                      onChange={(e) =>
                        updateField("resultDate", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="obtainedMarks" className={labelClass}>
                      Obtained Marks{" "}
                      <span className="text-pink-600">*</span>
                    </label>
                    <input
                      id="obtainedMarks"
                      name="obtainedMarks"
                      type="number"
                      min="0"
                      step="any"
                      className={inputClass}
                      value={form.obtainedMarks}
                      onChange={(e) =>
                        updateField("obtainedMarks", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                  <div>
                    <label htmlFor="totalMarks" className={labelClass}>
                      Total Marks{" "}
                      <span className="text-pink-600">*</span>
                    </label>
                    <input
                      id="totalMarks"
                      name="totalMarks"
                      type="number"
                      min="0.01"
                      step="any"
                      className={inputClass}
                      value={form.totalMarks}
                      onChange={(e) =>
                        updateField("totalMarks", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="cgpa" className={labelClass}>
                      CGPA
                    </label>
                    <input
                      id="cgpa"
                      name="cgpa"
                      type="text"
                      className={inputClass}
                      placeholder="e.g. 3.76"
                      value={form.cgpa}
                      onChange={(e) => updateField("cgpa", e.target.value)}
                    />
                  </div>

                  <div>
                    <label htmlFor="division" className={labelClass}>
                      Division <span className="text-pink-600">*</span>
                    </label>
                    <select
                      id="division"
                      name="division"
                      className={inputClass}
                      value={form.division}
                      onChange={(e) =>
                        updateField("division", e.target.value)
                      }
                      required
                    >
                      <option value="">[ Select Division ]</option>
                      {divisionOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="grade" className={labelClass}>
                      Grade <span className="text-pink-600">*</span>
                    </label>
                    <select
                      id="grade"
                      name="grade"
                      className={inputClass}
                      value={form.grade}
                      onChange={(e) => updateField("grade", e.target.value)}
                      required
                    >
                      <option value="">[ Select Grade ]</option>
                      {gradeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="distinction" className={labelClass}>
                      Distinction Claimed{" "}
                      <span className="text-pink-600">*</span>
                    </label>
                    <select
                      id="distinction"
                      name="distinction"
                      className={inputClass}
                      value={form.distinction}
                      onChange={(e) =>
                        updateField("distinction", e.target.value)
                      }
                      required
                    >
                      <option value="">[ Select Yes/No ]</option>
                      {distinctionOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end border-t border-gray-200 pt-5">
                  <button
                    type="submit"
                    disabled={!ready || !currentCnic}
                    className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#0d6efd] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Add Record
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
