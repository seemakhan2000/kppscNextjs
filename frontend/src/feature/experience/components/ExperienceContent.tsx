
"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import type {
  ExperienceProfileData,
  ExperienceRecord,
  NatureOfJob,
} from "../types/experience.types";

type ToastType = "success" | "error";

type ToastState = {
  message: string;
  type: ToastType;
} | null;

const initialForm: ExperienceRecord = {
  department: "",
  positionTitle: "",
  natureOfJob: "" as NatureOfJob,
  jobResponsibilities: "",
  jobStartDate: "",
  isContinued: "" as "Yes" | "No",
};

const jobTypes: NatureOfJob[] = [
  "Permanent",
  "Contract",
  "Temporary",
  "Internship",
  "Part-Time",
  "Other",
];

const navigationItems = [
  { label: "1: Complete Your Profile", href: "/profile" },
  { label: "2: Add Education", href: "/add-education" },
  { label: "3: Add Experience", href: "/add-experience" },
  { label: "4: Add Picture", href: "/add-pic" },
  { label: "5: Apply for Posts", href: "/finalProfile" },
];

export default function ExperienceContent() {
  const [form, setForm] = useState<ExperienceRecord>(initialForm);
  const [toast, setToast] = useState<ToastState>(null);
  const [isReady, setIsReady] = useState(false);
  const [experienceRecords, setExperienceRecords] = useState<
    ExperienceRecord[]
  >([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("finalProfileData");

      if (stored) {
        const profileData = JSON.parse(stored) as ExperienceProfileData;
        setExperienceRecords(
          Array.isArray(profileData.experience)
            ? profileData.experience
            : []
        );
      }
    } catch (error) {
      console.error("Unable to load experience records:", error);
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function handleChange(
    field: keyof ExperienceRecord,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formElement = event.currentTarget;

    if (!formElement.checkValidity()) {
      formElement.reportValidity();
      setToast({
        message: "Please fill in all required fields before submitting.",
        type: "error",
      });
      return;
    }

    const data: ExperienceRecord = {
      department: form.department.trim(),
      positionTitle: form.positionTitle.trim(),
      natureOfJob: form.natureOfJob,
      jobResponsibilities: form.jobResponsibilities.trim(),
      jobStartDate: form.jobStartDate,
      isContinued: form.isContinued,
    };

    if (
      !data.department ||
      !data.positionTitle ||
      !data.natureOfJob ||
      !data.jobResponsibilities ||
      !data.jobStartDate ||
      !data.isContinued
    ) {
      setToast({
        message: "Please fill in all required fields before submitting.",
        type: "error",
      });
      return;
    }

    try {
      const stored = localStorage.getItem("finalProfileData");
      const profileData: ExperienceProfileData = stored
        ? JSON.parse(stored)
        : {};

      const updatedRecords = [
        ...(Array.isArray(profileData.experience)
          ? profileData.experience
          : []),
        data,
      ];

      const updatedProfile: ExperienceProfileData = {
        ...profileData,
        experience: updatedRecords,
      };

      localStorage.setItem(
        "finalProfileData",
        JSON.stringify(updatedProfile)
      );

      setExperienceRecords(updatedRecords);
      setForm(initialForm);
      formElement.reset();

      setToast({
        message: "Experience record added temporarily!",
        type: "success",
      });
    } catch (error) {
      console.error("Unable to save experience record:", error);
      setToast({
        message: "Unable to save the experience record. Please try again.",
        type: "error",
      });
    }
  }

  const inputClass =
    "mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-green-700 focus:ring-2 focus:ring-green-100";

  const labelClass = "block text-sm font-semibold text-gray-800";

  const requiredMark = <span className="text-pink-600"> *</span>;

  return (
    <div className="min-h-screen bg-[#f7f8fa] font-sans text-gray-800">
      {/* Toast notification */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed right-4 top-5 z-50 flex max-w-sm items-start gap-3 rounded-xl px-5 py-4 text-sm font-medium text-white shadow-xl ${
            toast.type === "success" ? "bg-green-700" : "bg-red-600"
          }`}
        >
          <span className="text-lg" aria-hidden="true">
            {toast.type === "success" ? "✓" : "!"}
          </span>
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Close notification"
            className="ml-2 text-lg leading-none opacity-80 hover:opacity-100"
          >
            ×
          </button>
        </div>
      )}

      {/* KPPSC header */}
      <header className="bg-[#2e7d32] px-4 py-3 text-center text-base font-bold text-white shadow-sm sm:px-6 sm:text-lg">
        Khyber Pakhtunkhwa Public Service Commission
      </header>

      <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          {/* Sidebar */}
          <aside className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="mb-4 border-b border-gray-100 pb-3 text-base font-bold text-[#2c3e50]">
              Steps to Apply
            </h2>

            <nav aria-label="Application steps" className="space-y-1.5">
              {navigationItems.map((item) => {
                const active = item.href === "/add-experience";

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`block rounded-lg px-3 py-3 text-sm transition ${
                      active
                        ? "bg-green-600 font-semibold text-white shadow-sm"
                        : "text-gray-700 hover:bg-green-50 hover:text-green-800"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Main form */}
          <section className="min-w-0 rounded-xl border border-gray-200 bg-white p-5 shadow-[0_8px_30px_rgba(20,40,80,0.08)] sm:p-7 lg:p-8">
            <div className="mb-6 border-b border-gray-100 pb-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                  Add New Experience Record
                </h2>
                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-800">
                  Work Experience
                </span>
              </div>

              <div
                dir="rtl"
                className="mt-4 rounded-lg border-r-4 border-amber-500 bg-amber-50 p-4 text-right text-sm leading-7 text-gray-700"
              >
                تجربہ کے کوائف کا اندراج احتیاط سے کریں۔ غلطی کی صورت میں
                آپکی درخواست مسترد کی جاسکتی ہے۔
                <p className="mt-1 font-bold text-red-700">
                  انتباہ: تجربہ/سرٹیفیکیٹ جعلی یا جھوٹ ثابت ہونے کی صورت
                  میں ضروری قانونی کاروائی کی جاسکتی ہے۔
                </p>
              </div>

              <p className="mt-4 text-sm text-gray-500">
                Fields marked with <span className="text-pink-600">*</span>{" "}
                are required.
              </p>
            </div>

            <form
              id="experienceForm"
              onSubmit={handleSubmit}
              autoComplete="off"
              noValidate
              className="space-y-5"
            >
              {/* Department */}
              <div>
                <label htmlFor="department" className={labelClass}>
                  Department / Organization / Institution [write full name]
                  {requiredMark}
                </label>
                <input
                  id="department"
                  name="department"
                  type="text"
                  required
                  value={form.department}
                  onChange={(event) =>
                    handleChange("department", event.target.value)
                  }
                  placeholder="Enter the name of Department/Organization/Institution"
                  className={inputClass}
                />
                <p className="mt-1.5 text-xs text-gray-500">
                  Enter the complete official name of the organization.
                </p>
              </div>

              {/* Position */}
              <div>
                <label htmlFor="positionTitle" className={labelClass}>
                  Title of Position held{requiredMark}
                </label>
                <input
                  id="positionTitle"
                  name="positionTitle"
                  type="text"
                  required
                  value={form.positionTitle}
                  onChange={(event) =>
                    handleChange("positionTitle", event.target.value)
                  }
                  placeholder="Title of post/designation"
                  className={inputClass}
                />
              </div>

              {/* Nature of job */}
              <div>
                <label htmlFor="natureOfJob" className={labelClass}>
                  Nature of Job{requiredMark}
                </label>
                <select
                  id="natureOfJob"
                  name="natureOfJob"
                  required
                  value={form.natureOfJob}
                  onChange={(event) =>
                    handleChange("natureOfJob", event.target.value)
                  }
                  className={inputClass}
                >
                  <option value="">[ Select Nature of Job ]</option>
                  {jobTypes.map((jobType) => (
                    <option key={jobType} value={jobType}>
                      {jobType}
                    </option>
                  ))}
                </select>
              </div>

              {/* Responsibilities */}
              <div>
                <label htmlFor="jobResponsibilities" className={labelClass}>
                  Major Job Responsibilities{requiredMark}
                </label>
                <textarea
                  id="jobResponsibilities"
                  name="jobResponsibilities"
                  rows={4}
                  required
                  value={form.jobResponsibilities}
                  onChange={(event) =>
                    handleChange("jobResponsibilities", event.target.value)
                  }
                  placeholder="Responsibilities"
                  className={`${inputClass} resize-y`}
                />
              </div>

              {/* Start date and continued */}
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label htmlFor="jobStartDate" className={labelClass}>
                    Job Starting Date{requiredMark}
                  </label>
                  <input
                    id="jobStartDate"
                    name="jobStartDate"
                    type="date"
                    required
                    value={form.jobStartDate}
                    onChange={(event) =>
                      handleChange("jobStartDate", event.target.value)
                    }
                    className={inputClass}
                  />
                  <p className="mt-1.5 text-xs text-gray-500">
                    Date e.g: 2016-01-01
                  </p>
                </div>

                <div>
                  <label htmlFor="isContinued" className={labelClass}>
                    Is this Job continued?{requiredMark}
                  </label>
                  <select
                    id="isContinued"
                    name="isContinued"
                    required
                    value={form.isContinued}
                    onChange={(event) =>
                      handleChange("isContinued", event.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="">[ Select Yes/No ]</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                  <p className="mt-1.5 text-xs leading-5 text-gray-500">
                    The job will be presumed to be continued till the closing
                    date of the current Advertisement.
                  </p>
                </div>
              </div>

              {/* Submit */}
              <div className="flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-gray-500">
                  Please verify your details before submitting.
                </p>
                <button
                  type="submit"
                  disabled={!isReady}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span aria-hidden="true">＋</span>
                  Add Experience
                </button>
              </div>
            </form>

            {/* Existing records */}
            {isReady && experienceRecords.length > 0 && (
              <div className="mt-8 border-t border-gray-200 pt-6">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-lg font-bold text-gray-900">
                    Saved Experience Records
                  </h3>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                    {experienceRecords.length}{" "}
                    {experienceRecords.length === 1 ? "record" : "records"}
                  </span>
                </div>

                <div className="space-y-3">
                  {experienceRecords.map((record, index) => (
                    <article
                      key={`${record.department}-${record.jobStartDate}-${index}`}
                      className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {record.positionTitle}
                          </h4>
                          <p className="mt-1 text-sm text-gray-600">
                            {record.department}
                          </p>
                        </div>
                        <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800">
                          {record.natureOfJob}
                        </span>
                      </div>

                      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-600">
                        {record.jobResponsibilities}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-500">
                        <span>Started: {record.jobStartDate}</span>
                        <span>Continued: {record.isContinued}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            <p className="mt-6 rounded-lg bg-gray-50 p-3 text-xs leading-5 text-gray-500">
              Note: Experience records are currently saved in this browser&apos;s
              local storage. They are not yet stored in the backend database.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
