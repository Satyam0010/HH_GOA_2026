type Request = {
  query: Record<string, string | string[] | undefined>;
};

type Response = {
  setHeader(name: string, value: string): void;
  status(code: number): { send(body: string): void };
};

const TITLE = 'HackerHouse Goa 2026';
const DESCRIPTION = 'Just built my HackerHouse Goa Builder ID. #FrameInGoa';

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] ?? character);
}

function getCloudinaryImage(value: unknown) {
  if (typeof value !== 'string') return null;

  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.hostname !== 'res.cloudinary.com') return null;
    return url.toString();
  } catch {
    return null;
  }
}

export default function handler(req: Request, res: Response) {
  const image = getCloudinaryImage(req.query.image);
  if (!image) {
    return res.status(400).send('A valid Cloudinary image URL is required.');
  }

  const origin = 'https://hh-goa-2026-pearl.vercel.app';
  const canonicalUrl = `${origin}/api/share?image=${encodeURIComponent(image)}`;
  const safeImage = escapeHtml(image);
  const safeCanonicalUrl = escapeHtml(canonicalUrl);

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  // Cloudinary URLs are versioned/immutable, so cache this card response for reliable crawler access.
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
  res.setHeader('X-Robots-Tag', 'index, follow');

  return res.status(200).send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${TITLE}</title>
    <link rel="canonical" href="${safeCanonicalUrl}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="HackerHouse Goa" />
    <meta property="og:title" content="${TITLE}" />
    <meta property="og:description" content="${DESCRIPTION}" />
    <meta property="og:url" content="${safeCanonicalUrl}" />
    <meta property="og:image" content="${safeImage}" />
    <meta property="og:image:secure_url" content="${safeImage}" />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:image:alt" content="Generated HackerHouse Goa Builder ID" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${TITLE}" />
    <meta name="twitter:description" content="${DESCRIPTION}" />
    <meta name="twitter:image" content="${safeImage}" />
    <meta name="twitter:image:alt" content="Generated HackerHouse Goa Builder ID" />
  </head>
  <body>
    <img src="${safeImage}" alt="Generated HackerHouse Goa Builder ID" />
  </body>
</html>`);
}
