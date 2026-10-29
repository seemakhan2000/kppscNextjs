
"use client";

import { useCallback, useState, type FormEvent } from "react";
import Link from "next/link";
import AuthToast from "../components/AuthToast";
import { loginUser } from "../services/auth.service";
import type {
  LoginFormData,
  ToastType,
} from "../types/auth.types";

const inputClass =
  "h-[42px] w-full rounded border border-slate-300 px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-green-600 focus:ring-4 focus:ring-green-100";

export default function LoginContent() {
  const [form, setForm] = useState<LoginFormData>({
    cnic: "",
    password: "",
  });

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      const result = await loginUser({
        cnic: form.cnic.trim(),
        password: form.password,
      });

      // Keep the existing profile page's CNIC lookup working.
      localStorage.setItem("currentUser", form.cnic.trim());

      // Store a token only if your backend actually returns one.
      if (typeof result.token === "string" && result.token) {
        localStorage.setItem("token", result.token);
      }

      showToast(result.message || "Logged in successfully.", "success");

      window.setTimeout(() => {
        window.location.href = "/profile";
      }, 1500);
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Server error. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-[#f8f8f8] bg-[url('https://www.transparenttextures.com/patterns/white-wall.png')] px-4 pb-10 pt-10 sm:pt-[60px]">
      <AuthToast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((previous) => ({
          ...previous,
          message: "",
        }))}
      />

      <header className="mb-7 w-full max-w-4xl text-center text-[#002147]">
        <h1 className="font-serif text-xl font-normal uppercase sm:text-[28px]">
          Khyber Pakhtunkhwa Public Service Commission
        </h1>
        <p className="mt-2 text-base sm:text-lg">
          Online Application System
        </p>
      </header>

      <section className="w-full max-w-[400px] rounded-md border border-slate-300 bg-white px-5 py-6 shadow-[0_0_10px_rgba(0,0,0,0.08)]">
        <p className="mb-5 text-center text-sm font-bold leading-relaxed text-slate-700">
          If you already have a user account, please enter your CNIC
          and password.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="cnic" className="sr-only">
              CNIC
            </label>
            <input
              id="cnic"
              name="cnic"
              className={inputClass}
              placeholder="CNIC"
              autoComplete="username"
              value={form.cnic}
              onChange={(e) =>
                setForm((previous) => ({
                  ...previous,
                  cnic: e.target.value,
                }))
              }
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className={inputClass}
              placeholder="Password"
              autoComplete="current-password"
              value={form.password}
              onChange={(e) =>
                setForm((previous) => ({
                  ...previous,
                  password: e.target.value,
                }))
              }
              required
            />
          </div>

          <div className="text-center">
            <button
              type="submit"
              disabled={loading}
              className="w-[70%] rounded bg-[#28a745] px-6 py-2 font-bold text-white transition hover:bg-[#218838] focus:outline-none focus:ring-4 focus:ring-green-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Logging In..." : "Log In"}
            </button>
          </div>

          <p className="mt-4 text-center text-[13px] text-slate-600">
            If you don&apos;t have a User Profile,{" "}
            <Link
              href="/signup"
              className="text-blue-700 hover:underline"
            >
              Create New User Account
            </Link>
          </p>
        </form>
      </section>

      <footer className="mt-7 max-w-2xl text-center text-xs leading-relaxed text-slate-700">
        <p className="font-bold">
          FOR ANY HELP, PLEASE CONTACT KP PSC:
        </p>

        <p>
          +92-91-9214131, 9212897, 9213563, 9213750 (EXT NO: 105)
        </p>
        <p>[Mon-Fri 9AM-5PM]</p>

        <p className="mt-5 text-red-600">
          Email your problem to us:
        </p>

        <p>
          <a
            href="mailto:online@kppsc.gov.pk"
            className="font-medium text-[#004080] hover:underline"
          >
            online@kppsc.gov.pk
          </a>
        </p>

        <p className="text-red-600">
          Write email in short, and must mention your CNIC number.
        </p>

        <a
          href="https://www.kppsc.gov.pk"
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-block text-[#004080] hover:underline"
        >
          www.kppsc.gov.pk
        </a>
      </footer>
    </main>
  );
}
