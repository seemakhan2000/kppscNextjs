
"use client";

"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || ""
).replace(/\/+$/, "");

type AnyRecord = Record<string, any>;

type ToastState = {
  message: string;
  type: "success" | "error";
} | null;

const navigationItems = [
  { label: "1: Complete Your Profile", href: "/profile" },
  { label: "2: Add Education", href: "/add-education" },
  { label: "3: Add Experience", href: "/add-experience" },
  { label: "4: Add Picture", href: "/add-pic" },
  { label: "5: Apply for Posts", href: "/finalProfile" },
];

const personalFields = [
  ["name", "Name"],
  ["fatherName", "Father's Name"],
  ["district", "District of Domicile"],
  ["cnic", "CNIC"],
];

const basicFields = [
  ["gender", "Gender", true],
  ["maritalStatus", "Marital Status", true],
  ["religion", "Religion", true],
  ["nationality", "Nationality", true],
  ["hafiz", "Hafiz-e-Quran", false],
  ["fatherOccupation", "Father Occupation", false],
  ["dob", "Date of Birth", true],
  ["mobileNumber", "Mobile Number", true],
  ["whatsappNumber", "WhatsApp Number", true],
  ["overseasContact", "Overseas Contact Number", false],
  ["email", "Email Address", true],
  ["examStation", "Exam Station", true],
  ["disability", "Physical Disability", true],
  ["activities", "Co-Curricular Activities", false],
  ["travelAbroad", "Travel Abroad", false],
  ["postalAddress", "Postal Address", true],
  ["permanentAddress", "Permanent Address", true],
] as const;

const femaleFields = [
  ["husbandName", "Name of Husband"],
  ["widowDivorced", "Widow/Divorced"],
  ["domicileHusband", "Domicile of Husband"],
  ["dateMarriage", "Date of Marriage"],
  ["domicileOtherKP", "Domicile if other than KP"],
  ["domicilePriority", "Domicile Priority"],
  ["nationalityHusband", "Nationality of Husband"],
  ["husbandOccupation", "Husband Occupation"],
] as const;

const otherFields = [
  ["postgraduateResearch", "Postgraduate Research"],
  ["govEntryDate", "Government Entry Date"],
  ["govCurrentEntryDate", "Current Government Entry Date"],
  ["dismissed", "Dismissed / Removed"],
  ["deputation", "Deputation"],
  ["leave", "Leave"],
] as const;

const academicColumns = [
  "Certificate / Degree / Diploma",
  "Marks/CGPA/Grade/Division",
  "Board/University",
  "Result Declaration Date",
  "Distinction (In Board/University)",
  "Level of Equivalency",
];

function displayValue(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "Nill";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (Array.isArray(value)) {
    return value.length ? value.join(", ") : "Nill";
  }

  return String(value);
}

function formatDate(value: unknown): string {
  if (typeof value !== "string" || !value) return "Nill";

  const parts = value.split("-");

  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }

  return value;
}

function getMarks(record: AnyRecord): string {
  return [
    record.obtainedMarks || record.totalMarks
      ? `${record.obtainedMarks || ""}/${record.totalMarks || ""}`
      : "",
    record.cgpa || "",
    record.grade || "",
    record.division || "",
  ]
    .filter(Boolean)
    .join(" / ") || "Nill";
}

export default function FinalProfileContent() {
  const router = useRouter();

  const [profileData, setProfileData] = useState<AnyRecord>({});
  const [education, setEducation] = useState<AnyRecord[]>([]);
  const [experience, setExperience] = useState<AnyRecord[]>([]);
  const [photo, setPhoto] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  const showToast = useCallback(
    (message: string, type: "success" | "error" = "success") => {
      setToast({ message, type });
    },
    []
  );

  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const currentCnic = localStorage.getItem("currentUser");

        if (!currentCnic) {
          if (!cancelled) {
            showToast("Please complete your profile first.", "error");
            setIsLoading(false);
          }
          return;
        }

        const allUsers: AnyRecord = JSON.parse(
          localStorage.getItem("allUsers") || "{}"
        );

        const savedProfile: AnyRecord = JSON.parse(
          localStorage.getItem("finalProfileData") || "{}"
        );

        let finalData: AnyRecord;

        if (savedProfile?.profile?.cnic === currentCnic) {
          finalData = savedProfile;
        } else {
          finalData = allUsers[currentCnic] || {
            profile: { cnic: currentCnic },
            education: [],
            experience: [],
          };

          localStorage.setItem(
            "finalProfileData",
            JSON.stringify(finalData)
          );
        }

        localStorage.setItem("currentCnic", currentCnic);

        const profile = finalData.profile || {};

        if (!cancelled) {
          setProfileData(profile);
          setEducation(
            Array.isArray(finalData.education) ? finalData.education : []
          );
          setExperience(
            Array.isArray(finalData.experience) ? finalData.experience : []
          );

          if (profile.photo) setPhoto(profile.photo);
        }

        if (profile.cnic) {
          try {
            const response = await fetch(
              `${API_BASE_URL}/api/photo/${encodeURIComponent(profile.cnic)}`
            );

            const responseText = await response.text();

            if (response.ok) {
              const result = JSON.parse(responseText);

              if (result.photo && !cancelled) {
                const photoUrl = /^https?:\/\//i.test(result.photo)
                  ? result.photo
                  : `${API_BASE_URL}${result.photo.startsWith("/") ? "" : "/"}${result.photo}`;

                setPhoto(photoUrl);

                const latestData: AnyRecord = JSON.parse(
                  localStorage.getItem("finalProfileData") || "{}"
                );

                latestData.profile = {
                  ...latestData.profile,
                  photo: photoUrl,
                };

                localStorage.setItem(
                  "finalProfileData",
                  JSON.stringify(latestData)
                );
              }
            }
          } catch (error) {
            console.error("Error fetching profile photo:", error);
          }
        }
      } catch (error) {
        console.error("Error loading final profile:", error);
        if (!cancelled) {
          showToast("Unable to load profile information.", "error");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [showToast]);

async function handleSaveProfile() {
  if (isSaving) return;

  setIsSaving(true);

  try {
    if (!API_BASE_URL) {
      throw new Error(
        "Backend URL missing. Set NEXT_PUBLIC_API_BASE_URL in Vercel."
      );
    }

    const currentCnic = localStorage.getItem("currentUser");
    const rawData = localStorage.getItem("finalProfileData");

    if (!rawData) {
      throw new Error(
        "Profile data not found. Please complete your profile first."
      );
    }

    const finalData: AnyRecord = JSON.parse(rawData);

    if (!finalData.profile?.cnic) {
      throw new Error("Profile CNIC is missing.");
    }

    if (
      currentCnic &&
      String(finalData.profile.cnic) !== String(currentCnic)
    ) {
      throw new Error(
        "Saved profile CNIC does not match the logged-in user."
      );
    }

    const response = await fetch(
      `${API_BASE_URL}/api/profile/saveProfile`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalData),
      }
    );

    const responseText = await response.text();

    let result: AnyRecord;

    try {
      result = responseText ? JSON.parse(responseText) : {};
    } catch {
      throw new Error(
        `Backend returned an invalid response (HTTP ${response.status}). Verify the backend deployment and API route.`
      );
    }

    if (!response.ok) {
      throw new Error(
        result.message ||
          result.error ||
          `Unable to save profile (HTTP ${response.status}).`
      );
    }

    showToast(
      result.message || "Profile saved successfully!",
      "success"
    );

    localStorage.removeItem("finalProfileData");

    window.setTimeout(() => {
      router.push("/");
    }, 800);
  } catch (error) {
    console.error("Failed to save profile:", error);

    showToast(
      error instanceof Error
        ? error.message
        : "Failed to save profile. Please try again.",
      "error"
    );
  } finally {
    setIsSaving(false);
  }
}


  const valueFor = (key: string) => {
    const value = profileData[key];

    return key === "dob" || key === "dateMarriage"
      ? formatDate(value)
      : displayValue(value);
  };

  return (
    <div className="min-h-screen bg-[#f7f8fb] font-sans text-gray-800">
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed right-4 top-5 z-[100] flex max-w-sm items-start gap-3 rounded-xl px-5 py-4 text-sm font-medium text-white shadow-xl ${
            toast.type === "success" ? "bg-green-700" : "bg-red-600"
          }`}
        >
          <span className="text-lg" aria-hidden="true">
            {toast.type === "success" ? "✓" : "!"}
          </span>
          <span>{toast.message}</span>
          <button
            type="button"
            aria-label="Close notification"
            onClick={() => setToast(null)}
            className="ml-2 text-lg leading-none"
          >
            ×
          </button>
        </div>
      )}

      {/* KPPSC header */}
      <header className="bg-[#2e7d32] px-4 py-3 text-center text-base font-bold text-white shadow-sm sm:px-6 sm:text-lg">
        Khyber Pakhtunkhwa Public Service Commission
      </header>

      <main className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6">
        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
          {/* Application navigation */}
          <aside className="sidebar rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="mb-4 border-b border-gray-100 pb-3 font-bold text-[#2c3e50]">
              Steps to Apply
            </h2>

            <nav aria-label="Steps to apply" className="space-y-1.5">
              {navigationItems.map((item) => {
                const active = item.href === "/finalProfile";

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`block rounded-lg px-3 py-2.5 text-sm transition ${
                      active
                        ? "bg-green-600 font-semibold text-white"
                        : "text-gray-700 hover:bg-green-50 hover:text-green-800"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Final review */}
          <div className="content-area min-w-0 rounded-xl border border-[#eef2ff] bg-white p-4 shadow-[0_10px_25px_rgba(2,6,23,0.06)] sm:p-6">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-extrabold tracking-wide text-[#0b2f6a] sm:text-2xl">
              <span aria-hidden="true" className="text-green-700">
                ▤
              </span>
              FINAL PROFILE REVIEW
            </h2>

            {isLoading ? (
              <div className="flex min-h-48 items-center justify-center gap-3 text-sm text-gray-500">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-green-700" />
                Loading profile information...
              </div>
            ) : (
              <>
                {/* Applicant Information */}
                <ProfileSection title="Applicant Information" pill="Personal">
                  <dl className="grid grid-cols-1 gap-x-5 sm:grid-cols-2">
                    {personalFields.map(([key, label]) => (
                      <InfoField
                        key={key}
                        label={label}
                        value={valueFor(key)}
                      />
                    ))}

                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-gray-100 py-3 sm:col-span-2">
                      <dt className="text-sm font-bold text-gray-700">
                        Profile Photo
                      </dt>
                      <dd className="m-0">
                        {photo ? (
                          <img
                            id="profilePhotoPreview"
                            src={photo}
                            alt="Applicant profile photograph"
                            className="h-[100px] w-[100px] rounded-xl border border-gray-200 object-cover shadow-md"
                          />
                        ) : (
                          <div className="flex h-[100px] w-[100px] items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-center text-xs text-gray-400">
                            No photo
                          </div>
                        )}
                      </dd>
                    </div>
                  </dl>
                </ProfileSection>

                {/* Basic Profile */}
                <ProfileSection title="Basic Profile" pill="Required">
                  <dl className="grid grid-cols-1 gap-x-5 sm:grid-cols-2">
                    {basicFields.map(([key, label, required]) => (
                      <InfoField
                        key={key}
                        label={label}
                        value={valueFor(key)}
                        required={required}
                      />
                    ))}
                  </dl>
                </ProfileSection>

                {/* Female Candidates */}
                <ProfileSection
                  title="Female Candidates Only"
                  pill="If Applicable"
                >
                  <dl className="grid grid-cols-1 gap-x-5 sm:grid-cols-2">
                    {femaleFields.map(([key, label]) => (
                      <InfoField
                        key={key}
                        label={label}
                        value={valueFor(key)}
                      />
                    ))}
                  </dl>
                </ProfileSection>

                {/* Other profile details included by the original JS */}
                <ProfileSection
                  title="Additional Government Service Information"
                  pill="If Applicable"
                >
                  <dl className="grid grid-cols-1 gap-x-5 sm:grid-cols-2">
                    {otherFields.map(([key, label]) => (
                      <InfoField
                        key={key}
                        label={label}
                        value={valueFor(key)}
                      />
                    ))}
                  </dl>
                </ProfileSection>

                {/* Academic qualifications */}
                <ProfileSection
                  title="Academic Qualification Starting from Secondary School Certificate (SSC)"
                >
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table
                      id="academicTable"
                      className="w-full min-w-[850px] border-collapse text-left text-sm"
                    >
                      <thead className="bg-gradient-to-b from-[#edf4ff] to-[#e9f1ff] text-[#0b2f6a]">
                        <tr>
                          <th className="border-b border-blue-100 px-3 py-3">
                            S#
                          </th>
                          {academicColumns.map((column) => (
                            <th
                              key={column}
                              className="border-b border-blue-100 px-3 py-3 font-bold"
                            >
                              {column}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>
                        {education.length ? (
                          education.map((item, index) => (
                            <tr
                              key={`${item.title || "education"}-${index}`}
                              className="border-b border-gray-100 odd:bg-white even:bg-gray-50 hover:bg-blue-50/50"
                            >
                              <td className="px-3 py-3">{index + 1}</td>
                              <td className="px-3 py-3">
                                {displayValue(item.title)}
                              </td>
                              <td className="px-3 py-3">
                                {getMarks(item)}
                              </td>
                              <td className="px-3 py-3">
                                {displayValue(item.institute)}
                              </td>
                              <td className="px-3 py-3">
                                {displayValue(item.resultDate)}
                              </td>
                              <td className="px-3 py-3">
                                {displayValue(item.distinction)}
                              </td>
                              <td className="px-3 py-3">
                                {displayValue(item.equivalency)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={7}
                              className="px-4 py-8 text-center text-gray-500"
                            >
                              No academic qualifications found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </ProfileSection>

                {/* Experience records */}
                <ProfileSection
                  title="Experience / Record of Government, Semi-Government or Private Service"
                >
                  {experience.length ? (
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                      <table className="w-full min-w-[850px] border-collapse text-left text-sm">
                        <thead className="bg-gradient-to-b from-[#edf4ff] to-[#e9f1ff] text-[#0b2f6a]">
                          <tr>
                            {[
                              "S#",
                              "Department / Organization",
                              "Position Title",
                              "Nature of Job",
                              "Responsibilities",
                              "Start Date",
                              "Continued?",
                            ].map((heading) => (
                              <th
                                key={heading}
                                className="border-b border-blue-100 px-3 py-3"
                              >
                                {heading}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {experience.map((item, index) => (
                            <tr
                              key={`${item.department || "experience"}-${index}`}
                              className="border-b border-gray-100 odd:bg-white even:bg-gray-50"
                            >
                              <td className="px-3 py-3">{index + 1}</td>
                              <td className="px-3 py-3">
                                {displayValue(item.department)}
                              </td>
                              <td className="px-3 py-3">
                                {displayValue(item.positionTitle)}
                              </td>
                              <td className="px-3 py-3">
                                {displayValue(item.natureOfJob)}
                              </td>
                              <td className="whitespace-pre-wrap px-3 py-3">
                                {displayValue(item.jobResponsibilities)}
                              </td>
                              <td className="px-3 py-3">
                                {displayValue(item.jobStartDate)}
                              </td>
                              <td className="px-3 py-3">
                                {displayValue(item.isContinued)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p id="experienceRecord" className="text-sm text-gray-600">
                      No experience record added.
                    </p>
                  )}
                </ProfileSection>

                {/* Important notice */}
                <div className="mb-4 rounded-xl border border-[#ffe7ac] border-l-[6px] border-l-[#ffbf00] bg-[#fff8e6] p-4 text-sm leading-6 text-[#6b5600]">
                  <strong>Important:</strong> Please ensure all provided
                  information is correct. Take a print of the form, review it,
                  and correct any mistakes before you submit.
                </div>

                {/* Urdu notice */}
                <div
                  dir="rtl"
                  className="urdu-text mb-5 space-y-3 rounded-xl border border-gray-200 bg-white p-4 text-right text-base leading-9 text-slate-900 shadow-inner"
                >
                  <p>
                    برائے مہربانی: تسلی کرلیں کہ درخواست فارم میں دیئے گئے
                    تمام کوائف دُرست ہیں۔
                  </p>
                  <p>
                    انتباہ: درخواست جمع کرنے سے پہلے درخواست فارم کا پرنٹ لے
                    کے اس کی جانچ پڑتال کریں اور کسی بھی غلط اندراج کی صورت
                    میں پہلے اُس کی تصحیح کریں اور پھر درخواست جمع (Submit)
                    کریں۔
                  </p>
                  <p>
                    غلط اندراجات اور اُن کے نتیجے میں پیدا ہونے والی ہر قسم
                    کی صورت حال اور اُس کے نتائج کی تمام تر ذمہ داری اُمیدوار
                    پر ہوگی۔
                  </p>
                  <p>
                    اگر پروفائل، تعلیم یا تجربے میں کوئی کمی بیشی پائی گئی
                    تو آپ کی درخواست مسترد کی جاسکتی ہے۔
                  </p>
                  <p dir="ltr" className="text-left font-bold">
                    Please complete all Basic Profile Section and then proceed
                    to apply.
                  </p>
                </div>

                {/* Actions */}
                <div className="no-print flex flex-col gap-3 sm:flex-row">
                  <button
                    id="saveProfileBtn"
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-green-500 to-green-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-green-600/20 transition hover:from-green-600 hover:to-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSaving ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Saving Profile...
                      </>
                    ) : (
                      <>
                        <span aria-hidden="true">✓</span>
                        Submit Final Profile
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    <span aria-hidden="true">▤</span>
                    Print Review
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }

          .app-header,
          .sidebar,
          .no-print {
            display: none !important;
          }

          main {
            max-width: 100% !important;
            padding: 0 !important;
          }

          .content-area,
          .profile-section,
          .urdu-text {
            box-shadow: none !important;
            border: 1px solid #d1d5db !important;
          }

          .content-area {
            padding: 0 !important;
            border: none !important;
          }

          .profile-section {
            break-inside: avoid;
          }

          table {
            font-size: 10px !important;
          }
        }
      `}</style>
    </div>
  );
}

function ProfileSection({
  title,
  pill,
  children,
}: {
  title: string;
  pill?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="profile-section mb-4 rounded-xl border border-[#eef2ff] bg-[#fbfcff] p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-center gap-2 border-b-2 border-[#e5edff] pb-3">
        <h3 className="font-bold text-[#102a56]">{title}</h3>
        {pill && (
          <span className="rounded-full border border-blue-100 bg-[#eaf2ff] px-2 py-0.5 text-xs font-semibold text-blue-600">
            {pill}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

function InfoField({
  label,
  value,
  required = false,
}: {
  label: string;
  value: string;
  required?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-1 border-b border-gray-100 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:gap-3">
      <dt className="text-sm font-bold text-gray-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </dt>
      <dd className="m-0 break-words text-sm text-gray-900">{value}</dd>
    </div>
  );
}
