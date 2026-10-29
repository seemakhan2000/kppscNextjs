
"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import Header from "@/src/components/layout/Header";
import Navbar from "@/src/components/layout/Navbar";
import Footer from "@/src/components/layout/Footer";
import AdminNavbar from "@/src/components/layout/AdminNavbar";
import AdminLoginModal from "@/src/components/layout/AdminLoginModal";

const ADMIN_ROUTES = [
  "/admin/add-advertisement",
  "/admin/view-record",
  "/admin/pending",
  "/admin/confirmed",
  "/admin/dashboard",
  "/admin",
  "/admin/orders",
  "/admin/orders/pending",
  "/admin/orders/confirmed",
];

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const isAdminPage = ADMIN_ROUTES.some(
    (route) =>
      pathname === route || pathname.startsWith(`${route}/`)
  );

  useEffect(() => {
    const handleShowLogin = () => setIsLoginOpen(true);

    window.addEventListener("show-login-modal", handleShowLogin);

    return () => {
      window.removeEventListener("show-login-modal", handleShowLogin);
    };
  }, []);

  function logout() {
    localStorage.removeItem("adminLoginTime");
    localStorage.removeItem("user");
    sessionStorage.removeItem("adminToken");

    router.replace("/");
  }

  

return (
  <div className="flex min-h-screen flex-col bg-gray-50 font-sans">
    {isAdminPage ? (
      <>
        {/* Admin pages: only AdminNavbar, no main Header */}
        <AdminNavbar onLogout={logout} />
      </>
    ) : (
      <>
        {/* User pages: Header + normal Navbar */}
        <Header />
        <Navbar />
      </>
    )}

    <main className="flex-1">{children}</main>

    <Footer />

    {!isAdminPage && (
      <AdminLoginModal
        open={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />
    )}
  </div>
);

}
