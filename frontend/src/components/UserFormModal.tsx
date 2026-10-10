import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import type { Role, User } from "../auth/AuthContext";
import { api, ApiError } from "../lib/api";
import { inputClass, roleLabels } from "../lib/labels";
import type { Department } from "../lib/types";
import Modal from "./Modal";

interface UserFormModalProps {
  user: User | null;
  departments: Department[];
  isSelf: boolean;
  onClose: () => void;
  onSaved: (savedUser: User) => void;
}

export default function UserFormModal({ user, departments, isSelf, onClose, onSaved }: UserFormModalProps) {
  const isEdit = user !== null;
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>(user?.role ?? "STAFF");
  const [departmentId, setDepartmentId] = useState(user ? String(user.department.id) : "");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body = { fullName, email, role, departmentId: Number(departmentId) };
      const data = isEdit
        ? await api<{ user: User }>(`/api/users/${user.id}`, { method: "PATCH", body })
        : await api<{ user: User }>("/api/users", { method: "POST", body: { ...body, password } });
      toast.success(isEdit ? "Kullanıcı güncellendi" : "Kullanıcı eklendi");
      onSaved(data.user);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "İşlem tamamlanamadı");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title={isEdit ? "Kullanıcıyı Düzenle" : "Yeni Kullanıcı"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-slate-700">
            Ad Soyad
          </label>
          <input
            id="fullName"
            required
            minLength={2}
            maxLength={100}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="userEmail" className="mb-1 block text-sm font-medium text-slate-700">
            E-posta
          </label>
          <input
            id="userEmail"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>

        {!isEdit && (
          <div>
            <label htmlFor="userPassword" className="mb-1 block text-sm font-medium text-slate-700">
              Şifre
            </label>
            <input
              id="userPassword"
              type="password"
              required
              minLength={8}
              maxLength={72}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-slate-500">En az 8 karakter olmalı.</p>
          </div>
        )}

        <div>
          <label htmlFor="userRole" className="mb-1 block text-sm font-medium text-slate-700">
            Rol
          </label>
          <select
            id="userRole"
            value={role}
            disabled={isSelf}
            onChange={(e) => setRole(e.target.value as Role)}
            className={inputClass}
          >
            {(Object.keys(roleLabels) as Role[]).map((r) => (
              <option key={r} value={r}>
                {roleLabels[r]}
              </option>
            ))}
          </select>
          {isSelf && <p className="mt-1 text-xs text-slate-500">Kendi rolünüzü değiştiremezsiniz.</p>}
        </div>

        <div>
          <label htmlFor="userDepartment" className="mb-1 block text-sm font-medium text-slate-700">
            Departman
          </label>
          <select
            id="userDepartment"
            required
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            className={inputClass}
          >
            <option value="">Seçin</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100"
          >
            Vazgeç
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
