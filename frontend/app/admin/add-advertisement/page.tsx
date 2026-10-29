
import type { Metadata } from "next";
import AddAdvertisement from "@/src/feature/admin/components/AddAdvertisement";

export const metadata: Metadata = {
  title: "Add Advertisement | KPPSC Admin",
  description:
    "Create, update, and manage KPPSC advertisements and public notices.",
};

export default function AddAdvertisementPage() {
  return <AddAdvertisement />;
}
