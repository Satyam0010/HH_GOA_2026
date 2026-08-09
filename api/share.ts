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
  const image = req.query.image as string;

  res.setHeader("Content-Type", "text/html");

  res.status(200).send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="My HackerHouse Goa Frame" />
        <meta name="twitter:description" content="My frame is ready 🚀" />
        <meta name="twitter:image" content="${image}" />

        <meta property="og:title" content="My HackerHouse Goa Frame" />
        <meta property="og:description" content="My frame is ready 🚀" />
        <meta property="og:image" content="${image}" />
      </head>
      <body>
        Preview Page
      </body>
    </html>
  `);
}