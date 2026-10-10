import type { Role } from "../auth/AuthContext";

export const roleLabels: Record<Role, string> = {
  ADMIN: "Yönetici",
  STAFF: "Personel",
};

export const inputClass =
  "w-full rounded border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500";
