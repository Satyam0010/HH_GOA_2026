type VercelRequest = {
  query: Record<string, string | string[] | undefined>;
};

type VercelResponse = {
  setHeader(name: string, value: string): void;
  status(code: number): {
    send(body: string): void;
  };
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  const { image, v } = req.query;

  // ✅ Ensure image is a string
  const rawImage =
    typeof image === 'string'
      ? image
      : Array.isArray(image)
      ? image[0]
      : '';

  // ✅ FIXED fallback (REAL URL)
  const imageUrl =
    rawImage && rawImage.length > 0
      ? rawImage
      : 'https://yourdomain.com/default-preview.png';

  // ✅ Cache busting
  const version =
    typeof v === 'string' ? v : Date.now().toString();

  const title = "My HackerHouse Goa Frame 🚀";
  const description =
    "Just generated my custom HackerHouse Goa frame. Check yours!";

  const shareUrl = `https://yourdomain.vercel.app/api/share?image=${encodeURIComponent(
    imageUrl
  )}&v=${version}`;

  // ✅ FULL HTML (THIS WAS MISSING)
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />

  <title>${title}</title>

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${imageUrl}?v=${version}" />
  <meta property="og:url" content="${shareUrl}" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${imageUrl}?v=${version}" />

</head>
<body>
  <p>HackerHouse Goa 2026</p>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  // ✅ CRITICAL
  res.setHeader(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
  );

  res.status(200).send(html);
}