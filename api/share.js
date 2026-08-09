export default function handler(req, res) {
  const { image } = req.query;

  if (!image) {
    return res.status(400).send("Missing image");
  }

  const html = `
  <!DOCTYPE html>
  <html>
    <head>
      <title>HackerHouse Goa 2026</title>

      <!-- Twitter Meta -->
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="HackerHouse Goa 2026" />
      <meta name="twitter:description" content="Just built my HackerHouse Goa frame 🚀 #FrameInGoa" />
      <meta name="twitter:image" content="${image}" />

      <!-- Open Graph -->
      <meta property="og:title" content="HackerHouse Goa 2026" />
      <meta property="og:description" content="Join me at HackerHouse Goa 🚀" />
      <meta property="og:image" content="${image}" />
      <meta property="og:type" content="website" />

    </head>
    <body>
      <script>
        window.location.href = "${image}";
      </script>
    </body>
  </html>
  `;

  res.setHeader("Content-Type", "text/html");
  res.status(200).send(html);
}