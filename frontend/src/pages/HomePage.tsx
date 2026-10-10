import { useAuth } from "../auth/AuthContext";
import { roleLabels } from "../lib/labels";

export default function HomePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-3xl rounded-lg bg-white p-6 shadow">
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
  );
}
