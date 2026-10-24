# My Piano – Free Online 88-Key Virtual Piano

![My Piano Banner](/images/scrollbgm.jpg)

A high-performance, responsive virtual piano web application featuring authentic acoustic grand piano recordings across 7 full octaves (84 active keys). Built with modern HTML5, Vanilla CSS, and TypeScript powered by the Web Audio API for zero-latency polyphonic playback.

---

## 🎹 Features

- **88 Authentic Grand Piano Samples**: Dedicated studio-grade acoustic Vorbis (`.ogg`) recordings for every note.
- **7 Full Octaves & 84 Active Keys**: 49 white keys (`A1` to `G7`) and 35 black keys (`A#1` to `G#7`) with exact physical acoustic spacing.
- **Zero-Latency Polyphony**: Play multi-note chords, trills, and arpeggios simultaneously without audio clipping.
- **Interactive Mini-Piano Seekbar**: Real-time bidirectional navigation strip mirroring the full 88-key piano.
- **Desktop QWERTY Keyboard Controls**: Home-row mapping (`A`–`J` white keys, `W`–`U` black keys) with octave shift shortcuts (`[` and `]`).
- **Touch & Mouse Glissando**: Drag smoothly across keys with pointer capture support for phones, tablets, and desktops.
- **Visual Contact Glow**: Keys light up with a vibrant cyan (`#80ffe5`) contact flash.
- **Full SEO, AEO & GEO Optimization**: Semantic HTML5 markup, Open Graph, Twitter Cards, `robots.txt`, `sitemap.xml`, `llms.txt`, and valid JSON-LD structured data (`WebSite`, `WebPage`, `SoftwareApplication`, `FAQPage`).
- **No Installation & No Tracking**: 100% free, runs entirely client-side in the browser.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or newer)
- npm, pnpm, or yarn

### Installation & Local Development

```bash
# Clone the repository
git clone <your-repository-url>
cd my-piano

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173/](http://localhost:5173/) in your web browser.

### Production Build

```bash
# Compile and bundle for production
npm run build

# Preview production build locally
npm run preview
```

The output bundle is generated inside the `dist/` directory, ready to be served by any static host or web server.

---

## ⌨️ Keyboard Controls Mapping (Middle C / Octave 4)

| Note | C4 | C#4 | D4 | D#4 | E4 | F4 | F#4 | G4 | G#4 | A4 | A#4 | B4 | C5 |
| :--- | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| **Key** | `A` | `W` | `S` | `E` | `D` | `F` | `T` | `G` | `Y` | `H` | `U` | `J` | `K` |

- **Octave Down**: `[`
- **Octave Up**: `]`
- **Show/Hide Key Badges**: Click the **Keys** button in the top toolbar.

---

## 🌐 Deploy to Hosting Platforms

### Deploy on Cloudflare Pages (Recommended)

1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/) and go to **Compute (Workers & Pages)** > **Create an application** > **Pages**.
2. Select **Connect to Git** and choose the `my-piano-web` repository.
3. Configure the build settings:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (leave blank or set to `/`)
4. Click **Save and Deploy**.

> **Note**: This repository already includes pre-configured `_redirects` for SPA routing and `_headers` for long-term Cloudflare edge caching of all 88 acoustic `.ogg` piano samples and static assets.

### Deploy on Vercel
1. Import the project on [Vercel](https://vercel.com/).
2. Framework Preset: **Vite**.
3. Click **Deploy**.

### Deploy on Netlify
1. Connect your repository on [Netlify](https://www.netlify.com/).
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Click **Deploy site**.

---

## 📁 Project Structure

```
├── public/
│   ├── favicon.webp           # Website favicon
│   ├── images/
│   │   ├── scrollbgm.jpg      # Mini-piano seekbar background strip
│   │   └── thumb.jpg          # Viewport thumb indicator
│   ├── sounds/                # 88 Vorbis (.ogg) acoustic piano recordings
│   ├── robots.txt             # Search crawler directives
│   ├── sitemap.xml            # Canonical XML sitemap
│   └── llms.txt               # AEO / GEO documentation for AI engines
├── src/
│   ├── audio.ts               # Web Audio API polyphonic engine
│   ├── main.ts                # Application lifecycle & event listeners
│   ├── pianoData.ts           # 88-note data, offsets & keyboard mapping
│   └── style.css              # Vanilla CSS design system
├── index.html                 # Semantic HTML5 shell with structured data
├── package.json               # Dependencies and build scripts
├── tsconfig.json              # TypeScript compiler configuration
└── vite.config.js             # Vite configuration
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
