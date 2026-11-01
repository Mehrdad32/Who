# Who · Browser Privacy Awareness

> **What does your browser reveal?** An interactive, open-source, Persian-language privacy-awareness experience, built for `who.mehrdad32.ir`.

[Live domain](https://who.mehrdad32.ir/) · [Creator](https://mehrdad32.ir/) · [Source](https://github.com/Mehrdad32/Who)

## Features

- **`/`** — Cinematic, step-by-step browser-data walkthrough, with opt-in permission experiments.
- **`/full`** — Searchable table of HTTP request metadata and locally computed browser signals. No permission prompts.
- **`/lite`** — IP, browser/version, operating system, and device category at a glance.
- Right-to-left Persian UI with locally hosted **Vazirmatn** fonts, mobile-first layout, reduced-motion support and no external runtime scripts, fonts or analytics.
- Every permission demo uses an explicit click. Camera, microphone and screen-share media tracks are stopped immediately; NFC scanning stops on step change.
- Web Share API and copyable link at the end of the experience.

## Privacy architecture

The web app uses **no analytics, cookies, localStorage, sessionStorage, database, KV, R2, D1, third-party IP providers or custom logging**. In particular:

1. The browser naturally sends HTTP request metadata to Cloudflare to load the website. The stateless `/api/info` Pages Function returns selected metadata from **that same request** (including the connecting IP and Cloudflare's existing coarse geolocation estimate) directly to the visitor. It does not persist it.
2. JavaScript-derived browser signals (including canvas and audio fingerprint demonstrations) are computed locally and **never uploaded** to the server.
3. Permission demonstrations run only after the visitor clicks a dedicated button. The site does not store the resulting data or upload file contents, camera frames or audio samples.
4. The site doesn't install tracking cookies or register a service worker. All runtime assets come from the same origin.

**Important distinction:** Cloudflare, as the infrastructure provider, processes the usual network traffic and may keep operational/security logs depending on your Cloudflare account configuration and policies. This project does not control or promise deletion of provider-level logs. Disable Web Analytics, Zaraz and any extra monitoring rules if you intend to maintain the app's no-tracking design. External links and share targets are only contacted after user interaction.

IP geolocation, UA parsing, Client Hints and browser fingerprints may be incomplete, ambiguous, or intentionally reduced by browser privacy defenses. Data availability varies by browser and OS. Permission dialogs may not appear when permission was previously granted or denied.

## Deploy to Cloudflare Pages (Git integration)

1. Open **Cloudflare Dashboard → Workers & Pages → Create application → Pages → Connect to Git**.
2. Select **`Mehrdad32/Who`**, production branch **`main`**.
3. Framework preset: **Vite**. Build command: `npm run build`. Output directory: **`dist`**. Root directory: `/`. The `/functions` folder is automatically detected for Cloudflare Pages Functions.
4. Deploy. The Vite output contains `public/_routes.json`, limiting Function invocation to `/api/*`; other requests are static.
5. In **Pages → Custom domains**, attach **`who.mehrdad32.ir`** and configure DNS as requested by Cloudflare. HTTPS is required for permission-based Web APIs.
6. Verify `/`, `/lite`, `/full`, and `/api/info`. `/api/info` must respond with `Cache-Control: no-store` and never be cached by a user-defined Cloudflare rule.

Cloudflare Pages SPA fallback handles deep links `/lite` and `/full` when there is no root `404.html`. For local API testing, build and use `npx wrangler pages dev dist` after installing Wrangler; Vite's standalone development server does not execute Pages Functions, so the IP field is unavailable in plain `npm run dev`.

## Local development

```bash
npm install
npm run dev
npm run build
```

**Tech:** React, TypeScript, Vite, Lucide, Fontsource/Vazirmatn, Cloudflare Pages Functions.

## Security & limitations

- Browsers mediate sensitive APIs. Some are available only over HTTPS, behind OS permissions, with user gesture, or on selected platforms.
- Canvas/audio demo hashes are not stable unique identifiers, nor proof of identifying an individual.
- `/api/info` reads request headers from the same-origin request only; it does not claim to expose every possible hidden header or internal IP address.
- This is an educational demonstration, not a fingerprinting or tracking service.

## License

MIT (application code). Bundled Vazirmatn fonts are distributed under their own **SIL Open Font License 1.1**; see the upstream font package for license details.