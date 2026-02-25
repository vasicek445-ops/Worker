# 🚀 WOKER Landing Page – Návod k nasazení

## Soubory

```
woker-deploy/
├── landing-page.html              ← Finální HTML (obrázky jako /images/...)
├── woker-landing-v4-standalone.html  ← Standalone verze (obrázky embedded v base64)
├── public/images/
│   ├── founder-lake.jpg           ← Fotka u jezera (founder sekce)
│   └── founder-beanie.jpg         ← Fotka v čepici (garance)
└── NASAZENI.md                    ← Tento návod
```

---

## VARIANTA 1: Next.js + Vercel (NEJRYCHLEJŠÍ)

Máš Next.js projekt → stačí 3 kroky:

**1. Zkopíruj soubory do tvého projektu:**
```bash
cp landing-page.html   tvuj-projekt/public/landing.html
cp -r public/images/   tvuj-projekt/public/images/
```

**2. Nastav přesměrování v `next.config.js`:**
```js
async rewrites() {
  return [
    { source: '/', destination: '/landing.html' },
  ];
}
```

**3. Push a Vercel nasadí:**
```bash
git add . && git commit -m "New landing page" && git push
```

---

## VARIANTA 2: Standalone HTML (NEJJEDNODUŠŠÍ)

Použij soubor `woker-landing-v4-standalone.html` – má obrázky přímo v sobě (base64), takže nepotřebuje žádné další soubory.

Stačí nahrát na jakýkoliv hosting (Vercel, Netlify, GitHub Pages...).

---

## ⚠️ Co změnit před nasazením

1. **CTA odkazy** → `/dashboard` nahraď za tvůj Stripe checkout URL
2. **Testimonials** → až budeš mít reálné recenze, nahraď fiktivní
3. **Timer** → resetuje se při refreshi – pro reálný countdown napoj na server

## 📈 Tipy

- Přidej Meta Pixel + Google Analytics
- Nastav retargeting pro lidi co odejdou bez nákupu
- Testuj A/B varianty headlines
