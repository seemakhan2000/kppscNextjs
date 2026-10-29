
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  HiOutlineUsers,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineMagnifyingGlass,
  HiOutlineArrowPath,
  HiOutlineExclamationTriangle,
  HiOutlineMapPin,
  HiOutlineIdentification,
} from "react-icons/hi2";

interface DashboardStats {
  total: number;
  pending: number;
  confirmed: number;
}

interface Profile {
  _id?: string;
  cnic: string;
  status?: string;
  profile?: {
    name?: string;
    district?: string;
  };
}

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || ""
).replace(/\/+$/, "");

const EMPTY_STATS: DashboardStats = {
  total: 0,
  pending: 0,
  confirmed: 0,
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "An unexpected error occurred.";
}

async function fetchJSON<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Request failed (${response.status}). Please check the backend API.`
    );
  }

  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    throw new Error(
      "The server returned a non-JSON response. Please check the API endpoint."
    );
  }

  return response.json() as Promise<T>;
}

function StatusBadge({ status }: { status?: string }) {
  const normalizedStatus = (status || "unknown").toLowerCase();

  const styles: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
    confirmed: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    approved: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    rejected: "bg-red-50 text-red-700 ring-red-600/20",
    unknown: "bg-slate-100 text-slate-600 ring-slate-500/20",
  };

  const icons: Record<string, string> = {
    pending: "bg-amber-500",
    confirmed: "bg-emerald-500",
    approved: "bg-emerald-500",
    rejected: "bg-red-500",
    unknown: "bg-slate-400",
  };

  const label =
    normalizedStatus.charAt(0).toUpperCase() +
    normalizedStatus.slice(1);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
        styles[normalizedStatus] || styles.unknown
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          icons[normalizedStatus] || icons.unknown
        }`}
      />
      {label}
    </span>
  );
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  color,
  loading,
}: {
  title: string;
  value: number;
  description: string;
  icon: typeof HiOutlineUsers;
  color: "blue" | "amber" | "emerald";
  loading: boolean;
}) {
  const colors = {
    blue: {
      icon: "bg-blue-50 text-blue-700",
      accent: "bg-blue-600",
      ring: "ring-blue-100",
    },
    amber: {
      icon: "bg-amber-50 text-amber-700",
      accent: "bg-amber-500",
      ring: "ring-amber-100",
    },
    emerald: {
      icon: "bg-emerald-50 text-emerald-700",
      accent: "bg-emerald-600",
      ring: "ring-emerald-100",
    },
  };

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg sm:p-6">
      <div
        className={`absolute inset-x-0 top-0 h-1 ${colors[color].accent}`}
      />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-500">{title}</p>

          <div
            className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
            aria-live="polite"
          >
            {loading ? (
              <span className="inline-block h-9 w-20 animate-pulse rounded-lg bg-slate-100" />
            ) : (
              value.toLocaleString()
            )}
          </div>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            {description}
          </p>
        </div>

        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ring-1 ${colors[color].icon} ${colors[color].ring}`}
        >
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
      </div>
    </article>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [profilesLoading, setProfilesLoading] = useState(true);
  const [statsError, setStatsError] = useState("");
  const [profilesError, setProfilesError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError("");

    try {
      const data = await fetchJSON<DashboardStats>(
        `${API_BASE_URL}/api/dashboard/stats`
      );

      if (
        typeof data?.total !== "number" ||
        typeof data?.pending !== "number" ||
        typeof data?.confirmed !== "number"
      ) {
        throw new Error("The dashboard stats response has an invalid format.");
      }

      setStats(data);
    } catch (error) {
      setStatsError(getErrorMessage(error));
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const loadProfiles = useCallback(async () => {
    setProfilesLoading(true);
    setProfilesError("");

    try {
      const data = await fetchJSON<Profile[]>(
        `${API_BASE_URL}/api/dashboard/profiles`
      );

      if (!Array.isArray(data)) {
        throw new Error("The profiles API did not return a valid list.");
      }

      setProfiles(data);
    } catch (error) {
      setProfilesError(getErrorMessage(error));
    } finally {
      setProfilesLoading(false);
    }
  }, []);

  const refreshDashboard = useCallback(async () => {
    setRefreshing(true);

    try {
      await Promise.all([loadDashboardStats(), loadProfiles()]);
    } finally {
      setRefreshing(false);
    }
  }, [loadDashboardStats, loadProfiles]);

  useEffect(() => {
    void refreshDashboard();
  }, [refreshDashboard]);

  const filteredProfiles = profiles.filter((profile) => {
    const name = profile.profile?.name || "";
    const cnic = profile.cnic || "";
    const district = profile.profile?.district || "";
    const status = (profile.status || "unknown").toLowerCase();

    const searchTerm = search.trim().toLowerCase();

    const matchesSearch =
      !searchTerm ||
      name.toLowerCase().includes(searchTerm) ||
      cnic.toLowerCase().includes(searchTerm) ||
      district.toLowerCase().includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" || status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const hasError = Boolean(statsError || profilesError);
  const isLoading = statsLoading || profilesLoading;

  return (
    <main className="min-h-[calc(100vh-76px)] bg-slate-50">
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8 xl:px-8">
        {/* Page heading */}
        <section className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Administration / Dashboard
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Dashboard Overview
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Monitor applicant profiles, review pending records, and track
              confirmation status from one place.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void refreshDashboard()}
            disabled={refreshing}
            className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800 disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
          >
            <HiOutlineArrowPath
              className={`h-5 w-5 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh Data
          </button>
        </section>

        {/* API errors */}
        {hasError && (
          <div
            role="alert"
            className="mb-6 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-start"
          >
            <HiOutlineExclamationTriangle className="h-5 w-5 shrink-0 text-red-600" />

            <div className="min-w-0 flex-1">
              <p className="font-semibold text-red-800">
                Some dashboard data could not be loaded
              </p>

              {statsError && (
                <p className="mt-1 break-words text-sm text-red-700">
                  Statistics: {statsError}
                </p>
              )}

              {profilesError && (
                <p className="mt-1 break-words text-sm text-red-700">
                  Profiles: {profilesError}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => void refreshDashboard()}
              className="shrink-0 rounded-lg px-3 py-2 text-sm font-semibold text-red-800 hover:bg-red-100"
            >
              Try again
            </button>
          </div>
        )}

        {/* Statistics cards */}
        <section
          aria-label="Profile statistics"
          className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 xl:gap-5"
        >
          <StatCard
            title="Total Profiles"
            value={stats.total}
            description="All registered applicant profiles"
            icon={HiOutlineUsers}
            color="blue"
            loading={statsLoading}
          />

          <StatCard
            title="Pending Profiles"
            value={stats.pending}
            description="Profiles awaiting confirmation"
            icon={HiOutlineClock}
            color="amber"
            loading={statsLoading}
          />

          <StatCard
            title="Confirmed Profiles"
            value={stats.confirmed}
            description="Successfully confirmed profiles"
            icon={HiOutlineCheckCircle}
            color="emerald"
            loading={statsLoading}
          />
        </section>

        {/* Profiles table */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                All Profiles
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                View and filter applicant records.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative min-w-0 sm:min-w-[250px]">
                <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search name, CNIC, district..."
                  aria-label="Search profiles"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                aria-label="Filter profiles by status"
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-5 py-3 sm:px-6">
            <p className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-800">
                {profilesLoading ? "—" : filteredProfiles.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-800">
                {profilesLoading ? "—" : profiles.length}
              </span>{" "}
              profiles
            </p>

            {(search || statusFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                }}
                className="text-sm font-semibold text-emerald-700 hover:text-emerald-900"
              >
                Clear filters
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-white">
                  <th
                    scope="col"
                    className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500"
                  >
                    Applicant
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500"
                  >
                    CNIC
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500"
                  >
                    District
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {profilesLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index}>
                      {Array.from({ length: 4 }).map((__, cellIndex) => (
                        <td key={cellIndex} className="px-6 py-5">
                          <div className="h-4 animate-pulse rounded-md bg-slate-100" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : profilesError ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center">
                      <HiOutlineExclamationTriangle className="mx-auto h-8 w-8 text-red-400" />
                      <p className="mt-3 font-semibold text-slate-800">
                        Unable to load profiles
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Check the API endpoint and try refreshing the data.
                      </p>
                    </td>
                  </tr>
                ) : filteredProfiles.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center">
                      <HiOutlineUsers className="mx-auto h-9 w-9 text-slate-300" />

                      <p className="mt-3 font-semibold text-slate-800">
                        No profiles found
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {search || statusFilter !== "all"
                          ? "Try changing your search or filters."
                          : "Applicant profiles will appear here when available."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredProfiles.map((profile, index) => (
                    <tr
                      key={profile._id || profile.cnic || index}
                      className="transition-colors hover:bg-emerald-50/40"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                            <HiOutlineIdentification className="h-5 w-5" />
                          </span>

                          <div>
                            <p className="font-semibold text-slate-800">
                              {profile.profile?.name || "Not provided"}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-400">
                              Applicant #{index + 1}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-slate-600">
                          {profile.cnic || "—"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge status={profile.status} />
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <HiOutlineMapPin className="h-4 w-4 shrink-0 text-slate-400" />
                          {profile.profile?.district || "—"}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-2 border-t border-slate-100 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-xs text-slate-500">
              KPPSC Administration Portal
            </p>

            <p className="text-xs text-slate-400">
              Data is retrieved from the connected backend API.
            </p>
          </div>
        </section>

        <footer className="py-6 text-center text-xs text-slate-400">
          Khyber Pakhtunkhwa Public Service Commission
        </footer>
      </div>
    </main>
  );
}
