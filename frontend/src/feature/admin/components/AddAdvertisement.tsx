"use client";

import type { ChangeEvent, FormEvent } from "react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  HiOutlinePlus,
  HiOutlineMegaphone,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineDocumentArrowDown,
  HiOutlinePhoto,
  HiOutlineDocumentText,
  HiOutlineCalendarDays,
  HiOutlineMagnifyingGlass,
  HiOutlineArrowPath,
  HiOutlineXMark,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineExclamationTriangle,
  HiOutlineEye,
  HiOutlineCloudArrowUp,
  HiOutlineInformationCircle,
} from "react-icons/hi2";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const API_URL = `${API_BASE_URL}/api/ads`;


const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_PDF_SIZE = 10 * 1024 * 1024;

interface Advertisement {
  _id: string;
  title: string;
  description: string;
  startDate?: string | null;
  endDate?: string | null;
  image?: string | null;
  pdf?: string | null;
  createdAt?: string | null;
}

interface AdvertisementForm {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  image: File | null;
  pdf: File | null;
}

type ToastType = "success" | "error" | "info";

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

const EMPTY_FORM: AdvertisementForm = {
  title: "",
  description: "",
  startDate: "",
  endDate: "",
  image: null,
  pdf: null,
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}

async function readResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") || "";
  let data: unknown = null;

  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const responseText = await response.text();
    data = responseText ? { message: responseText } : null;
  }

  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof data.message === "string"
        ? data.message
        : typeof data === "object" &&
            data !== null &&
            "error" in data &&
            typeof data.error === "string"
          ? data.error
          : `Request failed with status ${response.status}.`;

    throw new Error(message);
  }

  return data as T;
}

function buildUrl(path?: string | null): string | null {
  if (!path?.trim()) return null;

  const cleanPath = path.trim();

  if (/^(javascript|data|vbscript):/i.test(cleanPath)) {
    return null;
  }

  if (/^https?:\/\//i.test(cleanPath)) {
    try {
      const parsed = new URL(cleanPath);

      return ["http:", "https:"].includes(parsed.protocol)
        ? parsed.href
        : null;
    } catch {
      return null;
    }
  }

  if (cleanPath.startsWith("//")) return null;

  return `${API_BASE_URL}/${cleanPath.replace(/^\/+/, "")}`;
}

/** Display date and time in the user's local timezone. */
function formatDateTime(value?: string | null): string {
  if (!value) return "—";

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

/** Convert a saved ISO date into a datetime-local input value. */
function toDateTimeLocalValue(value?: string | null): string {
  if (!value) return "";

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) return "";

  const localDate = new Date(
    parsed.getTime() - parsed.getTimezoneOffset() * 60_000
  );

  return localDate.toISOString().slice(0, 16);
}

function validateImage(file: File): string | null {
  if (!file.type.startsWith("image/")) {
    return "Please select a valid image file.";
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return "Image size must not exceed 5 MB.";
  }

  return null;
}

function validatePdf(file: File): string | null {
  if (
    file.type !== "application/pdf" ||
    !file.name.toLowerCase().endsWith(".pdf")
  ) {
    return "Please select a valid PDF file.";
  }

  if (file.size > MAX_PDF_SIZE) {
    return "PDF size must not exceed 10 MB.";
  }

  return null;
}

function getFormError(form: AdvertisementForm): string | null {
  if (!form.title.trim()) {
    return "Advertisement title is required.";
  }

  if (!form.description.trim()) {
    return "Advertisement description is required.";
  }

  if (!form.startDate || !form.endDate) {
    return "Please select both start and end dates and times.";
  }

  const start = new Date(form.startDate).getTime();
  const end = new Date(form.endDate).getTime();

  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    return "Please enter valid start and end dates.";
  }

  if (end < start) {
    return "End date and time cannot be earlier than the start date and time.";
  }

  if (form.image) {
    const error = validateImage(form.image);
    if (error) return error;
  }

  if (form.pdf) {
    const error = validatePdf(form.pdf);
    if (error) return error;
  }

  return null;
}

function StatusBadge({ ad }: { ad: Advertisement }) {
  const now = Date.now();
  const start = ad.startDate ? new Date(ad.startDate).getTime() : NaN;
  const end = ad.endDate ? new Date(ad.endDate).getTime() : NaN;

  let label = "Unscheduled";
  let styles = "bg-slate-100 text-slate-600";

  if (Number.isFinite(start) && Number.isFinite(end)) {
    if (now < start) {
      label = "Upcoming";
      styles = "bg-blue-50 text-blue-700";
    } else if (now <= end) {
      label = "Active";
      styles = "bg-emerald-50 text-emerald-700";
    } else {
      label = "Expired";
      styles = "bg-red-50 text-red-700";
    }
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${styles}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

function Toasts({
  items,
  onDismiss,
}: {
  items: ToastMessage[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div
      className="fixed right-4 top-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3"
      aria-live="polite"
    >
      {items.map((toast) => {
        const success = toast.type === "success";
        const info = toast.type === "info";

        const Icon = success
          ? HiOutlineCheckCircle
          : info
            ? HiOutlineInformationCircle
            : HiOutlineExclamationCircle;

        const colors = success
          ? "border-emerald-200 bg-white text-emerald-800"
          : info
            ? "border-blue-200 bg-white text-blue-800"
            : "border-red-200 bg-white text-red-800";

        return (
          <div
            key={toast.id}
            className={`flex items-start gap-3 rounded-xl border p-4 shadow-xl ${colors}`}
            role={success ? "status" : "alert"}
          >
            <Icon className="mt-0.5 h-5 w-5 shrink-0" />

            <p className="flex-1 text-sm font-medium leading-5">
              {toast.message}
            </p>

            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
              className="rounded-md p-1 opacity-70 hover:bg-slate-100 hover:opacity-100"
            >
              <HiOutlineXMark className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

function FileUpload({
  label,
  accept,
  selectedFile,
  existingLabel,
  icon: Icon,
  onChange,
  error,
}: {
  label: string;
  accept: string;
  selectedFile: File | null;
  existingLabel?: string;
  icon: typeof HiOutlinePhoto;
  onChange: (file: File | null) => void;
  error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null;
    onChange(file);
    event.target.value = "";
  }

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`flex min-h-[112px] w-full flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-5 text-center transition hover:border-emerald-400 hover:bg-emerald-50/50 ${
          error
            ? "border-red-300 bg-red-50/30"
            : "border-slate-200 bg-slate-50/60"
        }`}
      >
        <Icon className="h-7 w-7 text-emerald-700" />

        <span className="mt-2 break-all text-sm font-semibold text-slate-800">
          {selectedFile?.name || existingLabel || "Choose a file"}
        </span>

        <span className="mt-1 text-xs text-slate-500">
          {selectedFile
            ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`
            : `Click to upload · ${accept}`}
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
      />

      {selectedFile && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="mt-2 text-xs font-semibold text-red-600 hover:text-red-800"
        >
          Remove selected file
        </button>
      )}

      {error && (
        <p className="mt-2 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function AdvertisementFormFields({
  form,
  setForm,
  imagePreview,
  onImageChange,
  onPdfChange,
  editImageUrl,
  editPdfUrl,
  errors,
}: {
  form: AdvertisementForm;
  setForm: React.Dispatch<React.SetStateAction<AdvertisementForm>>;
  imagePreview: string | null;
  onImageChange: (file: File | null) => void;
  onPdfChange: (file: File | null) => void;
  editImageUrl?: string | null;
  editPdfUrl?: string | null;
  errors?: string | null;
}) {
  return (
    <div className="space-y-5">
      {errors && (
        <div
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {errors}
        </div>
      )}

      <div>
        <label
          htmlFor="ad-title"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Advertisement Title <span className="text-red-500">*</span>
        </label>

        <input
          id="ad-title"
          type="text"
          required
          maxLength={200}
          value={form.title}
          onChange={(event) =>
            setForm((previous) => ({
              ...previous,
              title: event.target.value,
            }))
          }
          placeholder="Enter advertisement title"
          className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
        />
      </div>

      <div>
        <label
          htmlFor="ad-description"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Description <span className="text-red-500">*</span>
        </label>

        <textarea
          id="ad-description"
          required
          rows={4}
          maxLength={10000}
          value={form.description}
          onChange={(event) =>
            setForm((previous) => ({
              ...previous,
              description: event.target.value,
            }))
          }
          placeholder="Enter advertisement details"
          className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
        />

        <p className="mt-1 text-right text-xs text-slate-400">
          {form.description.length}/10000
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="ad-start-date"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Start Date &amp; Time <span className="text-red-500">*</span>
          </label>

          <input
            id="ad-start-date"
            type="datetime-local"
            required
            value={form.startDate}
            max={form.endDate || undefined}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                startDate: event.target.value,
              }))
            }
            className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
          />
        </div>

        <div>
          <label
            htmlFor="ad-end-date"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            End Date &amp; Time <span className="text-red-500">*</span>
          </label>

          <input
            id="ad-end-date"
            type="datetime-local"
            required
            value={form.endDate}
            min={form.startDate || undefined}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                endDate: event.target.value,
              }))
            }
            className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <FileUpload
            label="Advertisement Image"
            accept="image/*"
            selectedFile={form.image}
            existingLabel={editImageUrl ? "Current image available" : undefined}
            icon={HiOutlinePhoto}
            onChange={onImageChange}
            error={
              form.image ? validateImage(form.image) || undefined : undefined
            }
          />

          {(imagePreview || editImageUrl) && (
            <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Image preview
              </p>

              <img
                src={imagePreview || editImageUrl || ""}
                alt="Advertisement preview"
                className="max-h-48 w-full rounded-lg object-contain"
              />
            </div>
          )}
        </div>

        <div>
          <FileUpload
            label="Advertisement PDF"
            accept="application/pdf,.pdf"
            selectedFile={form.pdf}
            existingLabel={editPdfUrl ? "Current PDF available" : undefined}
            icon={HiOutlineDocumentText}
            onChange={onPdfChange}
            error={form.pdf ? validatePdf(form.pdf) || undefined : undefined}
          />

          {editPdfUrl && (
            <a
              href={editPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-900"
            >
              <HiOutlineEye className="h-4 w-4" />
              View current PDF
            </a>
          )}

          <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">
            <p>Image: maximum 5 MB</p>
            <p>PDF: maximum 10 MB</p>
            <p>Image and PDF attachments are optional.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AddAdvertisement() {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pageError, setPageError] = useState("");
  const [search, setSearch] = useState("");

  const [form, setForm] = useState<AdvertisementForm>(EMPTY_FORM);
  const [editForm, setEditForm] = useState<AdvertisementForm>(EMPTY_FORM);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);

  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [formError, setFormError] = useState("");
  const [editError, setEditError] = useState("");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toastCounter = useRef(0);
  const addPreviewUrlRef = useRef<string | null>(null);
  const editPreviewUrlRef = useRef<string | null>(null);

  const notify = useCallback(
    (message: string, type: ToastType = "success") => {
      const id = ++toastCounter.current;

      setToasts((previous) => [...previous, { id, message, type }]);

      window.setTimeout(() => {
        setToasts((previous) =>
          previous.filter((toast) => toast.id !== id)
        );
      }, 4500);
    },
    []
  );

  const dismissToast = useCallback((id: number) => {
    setToasts((previous) => previous.filter((toast) => toast.id !== id));
  }, []);

  const loadAds = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);

    setPageError("");

    try {
      const response = await fetch(API_URL, {
        method: "GET",
        cache: "no-store",
        headers: { Accept: "application/json" },
      });

      const data = await readResponse<Advertisement[]>(response);

      if (!Array.isArray(data)) {
        throw new Error("The advertisements API returned an invalid list.");
      }

      setAds(data);
      console.log("Advertisements API response:", data);
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAds();

    return () => {
      if (addPreviewUrlRef.current) {
        URL.revokeObjectURL(addPreviewUrlRef.current);
      }

      if (editPreviewUrlRef.current) {
        URL.revokeObjectURL(editPreviewUrlRef.current);
      }
    };
  }, [loadAds]);

  // Prevent background page scrolling while the edit modal is open.
  useEffect(() => {
    if (!editingAd) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !saving) {
        setEditingAd(null);
        setEditError("");
        setEditForm(EMPTY_FORM);
        setEditImagePreview(null);

        if (editPreviewUrlRef.current) {
          URL.revokeObjectURL(editPreviewUrlRef.current);
          editPreviewUrlRef.current = null;
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [editingAd, saving]);

  const filteredAds = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return ads;

    return ads.filter(
      (ad) =>
        ad.title.toLowerCase().includes(query) ||
        ad.description.toLowerCase().includes(query)
    );
  }, [ads, search]);

  function updateImagePreview(file: File | null, mode: "add" | "edit") {
    const previewRef =
      mode === "add" ? addPreviewUrlRef : editPreviewUrlRef;

    const setPreview =
      mode === "add" ? setImagePreview : setEditImagePreview;

    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = null;
    }

    if (file) {
      const error = validateImage(file);

      if (error) {
        setPreview(null);
        notify(error, "error");
        return;
      }

      const url = URL.createObjectURL(file);
      previewRef.current = url;
      setPreview(url);
    } else {
      setPreview(null);
    }
  }

  function handleAddImageChange(file: File | null) {
    setForm((previous) => ({ ...previous, image: file }));
    updateImagePreview(file, "add");
  }

  function handleEditImageChange(file: File | null) {
    setEditForm((previous) => ({ ...previous, image: file }));
    updateImagePreview(file, "edit");
  }

  function handleAddPdfChange(file: File | null) {
    if (file) {
      const error = validatePdf(file);

      if (error) {
        notify(error, "error");
        return;
      }
    }

    setForm((previous) => ({ ...previous, pdf: file }));
  }

  function handleEditPdfChange(file: File | null) {
    if (file) {
      const error = validatePdf(file);

      if (error) {
        notify(error, "error");
        return;
      }
    }

    setEditForm((previous) => ({ ...previous, pdf: file }));
  }

  function clearAddForm() {
    setForm(EMPTY_FORM);
    setFormError("");
    setImagePreview(null);

    if (addPreviewUrlRef.current) {
      URL.revokeObjectURL(addPreviewUrlRef.current);
      addPreviewUrlRef.current = null;
    }
  }

  function closeEditModal() {
    if (saving) return;

    setEditingAd(null);
    setEditError("");
    setEditForm(EMPTY_FORM);
    setEditImagePreview(null);

    if (editPreviewUrlRef.current) {
      URL.revokeObjectURL(editPreviewUrlRef.current);
      editPreviewUrlRef.current = null;
    }
  }

  function openEditModal(ad: Advertisement) {
    setEditingAd(ad);
    setEditError("");
    setEditImagePreview(null);

    if (editPreviewUrlRef.current) {
      URL.revokeObjectURL(editPreviewUrlRef.current);
      editPreviewUrlRef.current = null;
    }

    setEditForm({
      title: ad.title || "",
      description: ad.description || "",
      startDate: toDateTimeLocalValue(ad.startDate),
      endDate: toDateTimeLocalValue(ad.endDate),
      image: null,
      pdf: null,
    });
  }

  function createFormData(data: AdvertisementForm): FormData {
    const formData = new FormData();

    formData.append("title", data.title.trim());
    formData.append("description", data.description.trim());
    formData.append("startDate", data.startDate);
    formData.append("endDate", data.endDate);

    if (data.image) formData.append("image", data.image);
    if (data.pdf) formData.append("pdf", data.pdf);

    return formData;
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const error = getFormError(form);

    if (error) {
      setFormError(error);
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        body: createFormData(form),
      });

      await readResponse<unknown>(response);

      clearAddForm();
      notify("Advertisement created successfully.");
      await loadAds(false);
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingAd) return;

    const error = getFormError(editForm);

    if (error) {
      setEditError(error);
      return;
    }

    setSaving(true);
    setEditError("");

    try {
      const response = await fetch(
        `${API_URL}/${encodeURIComponent(editingAd._id)}`,
        {
          method: "PUT",
          body: createFormData(editForm),
        }
      );

      await readResponse<unknown>(response);

      setEditingAd(null);
      setEditForm(EMPTY_FORM);
      setEditImagePreview(null);

      if (editPreviewUrlRef.current) {
        URL.revokeObjectURL(editPreviewUrlRef.current);
        editPreviewUrlRef.current = null;
      }

      notify("Advertisement updated successfully.");
      await loadAds(false);
    } catch (error) {
      setEditError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(ad: Advertisement) {
    const confirmed = window.confirm(
      `Delete "${ad.title}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(ad._id);

    try {
      const response = await fetch(
        `${API_URL}/${encodeURIComponent(ad._id)}`,
        { method: "DELETE" }
      );

      await readResponse<unknown>(response);

      notify("Advertisement deleted successfully.");
      await loadAds(false);
    } catch (error) {
      notify(getErrorMessage(error), "error");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <Toasts items={toasts} onDismiss={dismissToast} />

      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8 xl:px-8">
        <section className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-emerald-700">
              <HiOutlineMegaphone className="h-4 w-4" />
              Administration / Advertisements
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Add Advertisement
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Publish public notices, manage attachments, and update
              announcements.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
            <HiOutlineMegaphone className="h-6 w-6 text-emerald-700" />

            <div>
              <p className="text-lg font-bold text-emerald-900">
                {ads.length}
              </p>

              <p className="text-xs font-medium text-emerald-700">
                Total advertisements
              </p>
            </div>
          </div>
        </section>

        {/* Create Advertisement */}
        <section className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5 sm:px-7">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <HiOutlinePlus className="h-6 w-6" />
            </span>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Create New Advertisement
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Complete the details to publish a notice.
              </p>
            </div>
          </div>

          <form onSubmit={handleCreate} className="p-5 sm:p-7">
            <AdvertisementFormFields
              form={form}
              setForm={setForm}
              imagePreview={imagePreview}
              onImageChange={handleAddImageChange}
              onPdfChange={handleAddPdfChange}
              errors={formError}
            />

            <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={saving}
                onClick={clearAddForm}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Clear Form
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#087443] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#065d35] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <HiOutlineArrowPath className="h-5 w-5 animate-spin" />
                ) : (
                  <HiOutlineCloudArrowUp className="h-5 w-5" />
                )}

                {saving ? "Saving Advertisement..." : "Save Advertisement"}
              </button>
            </div>
          </form>
        </section>

        {/* Advertisements Table */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                All Advertisements
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Review and manage published notices.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative sm:min-w-[270px]">
                <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search advertisements..."
                  aria-label="Search advertisements"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
                />
              </div>

              <button
                type="button"
                onClick={() => void loadAds()}
                disabled={loading}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                <HiOutlineArrowPath
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>
          </div>

          {pageError && (
            <div
              role="alert"
              className="m-5 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center"
            >
              <HiOutlineExclamationTriangle className="h-5 w-5 shrink-0 text-red-600" />

              <p className="flex-1 break-words text-sm text-red-800">
                {pageError}
              </p>

              <button
                type="button"
                onClick={() => void loadAds()}
                className="self-start rounded-lg px-3 py-2 text-sm font-semibold text-red-800 hover:bg-red-100 sm:self-auto"
              >
                Retry
              </button>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 border-y border-slate-100 bg-slate-50/70 px-5 py-3 sm:px-6">
            <p className="text-sm text-slate-500">
              {loading
                ? "Loading advertisements..."
                : `${filteredAds.length} advertisement${filteredAds.length === 1 ? "" : "s"} found`}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-white">
                  {[
                    "#",
                    "Advertisement",
                    "Description",
                    "Schedule (Date & Time)",
                    "Image",
                    "PDF",
                    "Posted On (Date & Time)",
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
                  Array.from({ length: 4 }).map((_, index) => (
                    <tr key={index}>
                      {Array.from({ length: 8 }).map((__, cell) => (
                        <td key={cell} className="px-5 py-5">
                          <div className="h-4 animate-pulse rounded bg-slate-100" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : pageError ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center">
                      <HiOutlineExclamationTriangle className="mx-auto h-9 w-9 text-red-400" />

                      <p className="mt-3 font-semibold text-slate-800">
                        Advertisements could not be loaded
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        Check your backend connection and retry.
                      </p>
                    </td>
                  </tr>
                ) : filteredAds.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center">
                      <HiOutlineMegaphone className="mx-auto h-10 w-10 text-slate-300" />

                      <p className="mt-3 font-semibold text-slate-800">
                        No advertisements found
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {search
                          ? "Try a different search term."
                          : "Create your first advertisement using the form above."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredAds.map((ad, index) => {
                    const imageUrl = buildUrl(ad.image);
                    const pdfUrl = buildUrl(ad.pdf);

                    return (
                      <tr
                        key={ad._id}
                        className="align-middle transition-colors hover:bg-emerald-50/30"
                      >
                        <td className="px-5 py-5 text-sm font-medium text-slate-400">
                          {index + 1}
                        </td>

                        <td className="max-w-[220px] px-5 py-5">
                          <p className="font-semibold leading-5 text-slate-800">
                            {ad.title}
                          </p>

                          <div className="mt-2">
                            <StatusBadge ad={ad} />
                          </div>
                        </td>

                        <td className="max-w-[250px] px-5 py-5">
                          <p className="line-clamp-3 whitespace-pre-line text-sm leading-6 text-slate-600">
                            {ad.description || "—"}
                          </p>
                        </td>

                        <td className="px-5 py-5">
                          <div className="space-y-3 text-xs text-slate-600">
                            <div>
                              <p className="mb-1 font-semibold text-slate-400">
                                START
                              </p>

                              <p className="flex items-start gap-1.5">
                                <HiOutlineCalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />

                                <span className="whitespace-nowrap">
                                  {formatDateTime(ad.startDate)}
                                </span>
                              </p>
                            </div>

                            <div>
                              <p className="mb-1 font-semibold text-slate-400">
                                END
                              </p>

                              <p className="flex items-start gap-1.5">
                                <HiOutlineCalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />

                                <span className="whitespace-nowrap">
                                  {formatDateTime(ad.endDate)}
                                </span>
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-5">
                          {imageUrl ? (
                            <a
                              href={imageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Open advertisement image"
                              className="block w-fit rounded-lg border border-slate-200 bg-slate-50 p-1.5 hover:border-emerald-300"
                            >
                              <img
                                src={imageUrl}
                                alt={`${ad.title} advertisement`}
                                loading="lazy"
                                className="h-16 w-20 rounded-md object-contain"
                              />
                            </a>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                              <HiOutlinePhoto className="h-4 w-4" />
                              No image
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-5">
                          {pdfUrl ? (
                            <a
                              href={pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100"
                            >
                              <HiOutlineDocumentArrowDown className="h-4 w-4" />
                              View PDF
                            </a>
                          ) : (
                            <span className="text-xs text-slate-400">
                              No PDF
                            </span>
                          )}
                        </td>

                        <td className="whitespace-nowrap px-5 py-5 text-sm text-slate-500">
                          {formatDateTime(ad.createdAt)}
                        </td>

                        <td className="px-5 py-5">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal(ad)}
                              disabled={Boolean(deletingId) || saving}
                              aria-label={`Edit ${ad.title}`}
                              title="Edit advertisement"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                            >
                              <HiOutlinePencilSquare className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => void handleDelete(ad)}
                              disabled={Boolean(deletingId) || saving}
                              aria-label={`Delete ${ad.title}`}
                              title="Delete advertisement"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50"
                            >
                              {deletingId === ad._id ? (
                                <HiOutlineArrowPath className="h-4 w-4 animate-spin" />
                              ) : (
                                <HiOutlineTrash className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-2 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-xs text-slate-500">
              KPPSC Administration Portal
            </p>

            <p className="text-xs text-slate-400">
              Advertisement management
            </p>
          </div>
        </section>
      </div>

      {/* Edit Advertisement Modal — scrolling fixed */}
      {editingAd && (
        <div
          className="fixed inset-0 z-[90] overflow-y-auto overscroll-contain bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeEditModal();
            }
          }}
          role="presentation"
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-ad-title"
            className="mx-auto my-3 w-full max-w-3xl rounded-2xl bg-white shadow-2xl sm:my-6"
          >
            {/* Modal header */}
            <div className="flex items-center justify-between gap-4 rounded-t-2xl border-b border-slate-100 bg-white px-5 py-5 sm:px-7">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <HiOutlinePencilSquare className="h-6 w-6" />
                </span>

                <div>
                  <h2
                    id="edit-ad-title"
                    className="text-lg font-bold text-slate-900"
                  >
                    Edit Advertisement
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Update the notice and its attachments.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeEditModal}
                disabled={saving}
                aria-label="Close edit modal"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
              >
                <HiOutlineXMark className="h-6 w-6" />
              </button>
            </div>

            {/* Scrollable form area */}
            <form
              onSubmit={handleUpdate}
              className="max-h-[calc(100dvh-130px)] overflow-y-auto overscroll-contain p-5 sm:max-h-[calc(100dvh-160px)] sm:p-7"
            >
              <AdvertisementFormFields
                form={editForm}
                setForm={setEditForm}
                imagePreview={editImagePreview}
                onImageChange={handleEditImageChange}
                onPdfChange={handleEditPdfChange}
                editImageUrl={buildUrl(editingAd.image)}
                editPdfUrl={buildUrl(editingAd.pdf)}
                errors={editError}
              />

              {/* Form actions remain at the bottom of the scrollable form */}
              <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 bg-white pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={saving}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#087443] px-6 py-3 text-sm font-semibold text-white hover:bg-[#065d35] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <HiOutlineArrowPath className="h-5 w-5 animate-spin" />
                  ) : (
                    <HiOutlineCheckCircle className="h-5 w-5" />
                  )}

                  {saving ? "Updating..." : "Update Advertisement"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}