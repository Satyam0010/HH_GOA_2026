# HackerHouse Goa 2026

## Immutable X share links

The X share flow is Cloudinary upload -> POST /api/share -> immutable
/share/:shareId link. Vercel rewrites that public path internally to the
serverless function, which returns fully rendered HTML and social metadata
without React or client JavaScript.

Before deploying:

1. Apply supabase/migrations/20260811000000_create_share_records.sql to the
   existing Supabase project.
2. Configure the values in .env.share.example in Vercel. Keep
   SUPABASE_SERVICE_ROLE_KEY server-only; do not prefix it with VITE_.
3. Set PUBLIC_SITE_URL to the final HTTPS domain that people will share.

Useful checks:

- npm run build
- npm run test:share
- Use vercel dev or a Vercel preview for end-to-end checks, because Vite does
  not run api/share.ts or the /share/:shareId rewrite.
