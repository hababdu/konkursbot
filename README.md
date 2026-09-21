# Konkurs Bot (Node.js)

Kitoblar mavzusidagi test-konkurslarni o'tkazuvchi Telegram bot. TZ hujjati asosida tayyorlangan bazaviy (boshlang'ich) loyiha strukturasi.

## Texnologiyalar

- **Node.js** (v18+)
- **Telegraf.js** — Telegram Bot API uchun freymvork
- **Sequelize** — ORM (sukut bo'yicha SQLite, xohlasangiz PostgreSQL'ga o'tkazish mumkin)
- **dotenv** — muhit o'zgaruvchilari
- **node-cron** — konkurs muddatini avtomatik nazorat qilish uchun (kelajakda qo'shiladi)
- **exceljs** — statistikani Excel formatida eksport qilish uchun (kelajakda qo'shiladi)

## O'rnatish

```bash
# 1. Kutubxonalarni o'rnatish
npm install

# 2. .env faylini sozlash
cp .env.example .env
# .env faylini oching va BOT_TOKEN, ADMIN_IDS qiymatlarini kiriting

# 3. Ma'lumotlar bazasi jadvallarini yaratish
npm run migrate

# 4. Botni ishga tushirish
npm start

# Ishlab chiqish rejimida (avtomatik qayta yuklash bilan)
npm run dev
```

## Muhim: kanallarni ulash

Har bir majburiy obuna kanali uchun **botni kanalga admin sifatida qo'shishingiz** shart — aks holda bot foydalanuvchining a'zoligini tekshira olmaydi.

## Loyiha strukturasi

```
konkurs-bot/
├── package.json
├── .env.example
├── src/
│   ├── index.js                    # kirish nuqtasi
│   ├── config/config.js            # sozlamalar
│   ├── database/
│   │   ├── connection.js           # Sequelize ulanishi
│   │   ├── migrate.js              # jadvallarni yaratish skripti
│   │   └── models/                 # User, Channel, Contest, Book, Question, Referral...
│   ├── services/                   # biznes-logika (obuna, ball, referal, konkurs)
│   ├── bot/
│   │   ├── bot.js                  # barcha handlerlarni birlashtiradi
│   │   ├── middlewares/            # obuna tekshiruvi, admin tekshiruvi
│   │   ├── handlers/               # foydalanuvchi funksiyalari (start, test, reyting...)
│   │   ├── admin/                  # admin panel funksiyalari
│   │   └── keyboards/              # tugmalar
```

## Hozircha qo'llab-quvvatlanadigan funksiyalar

- ✅ Majburiy obunani tekshirish (bir nechta kanal)
- ✅ Referal tizimi (havola orqali taklif, faqat tasdiqlangan obunadan keyin ball berish)
- ✅ Test/viktorina (3 yoki 4 variantli savollar, bitta test — bir marta ishlash)
- ✅ Umumiy ball = Test balli + Referal balli
- ✅ Reyting (TOP-10)
- ✅ Admin panel: kanal qo'shish/o'chirish, konkurs yaratish, kitob va savol qo'shish, konkursni yakunlash, avtomatik natija e'lon qilish, statistika, ommaviy xabar yuborish

## Keyingi qadamlar (kengaytirish uchun tavsiyalar)

- `node-cron` yordamida konkurs `endDate` vaqti kelganda avtomatik yakunlash
- Shubhali referallarni aniqlash uchun qo'shimcha tekshiruvlar (masalan, akkaunt yaratilgan sana, faollik tahlili)
- Admin uchun statistikani Excel (`exceljs`) formatida eksport qilish
- Katta yuklama uchun in-memory sessiyalarni (quiz, wizard state) Redis'ga ko'chirish
- To'liq matnli konkurs muddati bo'yicha eslatmalar (masalan, "konkurs tugashiga 1 kun qoldi")

## PostgreSQL'ga o'tish

`.env` faylida:
```
DB_DIALECT=postgres
DB_HOST=...
DB_PORT=5432
DB_NAME=...
DB_USER=...
DB_PASSWORD=...
```

va qo'shimcha kutubxona o'rnating:
```bash
npm install pg pg-hstore
```
