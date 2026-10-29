
"use client";

import { useCallback, useState, type FormEvent } from "react";
import Link from "next/link";
import AuthToast from "../components/AuthToast";
import { registerUser } from "../services/auth.service";
import type {
  SignupFormData,
  ToastType,
} from "../types/auth.types";

const initialForm: SignupFormData = {
  name: "",
  gender: "",
  cnic: "",
  district: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const inputClass =
  "h-[45px] w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-green-600 focus:ring-4 focus:ring-green-100";

const labelClass =
  "mb-1 block text-sm font-semibold text-slate-700";

export default function SignupContent() {
  const [form, setForm] = useState<SignupFormData>(initialForm);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({
    message: "",
    type: "success" as ToastType,
  });

  const showToast = useCallback(
    (message: string, type: ToastType = "success") => {
      setToast({ message, type });
    },
    []
  );

  function updateField(
    field: keyof SignupFormData,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    if (form.password !== form.confirmPassword) {
      showToast("Passwords do not match!", "error");
      return;
    }

    setLoading(true);

    try {
      // Confirm password is for frontend validation only.
      // Do not send it to the backend.
      const { confirmPassword, ...registrationData } = form;
      const result = await registerUser(registrationData);

      // Preserve the legacy application's localStorage behavior.
      const allUsers = JSON.parse(
        localStorage.getItem("allUsers") || "{}"
      );

      allUsers[form.cnic] = {
        profile: {
          ...registrationData,
        },
      };

      localStorage.setItem("allUsers", JSON.stringify(allUsers));
      localStorage.setItem("currentUser", form.cnic);

      showToast(
        result.message || "Signup successful!",
        "success"
      );

      setForm(initialForm);

      window.setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "An error occurred. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-[#f8f8f8] bg-[url('https://www.transparenttextures.com/patterns/white-wall.png')] px-4 py-10 sm:px-6">
      <AuthToast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((previous) => ({
          ...previous,
          message: "",
        }))}
      />

      <header className="mb-9 w-full max-w-4xl text-center">
        <h1 className="font-serif text-xl font-semibold uppercase leading-snug text-[#0a2b5e] sm:text-[28px]">
          Khyber Pakhtunkhwa Public Service Commission
        </h1>
        <p className="mt-1 text-base text-[#0a2b5e] sm:text-lg">
          Online Application System
        </p>
      </header>

      <section className="w-full max-w-[600px] rounded-xl bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.12)] sm:p-[30px] sm:py-[35px]">
        <h2 className="mb-6 text-2xl font-bold text-[#0a2b5e]">
          New User Profile
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>
                Full Name <span className="text-red-600">*</span>
              </label>
              <input
                className={inputClass}
                name="name"
                placeholder="NAME"
                autoComplete="name"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                required
              />
            </div>

            <div>
              <label className={labelClass}>
                Gender <span className="text-red-600">*</span>
              </label>
              <select
                className={inputClass}
                name="gender"
                value={form.gender}
                onChange={(e) => updateField("gender", e.target.value)}
                required
              >
                <option value="">[ Select Gender ]</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>
                Computerized National Identity Card{" "}
                <span className="text-red-600">*</span>
              </label>
              <input
                className={inputClass}
                name="cnic"
                placeholder="CNIC"
                autoComplete="off"
                value={form.cnic}
                onChange={(e) => updateField("cnic", e.target.value)}
                required
              />
            </div>

            <div>
              <label className={labelClass}>
                District of Domicile / Area / Zone{" "}
                <span className="text-red-600">*</span>
              </label>
              <select
                className={inputClass}
                name="district"
                value={form.district}
                onChange={(e) => updateField("district", e.target.value)}
                required
              >
                <option value="">[ Select District / Zone ]</option>
                <option value="Peshawar">Peshawar</option>
                <option value="Mardan">Mardan</option>
                <option value="Bannu">Bannu</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>
                Email Address <span className="text-red-600">*</span>
              </label>
              <input
                type="email"
                className={inputClass}
                name="email"
                placeholder="EMAIL ADDRESS"
                autoComplete="off"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                required
              />
            </div>

            <div>
              <label className={labelClass}>
                Password <span className="text-red-600">*</span>
              </label>
              <input
                type="password"
                className={inputClass}
                name="password"
                placeholder="Password"
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => updateField("password", e.target.value)}
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>
                Re-enter Password{" "}
                <span className="text-red-600">*</span>
              </label>
              <input
                type="password"
                className={inputClass}
                name="confirmPassword"
                placeholder="Re-enter Password"
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={(e) =>
                  updateField("confirmPassword", e.target.value)
                }
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-lg bg-[#28a745] px-4 py-3 text-base font-semibold text-white transition hover:bg-[#218838] focus:outline-none focus:ring-4 focus:ring-green-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating Profile..." : "Create New User Profile"}
          </button>

          <p className="mt-4 text-center text-sm text-slate-600">
            Already have an Account?{" "}
            <Link
              href="/login"
              className="font-semibold text-blue-600 hover:underline"
            >
              Login
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
}
