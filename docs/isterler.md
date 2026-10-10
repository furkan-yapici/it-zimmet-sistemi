# Aday Mühendis Değerlendirme Projesi — İsterler

> Kaynak: Yapay Zeka ve Dijital Dönüşüm Koordinatörlüğü, "Aday Mühendis Değerlendirme Projesi" PDF'i (`Aday_Muhendis_Projesi_IT_Demirbas.pdf`).

## Proje Adı: IT Demirbaş ve Zimmet Yönetim Sistemi

Bu proje, kurum içindeki bilgisayar, sunucu, monitör gibi donanımların sisteme kaydedildiği, durumlarının takip edildiği ve personellere zimmetlendiği full-stack bir web projesidir.

## 1. Temel İsterler (Web ve Backend - Zorunlu)

Projenin merkezinde yer alan ve adaydan kesinlikle tamamlanması beklenen ana kısımdır.

- **Genel Web İsterleri (Auth & UI/UX):** Kullanıcı girişi (Login) ve çıkışı (Logout) işlemleri (JWT veya Session yönetimi). Arayüzün mobil uyumlu (Responsive) olması. Listelerde sayfalama (Pagination) ve arama yapabilme. İşlem sonuçları için (başarılı/hatalı) anlık bildirim mesajları (Toast/Snackbar) gösterilmesi.
- **Kullanıcı ve Rol Yönetimi:** Sistemde yetkilendirme altyapısı (Örn: Admin ve Standart Personel). Yöneticilerin yeni kullanıcı ekleyebildiği, silebildiği, bilgilerini güncelleyebildiği ve şifrelerini yönetebildiği bir kullanıcı yönetim ekranı.
- **Dashboard (Gösterge Paneli):** Toplam cihaz sayısı, arızalı cihazlar ve boşta bekleyen cihazların istatistiksel görünümü.
- **Envanter Yönetimi:** Cihaz ekleme, silme, güncelleme (Marka, Model, Seri No, Alım Tarihi). Her cihaza otomatik benzersiz bir QR Kod veya Barkod üretilmesi.
- **Zimmet Yönetimi:** Bir cihazı personele atama (Zimmetleme) ve zimmetten düşme işlemleri. Veritabanında One-to-Many veya Many-to-Many ilişki kurgusunun kurulması ve geçmiş logların tutulması.
- **Filtreleme:** Duruma (Aktif, Arızalı, Depoda vb.) ve departmana/kullanıcıya göre dinamik arama ve filtreleme yapabilme.

## 2. Mobil Uygulama İsterleri (Opsiyonel / Bonus)

Web kısmı projenin zorunlu asgari şartıdır. Ancak bu web sisteminin API uç noktalarıyla entegre çalışacak bir mobil uygulama (Flutter, React Native vb. ile) geliştirilmesi adayı önemli ölçüde öne çıkaracaktır.

- **Kimlik Doğrulama (Login):** Mobil uygulama üzerinden kullanıcı adı/şifre ile sisteme güvenli giriş yapabilme.
- **QR Okuma ve Cihaz Tanıma:** Mobil cihaz kamerası kullanılarak cihazın üzerindeki QR kodun okutulması ve cihaz detaylarının (garanti, alım tarihi, kimde olduğu) ekrana getirilmesi.
- **Hızlı İşlem ve Saha Yönetimi:** Mobil uygulama üzerinden okutulan cihaz için hızlıca "Personele Teslim Et", "Cihazı Geri Kabul Et" veya "Arıza Durumu Bildir" işlemlerinin sahada yapılabilmesi.
- **Kişisel Zimmet Ekranı:** Giriş yapan personelin kendi üzerine zimmetli cihazları listeyebildiği ve detaylarını inceleyebildiği kişisel profil sayfası.

## 3. Teknik Beklentiler ve Teslimat

1. Proje kodları herkese açık bir GitHub veya GitLab deposunda (repository) paylaşılmalıdır.
2. Repoda, projeyi tanıtan detaylı görsellerle beraber projenin ortam değişkenlerinin nasıl ayarlanacağını, uygulamanın nasıl çalıştırılacağını açıklayan detaylı bir README.md dosyası yer almalıdır.
3. (Artı Puan) Projenin Docker ve docker-compose kullanılarak tek tuşla ayağa kalkacak şekilde tasarlanması.
