
"use client";

import { useEffect } from "react";
import type { ToastType } from "../types/auth.types";

interface AuthToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export default function AuthToast({
  message,
  type,
  onClose,
}: AuthToastProps) {
  useEffect(() => {
    if (!message) return;

    const timer = window.setTimeout(onClose, 4000);

    return () => window.clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  const isSuccess = type === "success";

  return (
    <div
      role={isSuccess ? "status" : "alert"}
      className="fixed right-4 top-5 z-[100] flex w-[calc(100%-2rem)] max-w-sm items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xl"
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg ${
          isSuccess
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}
      >
        {isSuccess ? "✓" : "!"}
      </span>

      <p className="flex-1 text-sm font-medium text-slate-700">
        {message}
      </p>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close notification"
        className="text-xl text-slate-400 hover:text-slate-700"
      >
        ×
      </button>
    </div>
  );
}
