
"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  HiOutlineSquares2X2,
  HiOutlinePlusCircle,
  HiOutlineClipboardDocumentList,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineArrowLeftOnRectangle,
  HiOutlineBars3,
  HiOutlineXMark,
  HiOutlineShieldCheck,
  HiOutlineCalendarDays, 
} from "react-icons/hi2";

interface AdminNavbarProps {
  onLogout: () => void;
}

const adminLinks = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: HiOutlineSquares2X2,
  },
  {
    label: "Add Advertisement",
    href: "/admin/add-advertisement",
    icon: HiOutlinePlusCircle,
  },
  {
    label: "All Records",
    href: "/admin/view-record",
    icon: HiOutlineClipboardDocumentList,
  },
  {
    label: "Pending Records",
    href: "/admin/pending",
    icon: HiOutlineClock,
  },
  {
    label: "Confirmed Records",
    href: "/admin/confirmed",
    icon: HiOutlineCheckCircle,
  },
  {
    label: "Add Schedule",                 
    href: "/admin/add-schedule",
    icon: HiOutlineCalendarDays,
  },
];

export default function AdminNavbar({
  onLogout,
}: AdminNavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  function handleLogout() {
    setMenuOpen(false);
    onLogout();
  }

  function isActiveRoute(href: string) {
    if (href === "/admin/dashboard") {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#073b24] text-white shadow-lg shadow-black/10">
      <nav
        aria-label="Admin navigation"
        className="mx-auto max-w-[1600px] px-4 sm:px-6 xl:px-8"
      >
        <div className="flex min-h-[76px] items-center justify-between gap-4">
          {/* Brand */}
          <Link
            href="/admin/dashboard"
            onClick={() => setMenuOpen(false)}
            aria-label="KPPSC Admin Dashboard"
            className="group flex shrink-0 items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/10 shadow-inner transition group-hover:bg-white/15">
              <HiOutlineShieldCheck className="h-7 w-7 text-emerald-200" />
            </span>

            <span className="flex flex-col">
              <span className="text-xl font-extrabold leading-tight tracking-tight">
                KPPSC
              </span>
              <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-200">
                Administration
              </span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-1 xl:flex">
            {adminLinks.map((link) => {
              const active = isActiveRoute(link.href);
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`group relative flex items-center gap-2 rounded-lg px-3 py-3 text-[13px] font-semibold transition-colors duration-200 ${
                    active
                      ? "bg-white/12 text-white"
                      : "text-white/75 hover:bg-white/[0.07] hover:text-white"
                  }`}
                >
                  <Icon
                    className={`h-[19px] w-[19px] shrink-0 ${
                      active
                        ? "text-emerald-300"
                        : "text-white/65 group-hover:text-emerald-200"
                    }`}
                  />

                  <span>{link.label}</span>

                  {active && (
                    <span className="absolute inset-x-3 bottom-0 h-[2px] rounded-full bg-emerald-300" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 md:flex">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-50" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
              </span>
              <span className="text-xs font-medium text-white/80">
                Admin Panel
              </span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-red-300/25 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-100 transition hover:border-red-300/50 hover:bg-red-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 sm:px-4"
            >
              <HiOutlineArrowLeftOnRectangle className="h-5 w-5" />
              <span>Logout</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setMenuOpen((previous) => !previous)}
              aria-label={
                menuOpen
                  ? "Close navigation menu"
                  : "Open navigation menu"
              }
              aria-expanded={menuOpen}
              aria-controls="admin-mobile-navigation"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-white/[0.06] transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 xl:hidden"
            >
              {menuOpen ? (
                <HiOutlineXMark className="h-6 w-6" />
              ) : (
                <HiOutlineBars3 className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile and Tablet Navigation */}
        <div
          id="admin-mobile-navigation"
          className={`overflow-hidden transition-[max-height,opacity,padding] duration-300 xl:hidden ${
            menuOpen
              ? "max-h-[480px] border-t border-white/10 pb-4 pt-3 opacity-100"
              : "max-h-0 border-t border-transparent py-0 opacity-0"
          }`}
          aria-hidden={!menuOpen}
          inert={!menuOpen}
        >
          <div className="grid gap-1 sm:grid-cols-2">
            {adminLinks.map((link) => {
              const active = isActiveRoute(link.href);
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  tabIndex={menuOpen ? 0 : -1}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition ${
                    active
                      ? "bg-emerald-300/15 text-emerald-100 ring-1 ring-inset ring-emerald-300/20"
                      : "text-white/80 hover:bg-white/[0.07] hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{link.label}</span>

                  {active && (
                    <HiOutlineCheckCircle className="ml-auto h-5 w-5 text-emerald-300" />
                  )}
                </Link>
              );
            })}
          </div>

          <p className="mt-3 border-t border-white/10 pt-3 text-xs leading-5 text-white/50">
            Khyber Pakhtunkhwa Public Service Commission
          </p>
        </div>
      </nav>
    </header>
  );
}
