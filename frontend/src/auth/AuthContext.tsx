import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, tokenStorage } from "../lib/api";

export type Role = "ADMIN" | "STAFF";

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: Role;
  createdAt: string;
  department: { id: number; name: string };
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() => tokenStorage.get() !== null);

  useEffect(() => {
    if (!tokenStorage.get()) return;
    api<{ user: User }>("/api/auth/me")
      .then((data) => setUser(data.user))
      .catch(() => tokenStorage.clear())
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api<{ token: string; user: User }>("/api/auth/login", {
      method: "POST",
      body: { email, password },
    });
    tokenStorage.set(data.token);
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api("/api/auth/logout", { method: "POST" });
    } catch {
      // Sunucuya ulaşılamasa da yerel oturum kapatılır
    }
    tokenStorage.clear();
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth, AuthProvider içinde kullanılmalı");
  return ctx;
}
