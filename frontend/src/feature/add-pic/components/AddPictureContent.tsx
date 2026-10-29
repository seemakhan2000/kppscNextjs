
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");
const navigationItems = [
  { label: "1: Complete Your Profile", href: "/profile" },
  { label: "2: Add Education", href: "/add-education" },
  { label: "3: Add Experience", href: "/add-experience" },
  { label: "4: Add Picture", href: "/add-pic" },
  { label: "5: Apply for Posts", href: "/finalProfile" },
];

type ToastType = "success" | "error";

type ToastState = {
  message: string;
  type: ToastType;
} | null;

type ProfileData = {
  profile?: {
    cnic?: string;
    photo?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

export default function AddPictureContent() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState("");
  const [toast, setToast] = useState<ToastState>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("finalProfileData");

      if (stored) {
        const profileData = JSON.parse(stored) as ProfileData;
        const existingPhoto = profileData.profile?.photo;

        if (existingPhoto) {
          setPreviewImage(existingPhoto);
        }
      }
    } catch (error) {
      console.error("Unable to load profile photo:", error);
    } finally {
      setIsReady(true);
    }

    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setToast({
        message: "Only image files are allowed.",
        type: "error",
      });

      event.target.value = "";
      setSelectedFile(null);
      setUploadStatus("");
      return;
    }

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }

    const localPreviewUrl = URL.createObjectURL(file);

    previewUrlRef.current = localPreviewUrl;
    setSelectedFile(file);
    setPreviewImage(localPreviewUrl);
    setUploadStatus("");
  }

  async function handleUpload() {
    if (!selectedFile) {
      setToast({
        message: "Please select a photo first.",
        type: "error",
      });
      return;
    }

    let storedData: ProfileData;

    try {
      const rawData = localStorage.getItem("finalProfileData");

      storedData = rawData ? JSON.parse(rawData) : {};

      const cnic = storedData.profile?.cnic;

      if (!cnic) {
        setToast({
          message: "CNIC not found in profile.",
          type: "error",
        });
        return;
      }

      const formData = new FormData();
      formData.append("photo", selectedFile);

      setIsUploading(true);
      setUploadStatus("Uploading your photograph...");

      const response = await fetch(
        `${API_BASE_URL}/api/photo/${encodeURIComponent(cnic)}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Error uploading photo."
        );
      }

      if (!data.photo || typeof data.photo !== "string") {
        throw new Error("The server did not return a photo URL.");
      }

      const imageURL = /^https?:\/\//i.test(data.photo)
        ? data.photo
        : `${API_BASE_URL}${data.photo.startsWith("/") ? "" : "/"}${data.photo}`;

      const latestRaw = localStorage.getItem("finalProfileData");
      const latestData: ProfileData = latestRaw
        ? JSON.parse(latestRaw)
        : storedData;

      latestData.profile = {
        ...latestData.profile,
        ...storedData.profile,
        photo: imageURL,
      };

      localStorage.setItem(
        "finalProfileData",
        JSON.stringify(latestData)
      );

      setPreviewImage(imageURL);
      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }

      setUploadStatus("Your photograph has been uploaded successfully.");

      setToast({
        message: "Photo uploaded successfully!",
        type: "success",
      });
    } catch (error) {
      console.error("Photo upload failed:", error);

      setUploadStatus("");

      setToast({
        message:
          error instanceof Error
            ? error.message
            : "Error uploading photo. Please try again.",
        type: "error",
      });
    } finally {
      setIsUploading(false);
    }
  }

  const labelClass = "text-sm font-semibold text-gray-800";

  return (
    <div className="min-h-screen bg-[#f7f8fa] font-sans text-gray-800">
      {/* Toast notification */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed right-4 top-5 z-50 flex max-w-sm items-start gap-3 rounded-xl px-5 py-4 text-sm font-medium text-white shadow-xl ${
            toast.type === "success" ? "bg-green-700" : "bg-red-600"
          }`}
        >
          <span aria-hidden="true" className="text-lg">
            {toast.type === "success" ? "✓" : "!"}
          </span>

          <span>{toast.message}</span>

          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Close notification"
            className="ml-2 text-lg leading-none"
          >
            ×
          </button>
        </div>
      )}

      {/* Header */}
      <header className="bg-[#2e7d32] px-4 py-3 text-center text-base font-bold text-white shadow-sm sm:px-6 sm:text-lg">
        Khyber Pakhtunkhwa Public Service Commission
      </header>

      <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          {/* Sidebar */}
          <aside className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="mb-4 border-b border-gray-100 pb-3 text-base font-bold text-[#2c3e50]">
              Steps to Apply
            </h2>

            <nav aria-label="Application steps" className="space-y-1.5">
              {navigationItems.map((item) => {
                const active = item.href === "/add-pic";

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`block rounded-lg px-3 py-3 text-sm transition ${
                      active
                        ? "bg-green-600 font-semibold text-white shadow-sm"
                        : "text-gray-700 hover:bg-green-50 hover:text-green-800"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Upload card */}
          <section className="min-w-0 rounded-xl border border-gray-200 bg-white p-5 shadow-[0_8px_30px_rgba(20,40,80,0.08)] sm:p-8">
            <div className="mb-7 border-b border-gray-100 pb-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                  Profile Picture Upload
                </h2>

                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-800">
                  Step 4 of 5
                </span>
              </div>

              <p className="mt-2 text-sm text-gray-500">
                Upload your latest photograph for your KPPSC profile.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,1.3fr)_minmax(220px,0.7fr)]">
              {/* Instructions and file selection */}
              <div className="min-w-0">
                <h3 className="text-base font-bold text-gray-900">
                  Add Latest Photograph [Face only]
                </h3>

                <div
                  dir="rtl"
                  className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-4 text-right text-sm leading-8 text-gray-700"
                >
                  <p className="mb-2 font-bold text-blue-900">
                    ضروری ہدایات:
                  </p>
                  <p>
                    نمبر1: تصویر کو پہلے 200×200 سائز میں کرلیں جس میں
                    آپکا چہرہ واضح نظر آئے۔
                  </p>
                  <p>
                    نمبر2: صرف فرنٹ پوز میں کھینچی گئی واضح تصویر اپلوڈ
                    کریں۔
                  </p>
                  <p>نمبر3: تین ماہ سے زیادہ پُرانی تصویر نہ ہو۔</p>
                  <p>نمبر4: ماسک یا نقاب والی تصاویر قابل قبول نہیں۔</p>
                </div>

                <div className="mt-6">
                  <label htmlFor="photoUpload" className={labelClass}>
                    Select Photograph
                  </label>

                  <input
                    ref={fileInputRef}
                    id="photoUpload"
                    name="photo"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={!isReady || isUploading}
                    className="mt-2 block w-full cursor-pointer rounded-lg border border-gray-300 bg-white text-sm text-gray-700 file:mr-4 file:border-0 file:bg-gray-100 file:px-4 file:py-3 file:text-sm file:font-semibold file:text-gray-700 hover:file:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <p className="mt-2 text-xs leading-5 text-gray-500">
                    Choose an image file. A preview will appear before
                    uploading.
                  </p>
                </div>

                <button
                  id="uploadBtn"
                  type="button"
                  onClick={handleUpload}
                  disabled={!isReady || isUploading}
                  className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {isUploading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <span aria-hidden="true">↑</span>
                      Upload Photo
                    </>
                  )}
                </button>

                {uploadStatus && (
                  <p
                    id="uploadStatus"
                    aria-live="polite"
                    className="mt-3 text-sm text-gray-600"
                  >
                    {uploadStatus}
                  </p>
                )}
              </div>

              {/* Photo preview */}
              <div className="flex flex-col items-center">
                <h3 className="mb-4 text-sm font-bold text-gray-800">
                  Photograph Preview
                </h3>

                <div className="flex min-h-[250px] w-full max-w-[250px] items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-3">
                  {previewImage ? (
                    <img
                      id="previewImage"
                      src={previewImage}
                      alt="Uploaded Photo Preview"
                      className="max-h-[250px] w-full rounded-lg object-contain"
                    />
                  ) : (
                    <div className="px-4 text-center">
                      <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-3xl text-gray-500">
                        ♙
                      </div>
                      <p className="text-sm font-medium text-gray-600">
                        No photograph selected
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        Your photo preview will appear here.
                      </p>
                    </div>
                  )}
                </div>

                <p className="mt-3 text-center text-xs leading-5 text-gray-500">
                  Please ensure your face is clearly visible in the
                  photograph.
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              <strong>Important:</strong> Your photograph is sent to the
              backend only when you click Upload Photo. The preview alone
              does not upload or save the file.
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
