import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../auth/AuthContext";
import { roleLabels } from "../lib/labels";

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  if (!user) return null;

  async function handleLogout() {
    await logout();
    toast.success("Çıkış yapıldı");
    navigate("/login", { replace: true });
  }

  const links = [
    { to: "/", label: "Ana Sayfa", end: true },
    ...(user.role === "ADMIN" ? [{ to: "/users", label: "Kullanıcılar", end: false }] : []),
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 md:flex">
      <header className="flex items-center justify-between bg-white px-4 py-3 shadow-sm md:hidden">
        <span className="font-semibold">IT Zimmet Sistemi</span>
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Menüyü aç/kapat"
          aria-expanded={menuOpen}
          className="rounded border border-slate-300 px-3 py-1.5 text-sm"
        >
          {menuOpen ? "Kapat" : "Menü"}
        </button>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-30 bg-slate-900/40 md:hidden" onClick={() => setMenuOpen(false)} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-white shadow transition-transform md:static md:translate-x-0 md:shadow-none md:border-r md:border-slate-200 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-5 py-5">
          <h1 className="text-lg font-semibold leading-tight">IT Demirbaş ve Zimmet Yönetim Sistemi</h1>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `block rounded px-3 py-2 text-sm font-medium ${
                  isActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-4 text-sm">
          <p className="font-medium">{user.fullName}</p>
          <p className="text-slate-500">{roleLabels[user.role]}</p>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-3 w-full rounded border border-slate-300 px-3 py-1.5 hover:bg-slate-100"
          >
            Çıkış Yap
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
