
"use client";

import { useState, type FormEvent } from "react";
import { contactOffices } from "../data/contact.data";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

export default function ContactContent() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      subject: String(formData.get("subject") || "").trim(),
      message: String(formData.get("message") || "").trim(),
    };

    if (
      !payload.name ||
      !payload.email ||
      !payload.subject ||
      !payload.message
    ) {
      setFeedback({
        type: "error",
        message: "Please fill in all fields.",
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || `Request failed (${response.status}).`
        );
      }

      form.reset();

      setFeedback({
        type: "success",
        message:
          result.message || "Your message has been submitted successfully.",
      });
    } catch (error) {
      console.error("Contact form submission failed:", error);

      setFeedback({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to submit your message. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <span className="inline-block rounded-full bg-green-50 px-4 py-1.5 text-sm font-semibold text-green-800">
          Get in Touch
        </span>

        <h1 className="mt-4 text-3xl font-bold text-gray-900 sm:text-4xl">
          Contact KPPSC
        </h1>

        <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-gray-600">
          Have a question or need assistance? Contact our offices or send
          us a message using the form below.
        </p>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2 lg:gap-8">
        <section
          className="space-y-6"
          aria-label="Office contact details"
        >
          {contactOffices.map((office) => (
            <article
              key={office.id}
              className="rounded-xl border border-gray-200 bg-gray-50 p-6 shadow-sm transition hover:shadow-md sm:p-7"
            >
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-800">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-6 w-6"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-5h6v5M9 9h.01M15 9h.01M9 12h.01M15 12h.01"
                    />
                  </svg>
                </div>

                <h2 className="text-xl font-bold text-green-800">
                  {office.title}
                </h2>
              </div>

              <div className="space-y-4 text-sm leading-6 text-gray-700">
                <div>
                  <p className="font-semibold text-gray-900">Address</p>
                  <p>{office.address}</p>
                </div>

                <div>
                  <p className="font-semibold text-gray-900">Phone</p>
                  <a
                    href={`tel:${office.phone.replace(/\s/g, "")}`}
                    className="text-green-800 hover:underline"
                  >
                    {office.phone}
                  </a>
                </div>

                <div>
                  <p className="font-semibold text-gray-900">Email</p>
                  <a
                    href={`mailto:${office.email}`}
                    className="break-all text-green-800 hover:underline"
                  >
                    {office.email}
                  </a>
                </div>

                {office.fax && (
                  <div>
                    <p className="font-semibold text-gray-900">Fax</p>
                    <p>{office.fax}</p>
                  </div>
                )}
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Send us a Message
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              Fill out the form below and provide the details of your inquiry.
            </p>
          </div>

          {feedback && (
            <div
              role="status"
              aria-live="polite"
              className={`mb-5 rounded-lg border p-4 text-sm ${
                feedback.type === "success"
                  ? "border-green-200 bg-green-50 text-green-800"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {feedback.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="contact-name"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Your Name
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                autoComplete="name"
                maxLength={100}
                placeholder="Enter your full name"
                required
                disabled={isSubmitting}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-700 focus:ring-2 focus:ring-green-100 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label
                htmlFor="contact-email"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Your Email
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                maxLength={254}
                placeholder="name@example.com"
                required
                disabled={isSubmitting}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-700 focus:ring-2 focus:ring-green-100 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label
                htmlFor="contact-subject"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Subject
              </label>
              <input
                id="contact-subject"
                name="subject"
                type="text"
                maxLength={200}
                placeholder="Enter message subject"
                required
                disabled={isSubmitting}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-700 focus:ring-2 focus:ring-green-100 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label
                htmlFor="contact-message"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Message
              </label>
              <textarea
                id="contact-message"
                name="message"
                rows={5}
                maxLength={5000}
                placeholder="Write your message here..."
                required
                disabled={isSubmitting}
                className="w-full resize-y rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-700 focus:ring-2 focus:ring-green-100 disabled:bg-gray-100"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-md bg-[#f86b19] px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Submitting..." : "Submit Message"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
