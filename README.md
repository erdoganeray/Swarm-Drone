# 🚁 Drone Trajectory Planner

Modern 3D web tabanlı drone uçuş yolu planlama uygulaması. Bu uygulama ile drone'larınız için 3 boyutlu ortamda waypoint'ler oluşturabilir, uçuş trajektorisini görselleştirebilir ve optimize edebilirsiniz.

## ✨ Özellikler

### 🎯 3D Waypoint Yönetimi
- 3D sahne üzerinde tıklayarak waypoint ekleme
- Farklı waypoint tipleri (takeoff, waypoint, hover, landing)
- Gerçek zamanlı waypoint düzenleme
- Görsel waypoint işaretçileri ve etiketleri

### 📏 Grid Sistemi
- Ayarlanabilir grid boyutu (0.5m - 5m)
- Snap-to-grid özelliği hassas yerleştirme için
- Grid görünürlük kontrolü
- Profesyonel planlama araçları

### 🛣️ Trajectory Görselleştirme
- Smooth trajectory eğrileri
- Yön okları ile uçuş rotası
- Mesafe ve süre hesaplaması
- Gerçek zamanlı güncelleme

### 🎮 3D Sahne Kontrolü
- Mouse ile orbit, zoom, pan kontrolü
- 3D nesneler ve obstacles
- Gölge ve aydınlatma sistemi
- Çevre objeler (binalar, ağaçlar, su özelliği)

### 💾 Import/Export
- JSON formatında trajectory export
- Clipboard ile hızlı paylaşım
- Trajectory import özelliği
- Veri yedekleme

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+ 
- npm veya yarn

### Adımlar

1. Bağımlılıkları kurun:
```bash
npm install
```

2. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

3. Tarayıcınızda `http://localhost:3000` adresini açın

## 🛠️ Teknolojiler

- **React 18** - Modern UI geliştirme
- **TypeScript** - Tip güvenliği
- **Three.js** - 3D grafik motor
- **React Three Fiber** - React için Three.js
- **React Three Drei** - 3D yardımcı araçlar
- **Vite** - Hızlı geliştirme ve build
- **Zustand** - State management

## 📖 Kullanım

### Waypoint Ekleme
1. "Add Waypoint" butonuna tıklayın
2. 3D sahne üzerinde istediğiniz noktaya tıklayın
3. Waypoint otomatik olarak oluşturulur

### Waypoint Düzenleme
1. Bir waypoint'e tıklayarak seçin
2. Sağ panelden özelliklerini düzenleyin:
   - İsim
   - Tip (takeoff, waypoint, hover, landing)
   - Yükseklik
   - Hız

### Grid Kullanımı
1. Grid ON/OFF ile grid'i açıp kapatın
2. Snap ON/OFF ile snap-to-grid'i kontrol edin
3. Slider ile grid boyutunu ayarlayın

### 3D Sahne Kontrolü
- **Sol mouse**: Sahneyi döndürün
- **Sağ mouse**: Sahneyi kaydırın  
- **Mouse wheel**: Zoom in/out
- **Waypoint tıklama**: Waypoint seçimi

## 🏗️ Proje Yapısı

```
src/
├── components/          # React bileşenleri
│   ├── Scene3D.tsx     # Ana 3D sahne
│   ├── WaypointMarker.tsx # Waypoint görsel işaretçileri
│   ├── TrajectoryLine.tsx # Uçuş yolu çizgileri
│   ├── GroundPlane.tsx # Zemin düzlemi
│   ├── SceneObjects.tsx # 3D nesneler
│   ├── UIPanel.tsx     # Kontrol paneli
│   └── StatusBar.tsx   # Durum çubuğu
├── contexts/           # React Context
│   └── WaypointContext.tsx # Waypoint state yönetimi
├── App.tsx            # Ana uygulama
├── main.tsx           # Entry point
└── index.css          # Stil dosyası
```

## 🎯 Gelecek Özellikler

- [ ] 3D model import (GLTF/GLB)
- [ ] Animasyonlu uçuş simülasyonu
- [ ] Çoklu drone desteği
- [ ] Collision detection
- [ ] Weather integration
- [ ] Mission planning templates
- [ ] Real-time drone telemetry
- [ ] Mobile responsive design

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 👥 Geliştirici

Eray - Drone Trajectory Planning Application

---

**Not**: Bu uygulama drone uçuş planlaması için eğitim ve geliştirme amaçlıdır. Gerçek uçuş operasyonları için yerel havacılık kurallarına uygunluk kontrol edilmelidir.
