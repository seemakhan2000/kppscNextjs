import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto bg-green-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-5 text-center md:flex-row md:text-left">
          <div>
            <Link
              href="/"
              className="text-xl font-bold tracking-wide text-white"
            >
              KPPSC
            </Link>

            <p className="mt-2 max-w-md text-sm leading-6 text-green-100/80">
              Khyber Pakhtunkhwa Public Service Commission. Providing
              recruitment and examination services for provincial government
              positions.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-x-5 gap-y-3 text-sm text-green-100 md:justify-end">
            <Link
              href="/privacy-policy"
              className="transition hover:text-white hover:underline"
            >
              Privacy Policy
            </Link>

            <Link
              href="/terms"
              className="transition hover:text-white hover:underline"
            >
              Terms of Service
            </Link>

            <Link
              href="/contact"
              className="transition hover:text-white hover:underline"
            >
              Contact Us
            </Link>
          </div>
        </div>

        <div className="mt-7 border-t border-white/15 pt-5 text-center text-xs text-green-100/70">
        © 2026 Khyber Pakhtunkhwa Public Service
          Commission. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}