# Lesson video storage (Cloudflare R2) and data storage (Supabase)

Recorded classes are uploaded straight from the admin / mentor course editor to
**Cloudflare R2**. R2's free tier covers **10 GB of videos** and charges nothing
when students watch them (no bandwidth / egress fees). Payments, enrollments and
lesson questions are kept in **Supabase** so they survive Vercel restarts.

## 1. Cloudflare R2 (one-time, ~10 minutes)

1. Create a free account at <https://dash.cloudflare.com/sign-up>.
2. Left menu → **R2 Object Storage** → **Purchase R2 Plan** (free plan; Cloudflare
   asks for a card, but nothing is charged while you stay under 10 GB).
3. **Create bucket** → name it e.g. `career-bridge-videos` → location *Automatic*.
   Keep it **private** (do not enable public access).
4. Open the bucket → **Settings** → **CORS policy** → **Edit** and paste
   (replace the domain with yours, keep localhost for testing):

   ```json
   [
     {
       "AllowedOrigins": ["https://YOUR-DOMAIN.com", "http://localhost:3000"],
       "AllowedMethods": ["PUT", "GET", "HEAD"],
       "AllowedHeaders": ["*"],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```

5. R2 overview page → **Manage R2 API Tokens** → **Create API token** →
   permission **Object Read & Write**, limited to your bucket → **Create**.
   Copy the **Access Key ID** and **Secret Access Key** (shown only once).
6. Your **Account ID** is shown on the R2 overview page (right side).

## 2. Supabase table (one-time)

Supabase → **SQL Editor** → **New query** → paste the contents of
`supabase/app_kv.sql` → **Run**.

## 3. Environment variables

Add these to `.env.local` (local) **and** Vercel → Project → Settings →
Environment Variables (production), then redeploy:

```
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET=career-bridge-videos

SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SITE_URL=https://YOUR-DOMAIN.com
```

## How it works

- Each lesson in the course editor has **Upload video** (or **Paste link** for YouTube).
- The browser uploads the file directly to R2 (up to 5 GB per video) with a
  one-time signed URL, so large files never pass through Vercel.
- The lesson stores `r2:<file key>`. When a student presses play, the site checks
  that they are enrolled (paid / approved) and only then hands out a link that
  expires after 4 hours. Visitors who are not enrolled see "Enroll to watch".
- Tip: export classes as **MP4 (H.264), 720p**. A one-hour class is roughly
  300–600 MB, so 10 GB holds about 20–30 hours of lessons.
