"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }
  return (
    <button onClick={logout} className="inline-flex items-center gap-1 rounded-full bg-coffee-100 px-4 py-2 text-sm font-semibold text-coffee-800 hover:bg-coffee-200">
      <LogOut className="h-4 w-4" /> Sair
    </button>
  );
}
