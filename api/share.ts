export default function handler(req: any, res: any) {
  const image = req.query.image;

  res.setHeader("Content-Type", "text/html");
  res.setHeader("Cache-Control", "no-store");

  res.status(200).send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="HackerHouse Goa 2026" />
        <meta name="twitter:description" content="Just built my HackerHouse Goa frame 🚀 #FrameInGoa" />
        <meta name="twitter:image" content="${image}" />

        <meta property="og:title" content="HackerHouse Goa 2026" />
        <meta property="og:description" content="Just built my HackerHouse Goa frame 🚀 #FrameInGoa" />
        <meta property="og:image" content="${image}" />
      </head>
      <body>OK</body>
    </html>
  `);
}