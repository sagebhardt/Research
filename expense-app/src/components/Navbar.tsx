"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  const user = session?.user;
  const role = (user as { role?: string } | undefined)?.role;

  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/expenses", label: "Gastos" },
    { href: "/reports", label: "Informes" },
  ];

  if (role === "MANAGER" || role === "ADMIN") {
    navLinks.push({ href: "/approvals", label: "Aprobaciones" });
  }

  if (role === "ADMIN") {
    navLinks.push({ href: "/admin", label: "Admin" });
  }

  const roleBadgeColor: Record<string, string> = {
    ADMIN: "bg-red-100 text-red-700",
    MANAGER: "bg-amber-100 text-amber-700",
    EMPLOYEE: "bg-green-100 text-green-700",
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="text-lg font-bold text-gray-900">
            Rinde YNK
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-3 sm:flex">
              <span className="text-sm font-medium text-gray-700">
                {user.name}
              </span>
              {role && (
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${roleBadgeColor[role] ?? "bg-gray-100 text-gray-700"}`}
                >
                  {role}
                </span>
              )}
            </div>

            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
