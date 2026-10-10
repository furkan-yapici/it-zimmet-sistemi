# İlerleme Durumu

## Biten işler

- [x] **Aşama 1: İskelet + Docker**
  - Git reposu başlatıldı, `.gitignore` eklendi (`.env`, `node_modules` hariç tutuluyor).
  - `/backend`: Node.js + Express + TypeScript iskeleti. `GET /api/health` endpoint'i `{ status: "ok" }` dönüyor.
  - `/frontend`: React + Vite + TypeScript + Tailwind CSS iskeleti. Basit bir karşılama ekranı backend health durumunu gösteriyor.
  - Kök dizinde `docker-compose.yml`: `db` (Postgres, healthcheck'li), `backend`, `frontend` servisleri.
  - `.env.example` oluşturuldu (DB, JWT, admin, port ayarları).
  - `docker compose up --build` ile test edildi: db healthy, backend `/api/health` → 200, frontend → 200 ve ekranda "Backend API durumu: çalışıyor" görünüyor.

## Kalan işler

- [ ] Aşama 2: Prisma şeması, migration, seed, login/logout, JWT, rol middleware'i
- [ ] Aşama 3: Kullanıcı yönetimi (admin CRUD)
- [ ] Aşama 4: Envanter + QR (cihaz CRUD, assetTag, QR üretimi)
- [ ] Aşama 5: Zimmet + geçmiş (zimmetleme, iade, arıza bildirme, ActivityLog, Zimmetlerim)
- [ ] Aşama 6: Liste özellikleri (sayfalama, arama, filtreler, toast)
- [ ] Aşama 7: Dashboard (istatistik kartları, grafik)
- [ ] Aşama 8: Cila (responsive kontrol, hata durumları, boş liste mesajları)
- [ ] Aşama 9: README
- [ ] Aşama 10: Mobil (bonus)

## Bilinen sorunlar / notlar

- Backend henüz PostgreSQL'e bağlanmıyor (Prisma Aşama 2'de eklenecek). `db` servisi şu an sadece ayakta ve healthcheck veriyor, backend tarafından kullanılmıyor.
- Frontend'de henüz React Router, toast kütüphanesi yok; bunlar ilgili aşamalarda eklenecek.
