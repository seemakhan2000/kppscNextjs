
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import {
  HiOutlineUsers,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineTrash,
  HiOutlineMagnifyingGlass,
  HiOutlineArrowPath,
  HiOutlineExclamationTriangle,
  HiOutlineAcademicCap,
  HiOutlineBriefcase,
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineIdentification,
  HiOutlineUserCircle,
  HiOutlineXMark,
  HiOutlineShieldCheck,
} from "react-icons/hi2";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const PROFILE_API = `${API_BASE_URL}/api/profile`;
const PLACEHOLDER_IMAGE = "/images/placeholder.png";

export type ProfileMode = "all" | "pending" | "confirmed";

interface ProfilesContentProps {
  mode: ProfileMode;
}

interface Education {
  title?: string;
  equivalency?: string;
  institute?: string;
  obtainedMarks?: string | number;
  totalMarks?: string | number;
}

interface Experience {
  positionTitle?: string;
  department?: string;
  natureOfJob?: string;
  jobStartDate?: string;
}

interface Profile {
  _id?: string;
  cnic: string;
  status?: string;
  profile?: {
    name?: string;
    email?: string;
    mobileNumber?: string;
  };
  education?: Education[];
  experience?: Experience[];
}

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

async function readResponse(response: Response): Promise<unknown> {
  const text = await response.text();
  let data: unknown = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof data.message === "string"
        ? data.message
        : text || `Request failed with status ${response.status}.`;

    throw new Error(message);
  }

  return data;
}

function formatValue(value?: string | number | null): string {
  if (value === undefined || value === null || value === "") {
    return "—";
  }

  return String(value);
}

function ToastContainer({
  items,
  onDismiss,
}: {
  items: ToastItem[];
  onDismiss: (id: number) => void;
}) {
  if (!items.length) return null;

  return (
    <div
      className="fixed right-4 top-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3"
      aria-live="polite"
    >
      {items.map((toast) => {
        const color =
          toast.type === "success"
            ? "border-emerald-200 text-emerald-800"
            : toast.type === "info"
              ? "border-blue-200 text-blue-800"
              : "border-red-200 text-red-800";

        return (
          <div
            key={toast.id}
            role={toast.type === "success" ? "status" : "alert"}
            className={`flex items-start gap-3 rounded-xl border bg-white p-4 shadow-xl ${color}`}
          >
            {toast.type === "success" ? (
              <HiOutlineCheckCircle className="mt-0.5 h-5 w-5 shrink-0" />
            ) : toast.type === "info" ? (
              <HiOutlineShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
            ) : (
              <HiOutlineExclamationTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            )}

            <p className="flex-1 text-sm leading-5">{toast.message}</p>

            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
              className="rounded-md p-1 hover:bg-slate-100"
            >
              <HiOutlineXMark className="h-4 w-4" />
            </button>
          </div>
        );
      })}
      
    </div>
  );
}

function ProfileAvatar({ cnic }: { cnic: string }) {
  const [photoUrl, setPhotoUrl] = useState(PLACEHOLDER_IMAGE);

  useEffect(() => {
    let cancelled = false;

    async function loadPhoto() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/photo/${encodeURIComponent(cnic)}`,
          { cache: "no-store" }
        );

        if (!response.ok) return;

        const data = await response.json();

        if (cancelled || !data?.photo || typeof data.photo !== "string") {
          return;
        }

        const path = data.photo.trim();

        if (!path || /^(javascript|data|vbscript):/i.test(path)) {
          return;
        }

        const url = /^https?:\/\//i.test(path)
          ? path
          : `${API_BASE_URL}/${path.replace(/^\/+/, "")}`;

        if (!cancelled) {
          setPhotoUrl(url);
        }
      } catch (error) {
        console.error("Unable to load applicant photo:", error);
      }
    }

    void loadPhoto();

    return () => {
      cancelled = true;
    };
  }, [cnic]);

  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100">
      <img
        src={photoUrl}
        alt="Applicant profile"
        loading="lazy"
        className="h-full w-full object-cover"
        onError={() => {
          if (photoUrl !== PLACEHOLDER_IMAGE) {
            setPhotoUrl(PLACEHOLDER_IMAGE);
          }
        }}
      />
    </div>
  );
}


function StatusBadge({ status }: { status?: string }) {
  const confirmed = status === "Confirmed";
  const pending = status === "Pending";

  const color = confirmed
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : pending
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : "border-slate-200 bg-slate-100 text-slate-600";

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${color}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status || "Unknown"}
    </span>
  );
}

function StatCard({
  title,
  value,
  icon,
  description,
}: {
  title: string;
  value: number;
  icon: ReactNode;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
          <p className="mt-2 text-xs text-slate-500">{description}</p>
        </div>

        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
          {icon}
        </span>
      </div>
    </div>
  );
}

function InfoItem({
  icon,
  label,
  children,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 text-slate-400">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-400">{label}</p>
        <div className="mt-1 break-words text-sm text-slate-700">
          {children}
        </div>
      </div>
    </div>
  );
}

function DetailsList({
  title,
  icon,
  emptyMessage,
  children,
}: {
  title: string;
  icon: ReactNode;
  emptyMessage: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-[200px] max-w-xs">
      <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
        {icon}
        {title}
      </p>
      {children || (
        <p className="text-sm text-slate-400">{emptyMessage}</p>
      )}
    </div>
  );
}

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <tr key={index}>
          {Array.from({ length: 7 }).map((__, cell) => (
            <td key={cell} className="px-5 py-5">
              <div className="h-4 animate-pulse rounded-md bg-slate-100" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default function ProfilesContent({
  mode,
}: ProfilesContentProps) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const notify = useCallback(
    (message: string, type: ToastType = "success") => {
      const id = Date.now() + Math.random();

      setToasts((previous) => [
        ...previous,
        { id, message, type },
      ]);

      window.setTimeout(() => {
        setToasts((previous) =>
          previous.filter((toast) => toast.id !== id)
        );
      }, 4000);
    },
    []
  );

  const dismissToast = useCallback((id: number) => {
    setToasts((previous) =>
      previous.filter((toast) => toast.id !== id)
    );
  }, []);

  const fetchProfiles = useCallback(
    async (showLoading = true) => {
      if (showLoading) setLoading(true);

      setPageError("");

      try {
        const response = await fetch(PROFILE_API, {
          method: "GET",
          headers: { Accept: "application/json" },
          cache: "no-store",
        });

        const data = await readResponse(response);

        if (!Array.isArray(data)) {
          throw new Error(
            "The profiles API returned an invalid response."
          );
        }

        setProfiles(data as Profile[]);
      } catch (error) {
        setPageError(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    void fetchProfiles();
  }, [fetchProfiles]);

  const allCount = profiles.length;

  const pendingCount = profiles.filter(
    (profile) => profile.status === "Pending"
  ).length;

  const confirmedCount = profiles.filter(
    (profile) => profile.status === "Confirmed"
  ).length;

  const pageTitle =
    mode === "pending"
      ? "Pending Profiles"
      : mode === "confirmed"
        ? "Confirmed Profiles"
        : "All Applicant Profiles";

  const pageDescription =
    mode === "pending"
      ? "Review pending applicant records and confirm profiles when appropriate."
      : mode === "confirmed"
        ? "View all applicant profiles that have been confirmed."
        : "View and manage all applicant records in one place.";

  const filteredProfiles = useMemo(() => {
    const query = search.trim().toLowerCase();

    return profiles.filter((profile) => {
      const matchesMode =
        mode === "all" ||
        (mode === "pending" && profile.status === "Pending") ||
        (mode === "confirmed" && profile.status === "Confirmed");

      if (!matchesMode) return false;
      if (!query) return true;

      const values = [
        profile.cnic,
        profile.profile?.name,
        profile.profile?.email,
        profile.profile?.mobileNumber,
        profile.status,
      ];

      return values.some((value) =>
        String(value || "").toLowerCase().includes(query)
      );
    });
  }, [profiles, mode, search]);

  async function updateStatus(cnic: string) {
    if (
      !window.confirm(
        `Confirm the profile for CNIC ${cnic}?`
      )
    ) {
      return;
    }

    setBusyKey(`confirm-${cnic}`);

    try {
      const response = await fetch(
        `${PROFILE_API}/status/${encodeURIComponent(cnic)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ status: "Confirmed" }),
        }
      );

      await readResponse(response);

      setProfiles((previous) =>
        previous.map((profile) =>
          profile.cnic === cnic
            ? { ...profile, status: "Confirmed" }
            : profile
        )
      );

      notify("Profile confirmed successfully.");
    } catch (error) {
      notify(getErrorMessage(error), "error");
    } finally {
      setBusyKey(null);
    }
  }

  async function deleteProfile(profile: Profile) {
    if (
      !window.confirm(
        `Delete the profile for ${
          profile.profile?.name || profile.cnic
        }?\n\nThis action cannot be undone.`
      )
    ) {
      return;
    }

    setBusyKey(`delete-${profile.cnic}`);

    try {
      const response = await fetch(
        `${PROFILE_API}/${encodeURIComponent(profile.cnic)}`,
        {
          method: "DELETE",
          headers: { Accept: "application/json" },
        }
      );

      await readResponse(response);

      setProfiles((previous) =>
        previous.filter((item) => item.cnic !== profile.cnic)
      );

      notify("Profile deleted successfully.");
    } catch (error) {
      notify(getErrorMessage(error), "error");
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <ToastContainer items={toasts} onDismiss={dismissToast} />

      <div className="mx-auto max-w-[1800px] px-4 py-6 sm:px-6 sm:py-8 xl:px-8">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-700">
              <HiOutlineShieldCheck className="h-5 w-5" />
              KPPSC / Administration
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {pageTitle}
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              {pageDescription}
            </p>
          </div>

          <button
            type="button"
            onClick={() => void fetchProfiles()}
            disabled={loading}
            className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
          >
            <HiOutlineArrowPath
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh Records
          </button>
        </header>

        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            title="All Profiles"
            value={allCount}
            description="Total applicant records"
            icon={<HiOutlineUsers className="h-6 w-6" />}
          />

          <StatCard
            title="Pending Profiles"
            value={pendingCount}
            description="Waiting for confirmation"
            icon={<HiOutlineClock className="h-6 w-6" />}
          />

          <StatCard
            title="Confirmed Profiles"
            value={confirmedCount}
            description="Successfully confirmed"
            icon={<HiOutlineCheckCircle className="h-6 w-6" />}
          />
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-5 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {pageTitle}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Search and manage applicant information.
              </p>
            </div>

            <div className="relative w-full sm:max-w-sm">
              <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search CNIC, name, email..."
                aria-label="Search profiles"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
              />
            </div>
          </div>

          {pageError && (
            <div className="m-5 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center">
              <HiOutlineExclamationTriangle className="h-5 w-5 shrink-0 text-red-600" />

              <div className="flex-1">
                <p className="text-sm font-semibold text-red-800">
                  Unable to load profiles
                </p>
                <p className="mt-1 break-words text-sm text-red-700">
                  {pageError}
                </p>
              </div>

              <button
                type="button"
                onClick={() => void fetchProfiles()}
                className="self-start rounded-lg bg-red-100 px-4 py-2 text-sm font-semibold text-red-800 hover:bg-red-200 sm:self-auto"
              >
                Retry
              </button>
            </div>
          )}

          <div className="flex flex-col gap-2 border-y border-slate-100 bg-slate-50/70 px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-sm text-slate-600">
              {loading
                ? "Loading records..."
                : `Showing ${filteredProfiles.length} of ${
                    mode === "all"
                      ? allCount
                      : mode === "pending"
                        ? pendingCount
                        : confirmedCount
                  } profiles`}
            </p>

            <StatusBadge
              status={
                mode === "all"
                  ? "All Records"
                  : mode === "pending"
                    ? "Pending"
                    : "Confirmed"
              }
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1250px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-white">
                  {[
                    "Applicant",
                    "CNIC",
                    "Contact Information",
                    "Education",
                    "Experience",
                    "Status",
                    "Actions",
                  ].map((heading) => (
                    <th
                      key={heading}
                      scope="col"
                      className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <LoadingRows />
                ) : pageError ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-16 text-center text-sm text-slate-500"
                    >
                      Refresh the records to try again.
                    </td>
                  </tr>
                ) : filteredProfiles.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <HiOutlineUserCircle className="mx-auto h-12 w-12 text-slate-300" />

                      <p className="mt-3 font-semibold text-slate-800">
                        No profiles found
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {search
                          ? "Try another search term."
                          : `There are no ${
                              mode === "all" ? "" : `${mode} `
                            }profiles to display.`}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredProfiles.map((profile) => (
                    <tr
                      key={profile._id || profile.cnic}
                      className="align-top transition-colors hover:bg-emerald-50/30"
                    >
                      <td className="px-5 py-5">
                        <div className="flex min-w-[190px] items-center gap-3">
                          <ProfileAvatar cnic={profile.cnic} />
                          <div>
                            <p className="font-semibold text-slate-900">
                              {profile.profile?.name || "Unnamed applicant"}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              Applicant
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-5">
                        <div className="flex items-start gap-2 text-sm text-slate-700">
                          <HiOutlineIdentification className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                          <span className="whitespace-nowrap font-medium">
                            {profile.cnic}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-5">
                        <div className="min-w-[190px] space-y-3">
                          <InfoItem
                            icon={<HiOutlineEnvelope className="h-4 w-4" />}
                            label="Email"
                          >
                            {profile.profile?.email || "Not provided"}
                          </InfoItem>

                          <InfoItem
                            icon={<HiOutlinePhone className="h-4 w-4" />}
                            label="Phone"
                          >
                            {profile.profile?.mobileNumber || "Not provided"}
                          </InfoItem>
                        </div>
                      </td>

                      <td className="px-5 py-5">
                        <DetailsList
                          title="Education"
                          icon={<HiOutlineAcademicCap className="h-4 w-4" />}
                          emptyMessage="No education record"
                        >
                          {(profile.education || []).length > 0 ? (
                            <div className="space-y-3">
                              {(profile.education || []).map(
                                (education, index) => (
                                  <div
                                    key={`${education.title || "education"}-${index}`}
                                    className="border-l-2 border-emerald-200 pl-3"
                                  >
                                    <p className="font-semibold text-slate-800">
                                      {education.title || "Qualification"}
                                    </p>

                                    {education.equivalency && (
                                      <p className="mt-0.5 text-xs text-slate-500">
                                        {education.equivalency}
                                      </p>
                                    )}

                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                      {education.institute || "Institute not provided"}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-600">
                                      Marks: {formatValue(education.obtainedMarks)}
                                      {" / "}
                                      {formatValue(education.totalMarks)}
                                    </p>
                                  </div>
                                )
                              )}
                            </div>
                          ) : null}
                        </DetailsList>
                      </td>

                      <td className="px-5 py-5">
                        <DetailsList
                          title="Experience"
                          icon={<HiOutlineBriefcase className="h-4 w-4" />}
                          emptyMessage="No experience record"
                        >
                          {(profile.experience || []).length > 0 ? (
                            <div className="space-y-3">
                              {(profile.experience || []).map(
                                (experience, index) => (
                                  <div
                                    key={`${experience.positionTitle || "experience"}-${index}`}
                                    className="border-l-2 border-blue-200 pl-3"
                                  >
                                    <p className="font-semibold text-slate-800">
                                      {experience.positionTitle || "Position not specified"}
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                      {experience.department || "Department not specified"}
                                    </p>

                                    {experience.natureOfJob && (
                                      <p className="mt-1 text-xs text-slate-600">
                                        {experience.natureOfJob}
                                      </p>
                                    )}

                                    {experience.jobStartDate && (
                                      <p className="mt-1 text-xs text-slate-500">
                                        From: {experience.jobStartDate}
                                      </p>
                                    )}
                                  </div>
                                )
                              )}
                            </div>
                          ) : null}
                        </DetailsList>
                      </td>

                      <td className="px-5 py-5">
                        <StatusBadge status={profile.status} />
                      </td>

                      <td className="px-5 py-5">
                        <div className="flex min-w-[115px] flex-wrap items-center gap-2">
                          {profile.status === "Pending" && (
                            <button
                              type="button"
                              onClick={() => void updateStatus(profile.cnic)}
                              disabled={Boolean(busyKey)}
                              aria-label={`Confirm profile ${profile.cnic}`}
                              title="Confirm profile"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {busyKey === `confirm-${profile.cnic}` ? (
                                <HiOutlineArrowPath className="h-4 w-4 animate-spin" />
                              ) : (
                                <HiOutlineCheckCircle className="h-5 w-5" />
                              )}
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => void deleteProfile(profile)}
                            disabled={Boolean(busyKey)}
                            aria-label={`Delete profile ${profile.cnic}`}
                            title="Delete profile"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {busyKey === `delete-${profile.cnic}` ? (
                              <HiOutlineArrowPath className="h-4 w-4 animate-spin" />
                            ) : (
                              <HiOutlineTrash className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <footer className="flex flex-col gap-2 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-xs text-slate-500">
              KPPSC Administration Portal
            </p>
            <p className="text-xs text-slate-400">
              Applicant Profile Management
            </p>
          </footer>
        </section>
      </div>
    </main>
  );
}

