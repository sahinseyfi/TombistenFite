# FitCrew Backend Handoff Dokümanı

## 0) Kapsam ve Bağlam

### UI Modülleri
- **Kimlik Doğrulama**: Kayıt/Giriş
- **Akış (Feed)**: Gönderi listesi, filtreleme (Herkes/Takip/Yakınlar/Ben)
- **Gönderi Oluşturma**: Kilo/ölçü girişi, öğün fotoğrafları, AI yorumu seçeneği
- **Gönderi Detayı**: Tam içerik, AI yorumu kartı, yorum listesi
- **Profil**: Kullanıcı bilgileri, gönderi geçmişi, istatistikler
- **Ölçüm/Grafikler**: Kilo ve vücut ölçüleri line chart'ları
- **Keşfet/Arama**: Etiket ve kullanıcı araması
- **Bildirimler**: Beğeni, yorum, takip bildirimleri
- **Kaçamak Çarkı**: 
  - Kaçamak listesi yönetimi (5-6 öğe)
  - Çark çevirme (dilimler kullanıcı öğelerinden)
  - Bonus yürüyüş (0/15/20/30/60/90 dk)
  - Geçmiş ve grafik işaretleme

### Platform
- **Hedef**: Sadece mobil web/PWA
- **Genişlik**: 360-430px
- **Masaüstü**: Yok

### Önemli UX Noktaları
- Gönderi: kilo/ölçü, öğün fotoğrafı, açıklama, AI yorumu switch'i
- Grafikler: Kilo/ölçüler + 📍 ile kaçamak günleri işaretleme
- Kaçamak Çarkı: 5-6 öğe → çark dilimleri, Bonus yürüyüş RNG, hak kazanma kuralları (EMA-7 trend, cooldown, haftalık limit)

---

## 1) Varlıklar (Entities) ve İlişkiler

### User
```typescript
{
  id: string;
  handle: string;          // @kullaniciadi
  name: string;            // Görünen ad
  email?: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  stats?: {
    posts: number;
    followers: number;
    following: number;
  };
  privacyDefaults?: {
    defaultVisibility: 'public' | 'followers' | 'private';
    aiCommentDefault: boolean;
  };
  createdAt: string;       // ISO8601
}
```

### Post
```typescript
{
  id: string;
  authorId: string;
  createdAt: string;       // ISO8601
  updatedAt?: string;      // ISO8601
  photos: string[];        // URLs
  caption?: string;        // max 500 karakter
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  weightKg?: number;       // 20-400
  measurementId?: string;  // Opsiyonel: bu post ile oluşturulan ölçüm kaydı
  measurements?: {
    waistCm?: number;
    chestCm?: number;
    hipCm?: number;
    armCm?: number;
    thighCm?: number;
  };
  visibility: 'public' | 'followers' | 'private';
  aiComment?: {
    status: 'pending' | 'ready' | 'failed';
    summary?: string;
    tips?: string[];       // max 5
  };
  likesCount: number;
  commentsCount: number;
}
```

### Comment
```typescript
{
  id: string;
  postId: string;
  authorId: string;
  body: string;            // max 1000 karakter
  createdAt: string;
}
```

### Follow
```typescript
{
  followerId: string;
  followeeId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}
```

### Measurement
```typescript
{
  id: string;
  userId: string;
  date: string;            // ISO8601
  weightKg?: number;
  waistCm?: number;
  chestCm?: number;
  hipCm?: number;
  armCm?: number;
  thighCm?: number;
}
```

### TreatItem
```typescript
{
  id: string;
  userId: string;
  name: string;
  photoUrl?: string;
  kcalHint?: string;
  portions: ('Küçük' | 'Orta' | 'Tam')[];
  createdAt: string;
}
```

### TreatSpin
```typescript
{
  id: string;
  userId: string;
  treatItemId: string;
  treatNameSnapshot: string;         // Geçmiş bozulmasın diye snapshot
  photoUrlSnapshot?: string;         // Orijinal fotoğraf URL'si
  kcalHintSnapshot?: string;         // Orijinal kcal ipucu
  date: string;                      // ISO8601
  portion: 'Küçük' | 'Orta' | 'Tam';
  bonusWalkMin: 0 | 15 | 20 | 30 | 60 | 90;
  bonusCompleted?: boolean;
}
```

### CheatEligibility
```typescript
{
  userId: string;
  eligible: boolean;
  reason?: 'NEED_MORE_LOSS' | 'COOLDOWN' | 'LIMIT_REACHED' | 'INSUFFICIENT_MEASUREMENTS' | 'ANOMALY';
  reasonParams?: {         // Reason'a bağlı detaylar
    kgNeeded?: number;     // NEED_MORE_LOSS için
    days?: number;         // COOLDOWN için
    limit?: number;        // LIMIT_REACHED için
  };
  etaDays?: number;        // Hak kazanmaya kaç gün kaldı
  progressDeltaKg?: number; // Son spin'den beri değişim
  lastSpinAt?: string;
}
```

### Notification
```typescript
{
  id: string;
  userId: string;
  type: 'like' | 'comment' | 'follow' | 'ai_comment_ready';
  payload: Record<string, any>;
  readAt?: string;
  createdAt: string;
}
```

### İlişki Özeti
- `User` 1-N `Post`
- `User` 1-N `Measurement`
- `User` 1-N `TreatItem`
- `User` 1-N `TreatSpin`
- `Post` 1-N `Comment`
- `User` M-N `User` (Follow ilişkisi)

---

## 2) API Tasarım İlkeleri

### Kimlik Doğrulama
- **Bearer JWT**: Access + Refresh token
- **Header**: `Authorization: Bearer <access_token>`
- **Endpoints**: `/auth/*`

### Yetkilendirme
- Kaynak sahibi veya yetkili takipçi erişimi
- Gizlilik: `public` (herkes), `followers` (takipçiler), `private` (sadece sahibi)

### Sayfalama
- **Cursor-based**: `?limit=20&cursor=<cursor_value>`
- **ISO-time**: `?since=2025-10-09T00:00:00Z`

### İdempotensi
- Yazma işlemlerinde `Idempotency-Key` header'ı
- Aynı key ile tekrar istek → aynı sonuç

### Upload
- **Presigned URL** akışı
- Endpoint: `POST /uploads/presign`
- Doğrulama: MIME type, max MB, boyut
- **EXIF Temizleme**: Metadata (konum, kamera bilgisi) otomatik temizlenir
- **Auto-rotate**: EXIF orientation tag'ine göre görsel düzeltilir

### AI Entegrasyonu
- **Server-side** OpenAI çağrısı
- UI'dan sadece `aiCommentRequested: boolean` bayrağı
- Asenkron işlem: status `pending` → `ready` | `failed`

### Rate Limiting
- `POST /posts`: 10 istek/dakika
- `POST /treats/spins`: 3 istek/gün
- HTTP 429 Too Many Requests
- **Response Headers**:
  - `X-RateLimit-Limit`: İzin verilen toplam istek sayısı
  - `X-RateLimit-Remaining`: Kalan istek sayısı
  - `X-RateLimit-Reset`: Reset zamanı (Unix timestamp)

### Hata Yanıt Standardı
Tüm hata yanıtları aşağıdaki formatta olmalıdır:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Geçersiz girdi değerleri",
    "details": {
      "weightKg": "Değer 20-400 aralığında olmalıdır"
    },
    "traceId": "req_abc123xyz"
  }
}
```

**Hata Kodları**:
- `VALIDATION_ERROR`: Girdi doğrulama hatası
- `UNAUTHORIZED`: Kimlik doğrulama gerekli
- `FORBIDDEN`: Erişim yetkisi yok
- `NOT_FOUND`: Kaynak bulunamadı
- `RATE_LIMIT_EXCEEDED`: İstek limiti aşıldı
- `SERVER_ERROR`: Sunucu hatası

### ETag ve Önbellekleme
- **GET** istekleri için `ETag` header'ı döner
- İstemci `If-None-Match` header'ı ile tekrar istek yaparsa ve içerik değişmemişse → HTTP 304 Not Modified (boş body)
- Cache süresi: `Cache-Control: max-age=300` (5 dakika)

### Zaman
- **Format**: ISO8601 UTC
- İstemci timezone'u metadata olarak

---

## 3) Uç Noktalar (API Endpoints)

### 3.1 Kimlik Doğrulama

| Method | Path | Amaç | Auth | Request Body | Response |
|--------|------|------|------|--------------|----------|
| `POST` | `/auth/register` | Kayıt | No | `{ email/phone, password, name, handle }` | `{ user, tokens }` |
| `POST` | `/auth/login` | Giriş | No | `{ email/phone, password }` | `{ user, tokens }` |
| `POST` | `/auth/refresh` | Token yenile | No | `{ refreshToken }` | `{ accessToken }` |
| `GET` | `/users/me` | Kendi profilim | Yes | - | `User` |
| `PATCH` | `/users/me` | Profil düzenle | Yes | `{ name?, bio?, avatarUrl? }` | `User` |

### 3.2 Gönderiler

| Method | Path | Amaç | Auth | Query/Body | Response |
|--------|------|------|------|------------|----------|
| `GET` | `/posts` | Feed listesi | Yes | `?scope=public\|following\|close_friends\|me&limit=20&cursor=` | `{ posts: Post[], nextCursor? }` |
| `POST` | `/posts` | Yeni gönderi | Yes | `CreatePostRequest` | `Post` |
| `GET` | `/posts/{id}` | Gönderi detayı | Yes | - | `Post` |
| `PATCH` | `/posts/{id}` | Gönderi düzenle | Yes | `{ caption?, visibility?, measurements? }` | `Post` |
| `DELETE` | `/posts/{id}` | Gönderi sil | Yes | - | `{ success: boolean }` |
| `POST` | `/posts/{id}/like` | Beğen/Geri al | Yes | `{ like: boolean }` | `{ likesCount: number }` |
| `POST` | `/posts/{id}/report` | Gönderi raporla | Yes | `{ reason: string, details?: string }` | `{ reportId: string }` |
| `GET` | `/posts/{id}/comments` | Yorum listesi | Yes | `?cursor&limit` | `{ comments: Comment[], nextCursor? }` |
| `POST` | `/posts/{id}/comments` | Yorum ekle | Yes | `{ body: string }` | `Comment` |

**Scope Açıklaması**:
- `public`: Herkese açık gönderiler
- `following`: Takip edilen kullanıcıların gönderileri
- `close_friends`: Yakın arkadaş listesindeki kullanıcıların gönderileri
- `me`: Sadece kendi gönderilerim

#### CreatePostRequest (JSON Schema)

```json
{
  "type": "object",
  "properties": {
    "photos": {
      "type": "array",
      "items": { "type": "string", "format": "uri" },
      "minItems": 0,
      "maxItems": 10
    },
    "caption": {
      "type": "string",
      "maxLength": 500
    },
    "mealType": {
      "enum": ["breakfast", "lunch", "dinner", "snack"]
    },
    "weightKg": {
      "type": "number",
      "minimum": 20,
      "maximum": 400
    },
    "measurements": {
      "type": "object",
      "properties": {
        "waistCm": { "type": "number", "minimum": 30, "maximum": 200 },
        "chestCm": { "type": "number", "minimum": 30, "maximum": 200 },
        "hipCm": { "type": "number", "minimum": 30, "maximum": 200 },
        "armCm": { "type": "number", "minimum": 10, "maximum": 100 },
        "thighCm": { "type": "number", "minimum": 20, "maximum": 150 }
      },
      "additionalProperties": false
    },
    "visibility": {
      "enum": ["public", "followers", "private"]
    },
    "aiCommentRequested": {
      "type": "boolean"
    }
  },
  "required": [],
  "additionalProperties": false
}
```

### 3.3 Ölçümler & Grafikler

| Method | Path | Amaç | Query/Body | Response |
|--------|------|------|------------|----------|
| `GET` | `/measurements` | Ölçüm listesi | `?startDate&endDate&userId` | `Measurement[]` |
| `POST` | `/measurements` | Ölçüm ekle | `{ date, weightKg?, waistCm?, ... }` | `Measurement` |
| `GET` | `/analytics/series` | Grafik serisi | `?metric=weight,waist&range=3m` | `{ series: { date, value }[] }` |

**Not**: Post oluştururken `weightKg` veya `measurements` alanları gönderilirse, bunlar otomatik olarak `measurements` tablosuna **tek bir transaction** içinde yazılır ve Post'a `measurementId` atanır. Bu sayede veri tutarlılığı garanti edilir.

### 3.4 Kaçamak Çarkı

| Method | Path | Amaç | Auth | Body | Response |
|--------|------|------|------|------|----------|
| `GET` | `/treats/items` | Kaçamak listesi | Yes | - | `TreatItem[]` |
| `POST` | `/treats/items` | Kaçamak ekle | Yes | `{ name, photoUrl?, kcalHint?, portions? }` | `TreatItem` |
| `PATCH` | `/treats/items/{id}` | Kaçamak düzenle | Yes | `{ name?, photoUrl?, ... }` | `TreatItem` |
| `DELETE` | `/treats/items/{id}` | Kaçamak sil | Yes | - | `{ success: boolean }` |
| `GET` | `/treats/eligibility` | Hak kontrolü | Yes | - | `CheatEligibility` |
| `POST` | `/treats/spins` | Spin başlat | Yes | `{ clientSeed?: string }` | `TreatSpin` |
| `GET` | `/treats/spins` | Spin geçmişi | Yes | `?limit&cursor` | `{ spins: TreatSpin[], nextCursor? }` |
| `PATCH` | `/treats/spins/{id}` | Bonus tamamla | Yes | `{ bonusCompleted: boolean }` | `TreatSpin` |

#### SpinRequest
```json
{
  "clientSeed": "optional-string-for-rng"
}
```

#### SpinResponse
```json
{
  "id": "spin_123",
  "treatItemId": "t1",
  "portion": "Orta",
  "bonusWalkMin": 30,
  "date": "2025-10-09T08:00:00Z"
}
```

### 3.5 Takip & Sosyal

| Method | Path | Amaç | Auth | Body | Response |
|--------|------|------|------|------|----------|
| `POST` | `/users/{id}/follow` | Kullanıcıyı takip et | Yes | - | `{ status: 'accepted'\|'pending' }` |
| `DELETE` | `/users/{id}/follow` | Takibi bırak | Yes | - | `{ success: boolean }` |
| `GET` | `/users/{id}/followers` | Takipçi listesi | Yes | `?cursor&limit` | `{ users: User[], nextCursor? }` |
| `GET` | `/users/{id}/following` | Takip edilen listesi | Yes | `?cursor&limit` | `{ users: User[], nextCursor? }` |

### 3.6 Keşfet & Arama

| Method | Path | Amaç | Auth | Query | Response |
|--------|------|------|------|-------|----------|
| `GET` | `/search/users` | Kullanıcı ara | Yes | `?q=<query>&limit=20` | `{ users: User[] }` |
| `GET` | `/search/tags` | Etiket ara | Yes | `?q=<query>&limit=20` | `{ tags: string[] }` |
| `GET` | `/explore` | Öne çıkan içerik | Yes | `?limit=20&cursor=` | `{ posts: Post[], nextCursor? }` |

### 3.7 Bildirimler

| Method | Path | Amaç | Auth | Query/Body | Response |
|--------|------|------|------|------------|----------|
| `GET` | `/notifications` | Bildirim listesi | Yes | `?cursor&limit&unreadOnly=true` | `{ notifications: Notification[], nextCursor? }` |
| `POST` | `/notifications/ack` | Bildirimleri okundu işaretle | Yes | `{ notificationIds: string[] }` | `{ success: boolean }` |

**WebSocket Kanalı (Opsiyonel)**:
- Kanal: `wss://api.example.com/realtime`
- Event türleri: `ai_comment_ready`, `like`, `comment`, `follow`
- Payload: `{ type: string, data: Record<string, any> }`

### 3.8 Upload

| Method | Path | Amaç | Body | Response |
|--------|------|------|------|----------|
| `POST` | `/uploads/presign` | Presigned URL al | `{ mime, size, ext }` | `{ url, fields }` |

**Upload Ayrıntıları**:
- **MIME Kontrolü**: Sadece `image/jpeg`, `image/png`, `image/webp` kabul edilir
- **Boyut Limiti**: Maksimum 10 MB
- **Çözünürlük Limiti**: En fazla 4096x4096 piksel
- **EXIF Temizleme**: Konum, kamera bilgisi otomatik kaldırılır
- **Auto-rotate**: EXIF orientation tag'ine göre görsel otomatik döndürülür

**Hata Örnekleri**:
```json
{
  "error": {
    "code": "INVALID_MIME_TYPE",
    "message": "Geçersiz dosya türü",
    "details": { "allowedTypes": ["image/jpeg", "image/png", "image/webp"] }
  }
}
```

```json
{
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "Dosya boyutu limiti aşıldı",
    "details": { "maxSize": "10MB", "providedSize": "15.2MB" }
  }
}
```

---

## 4) İş Kuralları

### 4.1 Gizlilik & Erişim

| Visibility | Erişim Kuralı |
|------------|---------------|
| `public` | Herkes görür |
| `followers` | Sadece onaylı takipçiler |
| `private` | Sadece gönderi sahibi |

- Takip ilişkisi `accepted` olmalı
- Beğeni/yorum da aynı kurallara tabi

### 4.2 AI Yorum (OpenAI)

#### Girdi
- Kullanıcı profil özeti (yaş aralığı, hedefler - varsa)
- Son N ölçüm trendi
- Post içeriği (caption + makro ipucu)
- **PII maskelenmeli**

#### Model & Parametreler
- `model`: `gpt-5` (veya google/gemini-2.5-flash via Lovable AI)
- `temperature`: ~0.5
- `max_tokens`: 500
- `timeout`: 8-12 saniye

#### Çıktı Şeması
```json
{
  "summary": "Dengeli bir öğün! Protein kaynağını artırabilirsin.",
  "tips": [
    "Su tüketimini artır (günde 2-3L)",
    "Akşam öğününde yeşil sebze ekle",
    "Yürüyüş süresini 10dk artır"
  ]
}
```
- Max 5 öneri
- **Uyarı**: "Bu içerik tıbbi tavsiye değildir."

#### Hata & Fallback
- Timeout → `aiComment = null`, retry kuyruğuna ekle (max 2 deneme)
- API hatası → kullanıcıya nazik mesaj
- Status: `pending` → `ready` | `failed`

### 4.3 Kaçamak Çarkı Hak Kuralları

#### Trend Hesaplama
- **EMA-7**: 7 günlük üssel hareketli ortalama
- Alternatif: Son 3 ölçüm medyanı

#### Eşikler (Önerilen)
| Kural | Değer |
|-------|-------|
| Minimum düşüş (kg) | ≥ 0.8 kg (son spin'den beri) |
| Minimum düşüş (%) | ≥ %1 (başlangıca göre) |
| Cooldown | ≥ 4 gün |
| Haftalık limit | 1 spin |
| Ölçüm tutarlılığı | Son 7 günde ≥ 4 gün ölçüm |

#### Aykırı Değer Filtresi
- 24 saatte ≥ %1.5 düşüş tek başına sayılmaz
- Trend teyidi gerekli (EMA-7)

#### Plateau Spin (Opsiyonel)
- **Koşul**: 14 günde ≥10 ölçüm VE EMA-7 ±0.3 kg aralığında
- **Sonuç**: 1 moral spin
- **Kısıt**: `portion = Küçük`, `bonusWalkMin ≥ 20`

#### Yeni Kullanıcı Spin (Opsiyonel)
- **Koşul**: İlk 7 günde ≥5 ölçüm VE ≥ -0.3 kg
- **Sonuç**: 1 defalık spin

#### Bonus Yürüyüş RNG

| Değer (dk) | Olasılık |
|------------|----------|
| 0 | %25 |
| 15 | %25 |
| 20 | %20 |
| 30 | %15 |
| 60 | %10 |
| 90 | %5 |

**RNG Seed**: `SHA256(userId + timestamp + clientSeed)`

### 4.4 Doğrulama & Kısıtlar

#### Aralıklar
- `weightKg`: 20-400
- `waistCm`, `chestCm`, `hipCm`: 30-200
- `armCm`: 10-100
- `thighCm`: 20-150

#### Fotoğraf
- **MIME**: `image/jpeg`, `image/png`, `image/webp`
- **Max Boyut**: 10 MB
- **Max Sayı**: 10 foto/post

#### Metin
- `caption`: max 500 karakter
- `comment.body`: max 1000 karakter

#### Rate Limiting
| Endpoint | Limit |
|----------|-------|
| `POST /posts` | 10/dakika |
| `POST /treats/spins` | 3/gün |
| `POST /posts/{id}/comments` | 20/dakika |

---

## 5) Durum Makineleri / Akışlar

### 5.1 "Gönderi Oluştur" (AI ile)

```
1. UI → POST /posts (aiCommentRequested=true)
2. API → 201 Created
   {
     id: "p1",
     aiComment: { status: "pending" },
     ...
   }
3. Worker → OpenAI çağrısı (async)
4. Worker → PATCH /posts/p1
   {
     aiComment: {
       status: "ready",
       summary: "...",
       tips: ["..."]
     }
   }
5. UI → Polling/WebSocket ile güncel post
6. UI → AI kutusu göster
```

#### Hatalar
- **Timeout**: Retry max 2, sonra `status: "failed"`
- **API Error**: `aiComment = null`, kullanıcıya toast

### 5.2 "Spin"

```
1. UI → GET /treats/eligibility
   Response: { eligible: false, reason: "−0.2 kg daha ilerle" }
2. UI → Çark devre dışı, neden göster

--- Hak kazandıktan sonra ---

1. UI → GET /treats/eligibility
   Response: { eligible: true, progressDeltaKg: -0.9 }
2. UI → POST /treats/spins (Idempotency-Key: "abc-123")
   Response: {
     id: "spin1",
     treatItemId: "t2",
     portion: "Orta",
     bonusWalkMin: 30
   }
3. UI → Geçmişe ekle, grafik 📍 göster
4. (Opsiyonel) UI → PATCH /treats/spins/spin1
   { bonusCompleted: true }
```

---

## 6) Güvenlik, RLS ve İzinler

### Sahiplik Kontrolleri
- Her kaynak `ownerId` (veya `userId`, `authorId`) ile etiketli
- **Okuma**: Sahibi VEYA (visibility=public VEYA (visibility=followers VE takipçi))
- **Yazma**: Sadece sahibi

### Takip Kontrolü
- Index: `(followeeId, followerId)` UNIQUE
- Sadece `status='accepted'` takipçiler içerik görebilir

### Silme Kaskadı
- Post silinirse:
  - İlgili Comment'ler silinir
  - Like kayıtları silinir
  - aiComment referansı silinir

### RLS Policy Örnekleri (Supabase/Postgres)

#### Posts Tablosu - Okuma İzni
```sql
CREATE POLICY "Users can view posts based on visibility"
ON posts FOR SELECT
USING (
  visibility = 'public'
  OR author_id = auth.uid()
  OR (
    visibility = 'followers' 
    AND EXISTS (
      SELECT 1 FROM follows 
      WHERE followee_id = author_id 
      AND follower_id = auth.uid() 
      AND status = 'accepted'
    )
  )
);
```

#### Posts Tablosu - Yazma İzni
```sql
CREATE POLICY "Users can only modify their own posts"
ON posts FOR UPDATE
USING (author_id = auth.uid());
```

### Kritik İndeksler

```sql
-- Posts için performans
CREATE INDEX idx_posts_author_created ON posts(author_id, created_at DESC);
CREATE INDEX idx_posts_visibility_created ON posts(visibility, created_at DESC);

-- Follows için hızlı takip sorguları
CREATE UNIQUE INDEX idx_follows_unique ON follows(followee_id, follower_id);
CREATE INDEX idx_follows_follower ON follows(follower_id, status);

-- Measurements için grafik sorguları
CREATE INDEX idx_measurements_user_date ON measurements(user_id, date DESC);

-- Notifications için okunmamış bildirimler
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read_at) 
WHERE read_at IS NULL;
```

---

## 7) Performans & Ölçeklenebilirlik

### Sayfalama
- **Cursor-based**: N+1 önleme (eager loading/join)
- `SELECT * FROM posts WHERE id > cursor ORDER BY id LIMIT 20`

### Grafik Serileri
- 1 yılı aşan veri için **downsample** (haftalık medyan)
- Index: `(userId, date)`

### İdempotensi
- Aynı `Idempotency-Key` ile çift tıklama → tek sonuç
- Cache: Redis/Memcached (10 dakika TTL)

### CDN
- Fotoğraflar S3/GCS + CloudFront/Cloud CDN
- Presigned URL'ler 15 dakika geçerli

---

## 8) Telemetri Olayları

| Olay | Tetikleyici | Payload Örneği |
|------|-------------|----------------|
| `post_created` | POST /posts | `{ postId, userId, hasMeal, hasWeight, hasAI }` |
| `post_ai_comment_ready` | AI işlemi bitti | `{ postId, duration_ms }` |
| `post_liked` | POST /posts/{id}/like | `{ postId, userId, liked: true/false }` |
| `comment_added` | POST /posts/{id}/comments | `{ postId, commentId, userId }` |
| `measurements_added` | POST /measurements | `{ userId, date, metrics: ["weight","waist"] }` |
| `analytics_viewed` | GET /analytics/series | `{ userId, range }` |
| `treats_setup_completed` | POST /treats/items (count ≥ 3) | `{ userId, itemCount }` |
| `treat_wheel_opened` | GET /treats/eligibility | `{ userId, eligible }` |
| `treat_wheel_spun` | POST /treats/spins | `{ userId, spinId, treatItemId, portion, bonusWalkMin }` |
| `treat_result_saved` | (UI event) | `{ spinId }` |
| `treat_bonus_marked_done` | PATCH /treats/spins/{id} | `{ spinId, bonusWalkMin }` |

---

## 9) Örnekler (cURL)

### Feed
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://api.example.com/posts?scope=following&limit=20"
```

### Yeni Gönderi (AI yorum açık)
```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "photos": ["https://.../p1.jpg"],
    "caption": "Akşam öğünü",
    "mealType": "dinner",
    "weightKg": 82.3,
    "visibility": "followers",
    "aiCommentRequested": true
  }' \
  https://api.example.com/posts
```

### Spin Uygun Mu?
```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://api.example.com/treats/eligibility
```

### Spin Başlat
```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Idempotency-Key: abc-123" \
  -H "Content-Type: application/json" \
  -d '{"clientSeed": "ui-seed"}' \
  https://api.example.com/treats/spins
```

### Upload Presign
```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mime": "image/jpeg",
    "size": 2048000,
    "ext": "jpg"
  }' \
  https://api.example.com/uploads/presign
```

---

## 10) Yapılandırma (ENV Önerileri)

```bash
# OpenAI / Lovable AI
OPENAI_API_KEY=sk-...
AI_MODEL=gpt-5
AI_TIMEOUT_MS=12000

# Upload
UPLOAD_MAX_MB=10
UPLOAD_ALLOWED_MIME=image/jpeg,image/png,image/webp
S3_BUCKET=fitcrew-uploads
S3_REGION=us-east-1
PRESIGN_EXPIRY_SECONDS=900  # 15 dakika

# Rate Limiting
POSTS_PER_PAGE_DEFAULT=20
RATELIMIT_POSTS_PER_MIN=10
RATELIMIT_COMMENTS_PER_MIN=20
RATELIMIT_SPINS_PER_DAY=3

# Kaçamak Çarkı
TREAT_SPIN_COOLDOWN_DAYS=4
TREAT_WEEKLY_LIMIT=1
EMA_WINDOW_DAYS=7
TREAT_MIN_WEIGHT_LOSS_KG=0.8
TREAT_MIN_WEIGHT_LOSS_PERCENT=1.0
TREAT_MIN_MEASUREMENT_DAYS=4  # Son 7 günde

# Bonus Yürüyüş Dağılımı (0,15,20,30,60,90)
BONUS_WALK_DISTRIBUTION=25,25,20,15,10,5

# Plateau & Yeni Kullanıcı
PLATEAU_SPIN_ENABLED=true
PLATEAU_DAYS=14
PLATEAU_MIN_MEASUREMENTS=10
PLATEAU_EMA_RANGE_KG=0.3
NEW_USER_SPIN_ENABLED=true
NEW_USER_DAYS=7
NEW_USER_MIN_MEASUREMENTS=5
NEW_USER_MIN_WEIGHT_LOSS_KG=0.3

# Database
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# JWT
JWT_SECRET=...
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
```

---

## 11) Kabul Kriterleri (Done Definition)

✅ Tüm endpoint'ler tanımlı (path, method, auth, request/response şemaları)

✅ Hak kazanma kuralları adım adım netleştirilmiş:
  - EMA-7 trend hesabı
  - Cooldown ve haftalık limit
  - Ölçüm tutarlılığı
  - Aykırı değer filtresi
  - Plateau ve yeni kullanıcı spin'leri

✅ AI yorum akışı (pending → ready/failed) belirtilmiş

✅ Upload presigned URL akışı tanımlı

✅ Gizlilik ve takip erişim kuralları yazılı

✅ İdempotensi, rate limiting, sayfalama stratejileri açık

✅ Hata durumları ve fallback'ler belirtilmiş

✅ cURL örnekleri ile manuel test edilebilirlik sağlanmış

✅ Telemetri olayları listelenmiş

✅ ENV yapılandırması örnek değerlerle verilmiş

---

## Notlar

- Bu doküman **Codex** veya backend ekibinin hızlı kurulum yapmasını hedefler
- Şema ve kurallar **parametriktir**; gerçek değerler proje aşamasında güncellenebilir
- **PII** (Personally Identifiable Information) handling ve **GDPR/KVKK** uyumluluğu backend'de sağlanmalıdır
- AI yorum içeriği **tıbbi tavsiye değildir** uyarısı tüm cevaplarda bulunmalıdır
- Rate limit değerleri ve cooldown'lar **abuse prevention** için ayarlanmalıdır

---

**Tarih**: 2025-10-09  
**Versiyon**: 1.1  
**İletişim**: Backend ekibi ile senkronize olunmalıdır

---

## Changelog (v1.1)

### Yapılan Değişiklikler

1. **Feed Scope Genişletildi**: GET /posts artık `scope=public|following|close_friends|me` parametrelerini destekliyor (Herkes/Takip/Yakınlar/Ben).

2. **Takip & Sosyal Uç Noktaları Eklendi**: 
   - `POST/DELETE /users/{id}/follow`: Takip et/bırak
   - `GET /users/{id}/followers` ve `/following`: Takipçi/takip edilen listeleri

3. **Keşfet & Arama Uç Noktaları**:
   - `GET /search/users?q=`: Kullanıcı arama
   - `GET /search/tags?q=`: Etiket arama
   - `GET /explore`: Öne çıkan içerik keşfi

4. **Post Yönetimi Geliştirildi**:
   - `PATCH /posts/{id}`: Gönderi düzenleme (caption, visibility, measurements)
   - `DELETE /posts/{id}`: Gönderi silme
   - `POST /posts/{id}/report`: Gönderi raporlama

5. **Hata Yanıt Standardı Belirlendi**:
   - Tek tip error şeması: `{ error: { code, message, details, traceId } }`
   - Rate limit header'ları: `X-RateLimit-Limit/Remaining/Reset`
   - Yaygın hata kodları dokümante edildi

6. **Measurement Atomikliği**: Post ile gelen ölçü değerleri tek transaction'da `measurements` tablosuna yazılır; Post'a `measurementId` atanır.

7. **CheatEligibility Enum ve Parametreler**:
   - `reason` alanı enum olarak tanımlandı: `NEED_MORE_LOSS | COOLDOWN | LIMIT_REACHED | INSUFFICIENT_MEASUREMENTS | ANOMALY`
   - `reasonParams` alanı eklendi (kgNeeded, days, limit gibi detaylar için)

8. **TreatSpin Snapshot Alanları**: Geçmiş verinin bozulmaması için `treatNameSnapshot`, `photoUrlSnapshot`, `kcalHintSnapshot` alanları eklendi.

9. **Bildirim Uç Noktaları Genişletildi**:
   - `GET /notifications?cursor=&unreadOnly=`: Bildirim listesi
   - `POST /notifications/ack`: Bildirimleri okundu işaretle
   - WebSocket kanalı için event türleri tanımlandı (ai_comment_ready, like, comment, follow)

10. **Upload Ayrıntıları ve Hatalar**:
    - EXIF temizleme ve auto-rotate açıklandı
    - MIME/çözünürlük limitleri belirtildi
    - Upload hata örnekleri eklendi (INVALID_MIME_TYPE, FILE_TOO_LARGE)

11. **RLS Policy ve İndeks Örnekleri**: Supabase/Postgres için 2 örnek RLS policy ve kritik performans indeksleri eklendi.

12. **ETag/Cache Desteği**: GET istekleri için ETag header'ı ve 304 Not Modified davranışı açıklandı.
