# Al-Wadi Admin Dashboard (لوحة تحكم شركة الوادي)

Admin dashboard for https://alwady.vercel.app, built on the existing PHP REST API (`admin_api.php`).
React + Vite + TypeScript, Tailwind CSS v4, React Router, TanStack Query, react-hook-form, i18next (Arabic RTL default / English LTR), sonner, lucide-react.

## Setup

```bash
npm install
cp .env.example .env     # then edit if the API lives elsewhere
```

### Environment variable

| Variable        | Example                              | Meaning                                  |
|-----------------|--------------------------------------|------------------------------------------|
| `VITE_API_BASE` | `https://camp-coding.net/al-wadi`    | Base URL; requests go to `${VITE_API_BASE}/admin_api.php?action=...` |

Vite inlines this at **build time**, so rebuild after changing it.

## Scripts

```bash
npm run dev        # dev server with hot reload
npm run build      # type-check (tsc) + production build into dist/
npm run preview    # serve dist/ locally
npm run typecheck  # TypeScript only
```

## Deploy

Upload the contents of `dist/` to any static host (Vercel, Netlify, cPanel/shared hosting, Nginx…).

The app uses client-side routing, so unknown paths must fall back to `index.html`:
- **Apache / cPanel:** `public/.htaccess` is copied into `dist/` automatically.
- **Nginx:** `location / { try_files $uri /index.html; }`
- **Vercel:** add a `vercel.json` with `{"rewrites":[{"source":"/(.*)","destination":"/index.html"}]}`
- **Netlify:** add `public/_redirects` containing `/* /index.html 200`

The API server must allow CORS from the dashboard origin, including the `Authorization` and `X-Token` headers.

## Structure

```
src/
  api/client.ts      fetch wrapper (base URL, token headers, JSON/FormData, 401 → logout)
  api/payload.ts     buildPayload / buildPagePayload (JSON vs multipart)
  api/hooks.ts       React Query hooks for every endpoint
  i18n/              ar.json, en.json (UI strings, field + section label dictionaries)
  components/        UI kit, ImageInput, GalleryInput, LinesInput, FieldRenderer, SaveBar, ...
  layouts/           AdminLayout (sidebar + top bar), nav config
  pages/             Login, Dashboard, PageEditor, CrudList, Messages, Newsletter, Settings, ChangePassword
  routes.tsx
```

## Notes

- Content forms are generated from `?action=tables`; labels come from the dictionaries in `src/i18n/*.json` (falling back to the API label). To add a label for a new field or setting key, add it under `fields`.
- Sections get friendly names from `sections.*` in the same files.
- Only changed values are sent when saving. Multipart is used only when a new file is chosen (or a gallery field changed); otherwise JSON.
- Ctrl/Cmd+S saves the open page, form or settings.
