"use client";

import Link from "next/link";
import { useState } from "react";
import AdminLoginModal from "./AdminLoginModal";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Advertisement", href: "/adver" },
  { label: "Schedule", href: "/sch" },
  { label: "E-Letters", href: "/e-Letters" },
  { label: "Results", href: "/result" },
  { label: "KPPSC Wings", href: "/wings" },
  { label: "Contacts", href: "/contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <>
      <nav className="relative z-40 bg-green-800 text-white shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="shrink-0 text-xl font-extrabold tracking-wide text-white"
          >
            KPPSC
          </Link>

          <button
            type="button"
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((previous) => !previous)}
            className="rounded-lg border border-white/30 p-2 text-white transition hover:bg-green-700 lg:hidden"
          >
            {menuOpen ? (
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m18 6-12 12M6 6l12 12" />
              </svg>
            ) : (
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>

          <div
            className={`${
              menuOpen ? "flex" : "hidden"
            } absolute left-0 right-0 top-full flex-col gap-2 border-t border-white/10 bg-green-800 p-4 shadow-xl lg:static lg:flex lg:flex-1 lg:flex-row lg:items-center lg:justify-between lg:gap-4 lg:border-0 lg:bg-transparent lg:p-0 lg:pl-8 lg:shadow-none`}
          >
            <div className="flex flex-col gap-1 lg:flex-row lg:items-center">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-white/95 transition hover:bg-green-700 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex flex-col gap-2 border-t border-white/15 pt-3 sm:flex-row lg:border-0 lg:pt-0">
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg bg-orange-500 px-4 py-2.5 text-center text-sm font-bold text-white transition hover:bg-orange-600"
              >
                Apply Online
              </Link>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  setLoginOpen(true);
                }}
                className="rounded-lg border border-white/40 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-500 hover:text-white bg-orange-500"
              >
                Admin Login
              </button>
            </div>
          </div>
        </div>
      </nav>

      <AdminLoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
      />
    </>
  );
}