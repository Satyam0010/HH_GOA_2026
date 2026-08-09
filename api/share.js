export default function handler(req, res) {
  const { image } = req.query;

  // ❌ If no image provided
  if (!image) {
    return res.status(400).send("Missing image URL");
  }

  // Decode image URL (important)
  const imageUrl = decodeURIComponent(image);

  // Construct full URL for OG tags
  const fullUrl = `https://${req.headers.host}/api/share?image=${encodeURIComponent(imageUrl)}`;

  // Set HTML response
  res.setHeader("Content-Type", "text/html");

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />

        <!-- Open Graph (for X preview) -->
        <meta property="og:title" content="HackerHouse Goa Builder ID 🚀" />
        <meta property="og:description" content="Just built my HH Goa Builder ID. Check it out!" />
        <meta property="og:image" content="${imageUrl}" />
        <meta property="og:url" content="${fullUrl}" />

        <!-- Twitter specific -->
        <meta name="twitter:card" content="summary_large_image" />

        <title>HH Goa Builder ID</title>
      </head>

      <body style="margin:0; display:flex; justify-content:center; align-items:center; height:100vh; background:#111;">
        <img src="${imageUrl}" style="max-width:90%; border-radius:12px;" />
      </body>
    </html>
  `);
}