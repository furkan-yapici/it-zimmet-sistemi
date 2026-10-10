import { useEffect, useState } from "react";

function App() {
  const [apiStatus, setApiStatus] = useState<"yükleniyor" | "çalışıyor" | "bağlanamadı">("yükleniyor");

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
    fetch(`${apiUrl}/api/health`)
      .then((res) => {
        if (!res.ok) throw new Error("API yanıt vermedi");
        return res.json();
      })
      .then(() => setApiStatus("çalışıyor"))
      .catch(() => setApiStatus("bağlanamadı"));
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 text-slate-800">
      <h1 className="text-3xl font-semibold">IT Demirbaş ve Zimmet Yönetim Sistemi</h1>
      <p className="text-slate-500">
        Backend API durumu:{" "}
        <span
          className={
            apiStatus === "çalışıyor"
              ? "font-medium text-green-600"
              : apiStatus === "bağlanamadı"
                ? "font-medium text-red-600"
                : "font-medium text-slate-400"
          }
        >
          {apiStatus}
        </span>
      </p>
    </div>
  );
}

export default App;
