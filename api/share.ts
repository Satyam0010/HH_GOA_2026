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

  // ✅ Proper fallback (REAL URL, no markdown)
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

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <title>HackerHouse Goa 2026</title>

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="HackerHouse Goa 2026" />
  <meta name="twitter:description" content="Just built my HackerHouse Goa frame 🚀" />
  <meta name="twitter:image" content="IMAGE_URL?v=123" />

  <!-- Open Graph -->
  <meta property="og:title" content="HackerHouse Goa 2026" />
  <meta property="og:description" content="Join me at HackerHouse Goa 🚀" />
  <meta property="og:image" content="IMAGE_URL?v=123" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="FULL_SHARE_URL" />
</head>

<body>
  <p>HackerHouse Goa 2026</p>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  // ✅ CRITICAL: prevent caching issues
  res.setHeader(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
  );

  res.status(200).send(html);
}