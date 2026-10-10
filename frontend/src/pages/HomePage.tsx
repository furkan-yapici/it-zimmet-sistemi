import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../auth/AuthContext";

const roleLabels = { ADMIN: "Yönetici", STAFF: "Personel" } as const;

export default function HomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    toast.success("Çıkış yapıldı");
    navigate("/login", { replace: true });
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="flex items-center justify-between gap-4 bg-white px-6 py-4 shadow-sm">
        <h1 className="text-lg font-semibold">IT Demirbaş ve Zimmet Yönetim Sistemi</h1>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-slate-600">
            {user.fullName} ({roleLabels[user.role]})
          </span>
          <button
            onClick={handleLogout}
            className="rounded border border-slate-300 px-3 py-1.5 hover:bg-slate-100"
          >
            Çıkış Yap
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl p-6">
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-xl font-semibold">Hoş geldiniz, {user.fullName}</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex gap-2">
              <dt className="w-28 text-slate-500">E-posta</dt>
              <dd>{user.email}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-28 text-slate-500">Rol</dt>
              <dd>{roleLabels[user.role]}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-28 text-slate-500">Departman</dt>
              <dd>{user.department.name}</dd>
            </div>
          </dl>
        </div>
      </main>
    </div>
  );
}
