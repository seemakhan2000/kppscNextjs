
import type { Metadata } from "next";
import "./globals.css";

import ConditionalLayout from "@/src/components/layout/ConditionalLayout";

export const metadata: Metadata = {
  title: "Khyber Pakhtunkhwa Public Service Commission",
  description:
    "KPPSC advertisements, examination schedules, results and online applications.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-gray-50 font-sans">
        <ConditionalLayout>{children}</ConditionalLayout>
      </body>
    </html>
  );
}
