
"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";

type ProfileData = Record<string, string>;

type StoredUser = {
  profile?: ProfileData;
};

type ToastType = "success" | "error";

type ToastState = {
  message: string;
  type: ToastType;
};

const initialProfile: ProfileData = {
  name: "",
  fatherName: "",
  gender: "",
  maritalStatus: "",
  cnic: "",
  dob: "",
  postalAddress: "",
  permanentAddress: "",
  mobileNumber: "",
  whatsappNumber: "",
  overseasContact: "",
  email: "",
  district: "",
  examStation: "",
  religion: "",
  hafiz: "No",
  disability: "",
  nationality: "",
  fatherOccupation: "",
  activities: "",
  travelAbroad: "No",
  govServant: "No",
  dismissed: "No",
};

const fields = [
  {
    name: "name",
    label: "Name",
    required: true,
    type: "text",
  },
  {
    name: "fatherName",
    label: "Father Name",
    required: true,
    type: "text",
  },
  {
    name: "cnic",
    label: "CNIC",
    required: true,
    type: "text",
  },
  {
    name: "dob",
    label: "Date of Birth",
    type: "date",
  },
  {
    name: "postalAddress",
    label: "Postal Address",
    type: "text",
    full: true,
  },
  {
    name: "permanentAddress",
    label: "Permanent Address",
    type: "text",
    full: true,
  },
  {
    name: "mobileNumber",
    label: "Mobile Number",
    type: "text",
  },
  {
    name: "whatsappNumber",
    label: "WhatsApp Number",
    type: "text",
  },
  {
    name: "overseasContact",
    label: "Overseas Contact Number",
    type: "text",
  },
  {
    name: "email",
    label: "Email Address",
    type: "email",
  },
  {
    name: "district",
    label: "District of Domicile / Zone / Area",
    type: "text",
  },
  {
    name: "examStation",
    label: "Preferred Exam Station",
    type: "text",
  },
  {
    name: "religion",
    label: "Religion",
    type: "text",
  },
  {
    name: "disability",
    label: "Physical Disability",
    type: "text",
  },
  {
    name: "nationality",
    label: "Nationality",
    type: "text",
  },
  {
    name: "fatherOccupation",
    label: "Father Occupation",
    type: "text",
    full: true,
  },
  {
    name: "activities",
    label: "Co-Curricular Activities",
    type: "text",
    full: true,
  },
] as const;

const selectFields = [
  {
    name: "gender",
    label: "Gender",
    required: true,
    options: [
      { label: "Select", value: "" },
      { label: "Male", value: "Male" },
      { label: "Female", value: "Female" },
    ],
  },
  {
    name: "maritalStatus",
    label: "Marital Status",
    options: [
      { label: "Select", value: "" },
      { label: "Single", value: "Single" },
      { label: "Married", value: "Married" },
    ],
  },
  {
    name: "hafiz",
    label: "Hafiz-e-Quran",
    options: [
      { label: "No", value: "No" },
      { label: "Yes", value: "Yes" },
    ],
  },
  {
    name: "travelAbroad",
    label: "Travel Abroad",
    options: [
      { label: "No", value: "No" },
      { label: "Yes", value: "Yes" },
    ],
  },
  {
    name: "govServant",
    label: "Government Servant",
    options: [
      { label: "No", value: "No" },
      { label: "Yes", value: "Yes" },
    ],
  },
  {
    name: "dismissed",
    label: "Dismissed from Govt. Service?",
    options: [
      { label: "No", value: "No" },
      { label: "Yes", value: "Yes" },
    ],
  },
] as const;

const inputClass =
  "h-[42px] w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100";

const labelClass =
  "mb-1.5 block text-sm font-bold text-slate-700";

export default function ProfileContent() {
  const [form, setForm] = useState<ProfileData>(initialProfile);
  const [currentUser, setCurrentUser] = useState("");
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
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

  // Load the current user's profile from localStorage.
  useEffect(() => {
    try {
      const savedCurrentUser = localStorage.getItem("currentUser");

      if (!savedCurrentUser) {
        setReady(true);
        showToast("Please log in to access your profile.", "error");
        return;
      }

      setCurrentUser(savedCurrentUser);

      const allUsers: Record<string, StoredUser> = JSON.parse(
        localStorage.getItem("allUsers") || "{}"
      );

      const savedProfile =
        allUsers[savedCurrentUser]?.profile || {};

      const finalProfileData = JSON.parse(
        localStorage.getItem("finalProfileData") || "{}"
      );

      const finalProfile =
        finalProfileData?.profile || {};

      const mergedProfile: ProfileData = {
        ...initialProfile,
        ...savedProfile,
        ...finalProfile,
      };

      // Match select options case-insensitively.
      mergedProfile.gender =
        mergedProfile.gender?.toLowerCase() === "male"
          ? "Male"
          : mergedProfile.gender?.toLowerCase() === "female"
            ? "Female"
            : mergedProfile.gender || "";

      mergedProfile.maritalStatus =
        mergedProfile.maritalStatus
          ? mergedProfile.maritalStatus.charAt(0).toUpperCase() +
            mergedProfile.maritalStatus.slice(1).toLowerCase()
          : "";

      setForm(mergedProfile);
    } catch (error) {
      console.error("Failed to load profile:", error);
      showToast("Unable to load your profile data.", "error");
    } finally {
      setReady(true);
    }
  }, [showToast]);

  function updateField(name: string, value: string) {
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!currentUser) {
      showToast("Please log in before updating your profile.", "error");
      return;
    }

    if (saving) return;

    setSaving(true);

    try {
      const formData = new FormData(event.currentTarget);
      const submittedData: ProfileData = {};

      formData.forEach((value, key) => {
        submittedData[key] = String(value).trim();
      });

      // Keep existing profile properties and update submitted fields.
      const allUsers: Record<string, StoredUser> = JSON.parse(
        localStorage.getItem("allUsers") || "{}"
      );

      if (!allUsers[currentUser]) {
        allUsers[currentUser] = { profile: {} };
      }

      allUsers[currentUser].profile = {
        ...(allUsers[currentUser].profile || {}),
        ...submittedData,
      };

      localStorage.setItem("allUsers", JSON.stringify(allUsers));

      // Preserve the original finalProfileData behavior.
      const existingFinalData = JSON.parse(
        localStorage.getItem("finalProfileData") || "{}"
      );

      existingFinalData.profile = {
        ...(existingFinalData.profile || {}),
        ...submittedData,
      };

      localStorage.setItem(
        "finalProfileData",
        JSON.stringify(existingFinalData)
      );

      setForm((previous) => ({
        ...previous,
        ...submittedData,
      }));

      showToast("Profile saved successfully!", "success");
    } catch (error) {
      console.error("Failed to save profile:", error);
      showToast(
        "Unable to save your profile. Please try again.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f8f8]">
        <p className="text-sm font-medium text-slate-600">
          Loading your profile...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f8f8] bg-[url('https://www.transparenttextures.com/patterns/white-wall.png')] font-sans text-slate-800">
      {/* Toast notification */}
      {toast.message && (
        <div
          role="alert"
          className={`fixed right-4 top-5 z-50 flex max-w-[calc(100%-2rem)] items-start gap-3 rounded-lg px-5 py-4 text-sm font-medium text-white shadow-xl sm:right-6 ${
            toast.type === "success"
              ? "bg-green-700"
              : "bg-red-600"
          }`}
        >
          <span className="text-lg leading-5">
            {toast.type === "success" ? "✓" : "!"}
          </span>

          <p className="flex-1">{toast.message}</p>

          <button
            type="button"
            onClick={() =>
              setToast({ message: "", type: "success" })
            }
            aria-label="Close notification"
            className="ml-2 text-lg leading-5 opacity-90 hover:opacity-100"
          >
            ×
          </button>
        </div>
      )}

      {/* Header */}
      <header className="bg-[#2e7d32] px-4 py-3 text-center text-base font-bold text-white shadow-sm sm:px-6 sm:text-lg">
        Khyber Pakhtunkhwa Public Service Commission
      </header>

      {/* Login success message */}
      <div className="mx-4 mt-4 rounded-md bg-[#28a745] px-4 py-2.5 text-center text-sm font-bold text-white sm:mx-5">
        Logged in successfully.
      </div>

      {/* Main layout */}
      <div className="px-4 pb-8 sm:px-5">
        <div className="mx-auto mt-5 grid max-w-[1600px] grid-cols-1 items-start gap-5 lg:grid-cols-12">
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-5 lg:col-span-3">
            <nav className="rounded-md border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <h2 className="mb-4 text-base font-bold text-[#2c3e50]">
                Steps to Apply
              </h2>

              <div className="space-y-1.5">
                <Link
                  href="/profile"
                  aria-current="page"
                  className="flex items-center gap-3 rounded-md bg-[#28a745] px-3 py-2.5 text-sm font-semibold text-white transition"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white/20">
                    1
                  </span>
                  Complete Your Profile
                </Link>

                <Link
                  href="/add-education"
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-slate-700 transition hover:bg-green-50 hover:text-green-800"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-100">
                    2
                  </span>
                  Add Education
                </Link>

                <Link
                  href="/add-experience"
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-slate-700 transition hover:bg-green-50 hover:text-green-800"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-100">
                    3
                  </span>
                  Add Experience
                </Link>

                <Link
                  href="/add-picture"
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-slate-700 transition hover:bg-green-50 hover:text-green-800"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-100">
                    4
                  </span>
                  Add Picture
                </Link>

                <Link
                  href="/final-profile"
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-slate-700 transition hover:bg-green-50 hover:text-green-800"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-100">
                    5
                  </span>
                  Apply for Posts
                </Link>
              </div>
            </nav>
          </aside>

          {/* Profile form */}
          <section className="min-w-0 lg:col-span-9">
            <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              <div className="mb-6 flex flex-col justify-between gap-2 border-b border-slate-200 pb-4 sm:flex-row sm:items-center">
                <div>
                  <h1 className="text-lg font-bold text-slate-800">
                    Update / Edit Basic Profile
                  </h1>
                  <p className="mt-1 text-sm text-slate-500">
                    Review and update your personal information.
                  </p>
                </div>

                <span className="inline-flex w-fit items-center rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                  Profile Details
                </span>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
                  {fields.slice(0, 4).map((field) => (
                    <div key={field.name}>
                      <label
                        htmlFor={field.name}
                        className={labelClass}
                      >
                        {field.label}
                        {"required" in field && field.required && (
                          <span className="ml-1 text-red-600">*</span>
                        )}
                      </label>

                      <input
                        id={field.name}
                        type={field.type}
                        name={field.name}
                        value={form[field.name] || ""}
                        onChange={(event) =>
                          updateField(field.name, event.target.value)
                        }
                        className={inputClass}
                        required={"required" in field && field.required}
                      />
                    </div>
                  ))}

                  {selectFields.slice(0, 2).map((field) => (
                    <div key={field.name}>
                      <label
                        htmlFor={field.name}
                        className={labelClass}
                      >
                        {field.label}
                        {"required" in field && field.required && (
                          <span className="ml-1 text-red-600">*</span>
                        )}
                      </label>

                      <select
                        id={field.name}
                        name={field.name}
                        value={form[field.name] || ""}
                        onChange={(event) =>
                          updateField(field.name, event.target.value)
                        }
                        className={inputClass}
                        required={"required" in field && field.required}
                      >
                        {field.options.map((option) => (
                          <option
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}

                  {fields.slice(4, 7).map((field) => (
                    <div
                      key={field.name}
                      className={"full" in field && field.full ? "md:col-span-2" : ""}
                    >
                      <label
                        htmlFor={field.name}
                        className={labelClass}
                      >
                        {field.label}
                      </label>

                      <input
                        id={field.name}
                        type={field.type}
                        name={field.name}
                        value={form[field.name] || ""}
                        onChange={(event) =>
                          updateField(field.name, event.target.value)
                        }
                        className={inputClass}
                      />
                    </div>
                  ))}

                  {fields.slice(7, 15).map((field) => (
                    <div
                      key={field.name}
                      className={"full" in field && field.full ? "md:col-span-2" : ""}
                    >
                      <label
                        htmlFor={field.name}
                        className={labelClass}
                      >
                        {field.label}
                      </label>

                      <input
                        id={field.name}
                        type={field.type}
                        name={field.name}
                        value={form[field.name] || ""}
                        onChange={(event) =>
                          updateField(field.name, event.target.value)
                        }
                        className={inputClass}
                      />
                    </div>
                  ))}

                  {selectFields.slice(2).map((field) => (
                    <div key={field.name}>
                      <label
                        htmlFor={field.name}
                        className={labelClass}
                      >
                        {field.label}
                      </label>

                      <select
                        id={field.name}
                        name={field.name}
                        value={form[field.name] || "No"}
                        onChange={(event) =>
                          updateField(field.name, event.target.value)
                        }
                        className={inputClass}
                      >
                        {field.options.map((option) => (
                          <option
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>

                <div className="mt-7 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center">
                  <button
                    type="submit"
                    disabled={saving || !currentUser}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#28a745] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#218838] focus:outline-none focus:ring-4 focus:ring-green-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Saving Profile...
                      </>
                    ) : (
                      "Update Profile"
                    )}
                  </button>

                  <p className="text-xs leading-5 text-slate-500">
                    Your profile information will be saved in your current
                    browser.
                  </p>
                </div>
              </form>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
