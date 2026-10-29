
import type { Metadata } from "next";
import AdminDashboard from "@/src/feature/admin/components/AdminDashboard";

export const metadata: Metadata = {
  title: "Admin Dashboard | KPPSC",
  description:
    "Manage and monitor KPPSC applicant profiles and confirmation records.",
};

export default function AdminDashboardPage() {
  return <AdminDashboard />;
}
