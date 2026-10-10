import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth, type User } from "../auth/AuthContext";
import ConfirmDialog from "../components/ConfirmDialog";
import PasswordResetModal from "../components/PasswordResetModal";
import UserFormModal from "../components/UserFormModal";
import { api, ApiError } from "../lib/api";
import { roleLabels } from "../lib/labels";
import type { Department } from "../lib/types";

export default function UsersPage() {
  const { user: currentUser, refreshUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [formTarget, setFormTarget] = useState<User | "new" | null>(null);
  const [passwordTarget, setPasswordTarget] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      const data = await api<{ data: User[] }>("/api/users?limit=100");
      setUsers(data.data);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Kullanıcılar yüklenemedi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
    api<{ data: Department[] }>("/api/departments")
      .then((data) => setDepartments(data.data))
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Departmanlar yüklenemedi"));
  }, [loadUsers]);

  async function handleSaved(saved: User) {
    setFormTarget(null);
    await loadUsers();
    if (saved.id === currentUser?.id) {
      await refreshUser();
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api(`/api/users/${deleteTarget.id}`, { method: "DELETE" });
      toast.success("Kullanıcı silindi");
      setDeleteTarget(null);
      await loadUsers();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Kullanıcı silinemedi");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Kullanıcılar</h2>
        <button
          type="button"
          onClick={() => setFormTarget("new")}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Yeni Kullanıcı
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg bg-white shadow">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Ad Soyad</th>
              <th className="px-4 py-3 font-medium">E-posta</th>
              <th className="px-4 py-3 font-medium">Rol</th>
              <th className="px-4 py-3 font-medium">Departman</th>
              <th className="px-4 py-3 text-right font-medium">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Yükleniyor...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Henüz kullanıcı yok.
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const isSelf = u.id === currentUser?.id;
                return (
                  <tr key={u.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3 font-medium">
                      {u.fullName}
                      {isSelf && <span className="ml-2 text-xs font-normal text-slate-500">(Siz)</span>}
                    </td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          u.role === "ADMIN" ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {roleLabels[u.role]}
                      </span>
                    </td>
                    <td className="px-4 py-3">{u.department.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setFormTarget(u)}
                          className="rounded border border-slate-300 px-2.5 py-1 hover:bg-slate-100"
                        >
                          Düzenle
                        </button>
                        <button
                          type="button"
                          onClick={() => setPasswordTarget(u)}
                          className="rounded border border-slate-300 px-2.5 py-1 hover:bg-slate-100"
                        >
                          Şifre
                        </button>
                        {!isSelf && (
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(u)}
                            className="rounded border border-red-200 px-2.5 py-1 text-red-600 hover:bg-red-50"
                          >
                            Sil
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {formTarget !== null && (
        <UserFormModal
          user={formTarget === "new" ? null : formTarget}
          departments={departments}
          isSelf={formTarget !== "new" && formTarget.id === currentUser?.id}
          onClose={() => setFormTarget(null)}
          onSaved={handleSaved}
        />
      )}

      {passwordTarget && <PasswordResetModal user={passwordTarget} onClose={() => setPasswordTarget(null)} />}

      {deleteTarget && (
        <ConfirmDialog
          title="Kullanıcıyı Sil"
          message={`${deleteTarget.fullName} adlı kullanıcı silinecek. Bu işlem geri alınamaz.`}
          confirmLabel="Sil"
          busy={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
