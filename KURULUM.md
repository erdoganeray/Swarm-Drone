# 🚀 KURULUM TALİMATLARI

## ⚠️ ÖNEMLİ: Node.js Kurulumu Gerekli

Bu proje çalışmadan önce Node.js kurulması gerekiyor.

### 1️⃣ Node.js Kurulumu

1. **İndirin:** https://nodejs.org adresinden LTS versiyonunu indirin
2. **Kurun:** İndirilen dosyayı çalıştırıp kurulumu tamamlayın
3. **Doğrulayın:** Yeni PowerShell penceresi açıp test edin:
   ```bash
   node --version
   npm --version
   ```

### 2️⃣ Proje Kurulumu

Node.js kurulduktan sonra proje klasöründe:

```bash
# Bağımlılıkları kur
npm install

# Geliştirme sunucusunu başlat
npm run dev
```

### 3️⃣ Uygulama Kullanımı

Sunucu başladığında `http://localhost:3000` adresinde uygulamayı görebilirsiniz.

## 🎯 Özellikler

- ✅ 3D sahne ile drone trajectory planlama
- ✅ Waypoint ekleme ve düzenleme
- ✅ Grid sistemi ve snap-to-grid
- ✅ Trajectory görselleştirme
- ✅ Import/Export functionality

## 🛠️ Geliştirme Komutları

```bash
npm run dev     # Geliştirme sunucusu
npm run build   # Production build
npm run preview # Build preview
npm run lint    # Code linting
```

---

**Not:** Node.js kurulduktan sonra VS Code'u yeniden başlatmanız önerilir.
