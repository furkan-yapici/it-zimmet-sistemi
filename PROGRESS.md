# İlerleme Durumu

## Biten işler

- [x] **Aşama 1: İskelet + Docker**
  - Git reposu başlatıldı, `.gitignore` eklendi (`.env`, `node_modules` hariç tutuluyor).
  - `/backend`: Node.js + Express + TypeScript iskeleti. `GET /api/health` endpoint'i `{ status: "ok" }` dönüyor.
  - `/frontend`: React + Vite + TypeScript + Tailwind CSS iskeleti. Basit bir karşılama ekranı backend health durumunu gösteriyor.
  - Kök dizinde `docker-compose.yml`: `db` (Postgres, healthcheck'li), `backend`, `frontend` servisleri.
  - `.env.example` oluşturuldu (DB, JWT, admin, port ayarları).
  - `docker compose up --build` ile test edildi: db healthy, backend `/api/health` → 200, frontend → 200 ve ekranda "Backend API durumu: çalışıyor" görünüyor.

- [x] **Aşama 2: Veritabanı + Auth**
  - Prisma 7 kuruldu. `backend/prisma/schema.prisma` içinde tüm modeller var: Department, User, Device, Assignment, ActivityLog (+ Role, DeviceType, DeviceStatus, ActivityAction enum'ları). İlk migration (`20261010132736_init`) oluşturuldu.
  - Seed (`backend/prisma/seed.ts`): `.env`'deki bilgilerle admin, 4 departman, 4 demo personel, 10 demo cihaz (bazıları zimmetli) ve ilgili ActivityLog kayıtları. Tekrar çalıştırılınca veri çoğalmaz.
  - Auth: `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`. Şifreler bcrypt ile hash'li, JWT `Authorization: Bearer` ile taşınıyor, girdiler zod ile doğrulanıyor, hatalar `{ message }` biçiminde Türkçe.
  - Middleware: `authenticate` (token doğrular, kullanıcıyı veritabanından yükler; rol her zaman veritabanından okunur) ve `requireRole("ADMIN")`.
  - Backend açılışta `prisma generate`, `migrate deploy` ve `db seed` komutlarını çalıştırıyor (`npm run docker:start`).
  - Frontend: React Router, `sonner` toast kütüphanesi, giriş sayfası, oturum yönetimi (AuthContext), korumalı rota (`ProtectedRoute`, rol parametresi destekli) ve çıkış butonu olan basit ana sayfa.
  - Test edildi: temiz bir veritabanından `docker compose up --build` ile migration + seed otomatik çalıştı; login (doğru/yanlış şifre, geçersiz girdi), `/me`, logout, rol kontrolü (admin 200, personel 403, süresi dolmuş/sahte/silinmiş kullanıcı token'ı 401) ve tarayıcıda giriş → yenileme → çıkış akışı doğrulandı.

## Kalan işler

- [ ] Aşama 3: Kullanıcı yönetimi (admin CRUD)
- [ ] Aşama 4: Envanter + QR (cihaz CRUD, assetTag, QR üretimi)
- [ ] Aşama 5: Zimmet + geçmiş (zimmetleme, iade, arıza bildirme, ActivityLog, Zimmetlerim)
- [ ] Aşama 6: Liste özellikleri (sayfalama, arama, filtreler, toast)
- [ ] Aşama 7: Dashboard (istatistik kartları, grafik)
- [ ] Aşama 8: Cila (responsive kontrol, hata durumları, boş liste mesajları)
- [ ] Aşama 9: README
- [ ] Aşama 10: Mobil (bonus)

## Bilinen sorunlar / notlar

- Cihaz türü (`DeviceType`) veritabanında İngilizce anahtarlarla tutuluyor (`COMPUTER`, `MONITOR`, `SERVER`, `PRINTER`, `OTHER`); arayüzde Türkçe etiketleri (Bilgisayar, Monitör, Sunucu, Yazıcı, Diğer) gösterilecek.
- Logout stateless: JWT sunucuda saklanmadığı için çıkışta istemci token'ı siler; `POST /api/auth/logout` sadece onay mesajı döner.
- Ana sayfa şimdilik sadece karşılama bilgisi gösteriyor; Dashboard Aşama 7'de, menü/yan panel sayfalar eklendikçe gelecek.
- Backend Docker'da `src/generated/prisma` altına Prisma istemcisini üretiyor; bu klasör git'e girmiyor (`.gitignore`).
- Docker'da `node_modules` anonim volume'de tutuluyor; yeni bağımlılık eklendikten sonra `docker compose up --build -V` kullanılmalı.
- Yerel (Docker'sız) çalıştırma için `DATABASE_URL` içindeki `db` host adı `localhost` ile değiştirilmeli (README'de anlatılacak).
