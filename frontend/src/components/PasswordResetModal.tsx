import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import type { User } from "../auth/AuthContext";
import { api, ApiError } from "../lib/api";
import { inputClass } from "../lib/labels";
import Modal from "./Modal";

interface PasswordResetModalProps {
  user: User;
  onClose: () => void;
}

export default function PasswordResetModal({ user, onClose }: PasswordResetModalProps) {
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api(`/api/users/${user.id}/password`, { method: "PUT", body: { password } });
      toast.success("Şifre güncellendi");
      onClose();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Şifre güncellenemedi");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal title="Şifre Sıfırla" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-slate-600">
          <span className="font-medium">{user.fullName}</span> için yeni bir şifre belirleyin.
        </p>
        <div>
          <label htmlFor="newPassword" className="mb-1 block text-sm font-medium text-slate-700">
            Yeni Şifre
          </label>
          <input
            id="newPassword"
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
            {submitting ? "Kaydediliyor..." : "Şifreyi Güncelle"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
