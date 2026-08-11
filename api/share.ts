type QueryValue = string | string[] | undefined;

type VercelRequest = {
  method?: string;
  query: Record<string, QueryValue>;
  body?: unknown;
  headers: Record<string, string | string[] | undefined>;
};

type VercelResponse = {
  setHeader(name: string, value: string): void;
  status(code: number): {
    json(body: unknown): void;
    send(body: string): void;
  };
};

type ShareRecord = {
  shareId: string;
  imageUrl: string;
  createdAt?: string;
};

type ShareSettings = {
  cloudinaryCloudName: string;
  publicSiteUrl?: string;
  supabaseServiceRoleKey: string;
  supabaseUrl: string;
};

const SHARE_ID_PATTERN = /^[a-f0-9]{32}$/;
const TITLE = "HackerHouse Goa";
const DESCRIPTION = "Check out my custom HackerHouse Goa frame.";

class ShareRequestError extends Error {
  constructor(
    readonly statusCode: number,
    message: string,
  ) {
    super(message);
  }
}

function getEnvironmentValue(name: string): string | undefined {
  const runtime = globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined> };
  };
  const value = runtime.process?.env?.[name];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function getHeader(
  headers: VercelRequest["headers"],
  name: string,
): string | undefined {
  const value = headers[name] ?? headers[name.toLowerCase()];
  if (Array.isArray(value)) return value[0];
  return typeof value === "string" ? value : undefined;
}

function getQueryValue(
  query: VercelRequest["query"],
  name: string,
): string | undefined {
  const value = query[name];
  return typeof value === "string" ? value : undefined;
}

function normalizeServiceUrl(value: string): string {
  let parsed: URL;

  try {
    parsed = new URL(value);
  } catch {
    throw new ShareRequestError(503, "Share storage is not configured.");
  }

  if (
    parsed.protocol !== "https:" ||
    parsed.username ||
    parsed.password ||
    parsed.search ||
    parsed.hash
  ) {
    throw new ShareRequestError(503, "Share storage is not configured.");
  }

  return parsed.origin;
}

function normalizePublicSiteUrl(value: string): string {
  let parsed: URL;

  try {
    parsed = new URL(value);
  } catch {
    throw new ShareRequestError(503, "The public share URL is not configured.");
  }

  const isLocalHost =
    parsed.hostname === "localhost" ||
    parsed.hostname === "127.0.0.1" ||
    parsed.hostname === "[::1]";

  if (
    (parsed.protocol !== "https:" &&
      !(isLocalHost && parsed.protocol === "http:")) ||
    parsed.username ||
    parsed.password ||
    parsed.pathname !== "/" ||
    parsed.search ||
    parsed.hash
  ) {
    throw new ShareRequestError(503, "The public share URL is not configured.");
  }

  return parsed.origin;
}

function loadSettings(): ShareSettings {
  const supabaseUrl =
    getEnvironmentValue("SUPABASE_URL") ??
    getEnvironmentValue("VITE_SUPABASE_URL");
  const supabaseServiceRoleKey = getEnvironmentValue(
    "SUPABASE_SERVICE_ROLE_KEY",
  );
  const cloudinaryCloudName =
    getEnvironmentValue("CLOUDINARY_CLOUD_NAME") ??
    getEnvironmentValue("VITE_CLOUDINARY_CLOUD_NAME");
  const configuredPublicSiteUrl = getEnvironmentValue("PUBLIC_SITE_URL");

  if (!supabaseUrl || !supabaseServiceRoleKey || !cloudinaryCloudName) {
    throw new ShareRequestError(503, "Sharing is not configured yet.");
  }

  return {
    supabaseUrl: normalizeServiceUrl(supabaseUrl),
    supabaseServiceRoleKey,
    cloudinaryCloudName,
    publicSiteUrl: configuredPublicSiteUrl
      ? normalizePublicSiteUrl(configuredPublicSiteUrl)
      : undefined,
  };
}

function resolvePublicSiteUrl(
  req: VercelRequest,
  settings: ShareSettings,
): string {
  if (settings.publicSiteUrl) return settings.publicSiteUrl;

  const forwardedHost = getHeader(req.headers, "x-forwarded-host");
  const host = (forwardedHost ?? getHeader(req.headers, "host"))
    ?.split(",")[0]
    ?.trim();

  if (!host) {
    throw new ShareRequestError(503, "The public share URL is not configured.");
  }

  return normalizePublicSiteUrl("https://" + host);
}

function assertAllowedOrigin(
  req: VercelRequest,
  settings: ShareSettings,
): void {
  const requestOrigin = getHeader(req.headers, "origin");

  // Command-line clients do not send Origin. Browser requests must be same-origin
  // when PUBLIC_SITE_URL is configured.
  if (!requestOrigin || !settings.publicSiteUrl) return;

  let normalizedRequestOrigin: string;
  try {
    normalizedRequestOrigin = new URL(requestOrigin).origin;
  } catch {
    throw new ShareRequestError(403, "This share request is not allowed.");
  }

  if (normalizedRequestOrigin !== settings.publicSiteUrl) {
    throw new ShareRequestError(403, "This share request is not allowed.");
  }
}

export function isShareId(value: string | undefined): value is string {
  return typeof value === "string" && SHARE_ID_PATTERN.test(value);
}

export function validateCloudinaryImageUrl(
  input: string,
  cloudinaryCloudName: string,
): string {
  if (input.length === 0 || input.length > 2048) {
    throw new ShareRequestError(400, "A valid Cloudinary image URL is required.");
  }

  let parsed: URL;
  try {
    parsed = new URL(input);
  } catch {
    throw new ShareRequestError(400, "A valid Cloudinary image URL is required.");
  }

  const pathSegments = parsed.pathname.split("/").filter(Boolean);
  const isCloudinaryUploadUrl =
    parsed.protocol === "https:" &&
    parsed.hostname === "res.cloudinary.com" &&
    !parsed.username &&
    !parsed.password &&
    !parsed.search &&
    !parsed.hash &&
    pathSegments[0] === cloudinaryCloudName &&
    pathSegments[1] === "image" &&
    pathSegments[2] === "upload" &&
    pathSegments.length > 3;

  if (!isCloudinaryUploadUrl) {
    throw new ShareRequestError(400, "A valid Cloudinary image URL is required.");
  }

  return parsed.toString();
}

function parseCreateShareBody(body: unknown): { imageUrl: string } {
  let parsedBody = body;

  if (typeof body === "string") {
    try {
      parsedBody = JSON.parse(body) as unknown;
    } catch {
      throw new ShareRequestError(400, "Request body must be valid JSON.");
    }
  }

  if (
    !parsedBody ||
    typeof parsedBody !== "object" ||
    Array.isArray(parsedBody)
  ) {
    throw new ShareRequestError(400, "Request body must include imageUrl.");
  }

  const imageUrl = (parsedBody as Record<string, unknown>).imageUrl;
  if (typeof imageUrl !== "string") {
    throw new ShareRequestError(400, "Request body must include imageUrl.");
  }

  return { imageUrl };
}

function createShareId(): string {
  const randomUuid = globalThis.crypto?.randomUUID;

  if (typeof randomUuid !== "function") {
    throw new ShareRequestError(503, "Secure share IDs are unavailable.");
  }

  return randomUuid.call(globalThis.crypto).replace(/-/g, "");
}

function supabaseHeaders(settings: ShareSettings): Record<string, string> {
  return {
    apikey: settings.supabaseServiceRoleKey,
    Authorization: "Bearer " + settings.supabaseServiceRoleKey,
  };
}

async function createShareRecord(
  settings: ShareSettings,
  imageUrl: string,
): Promise<ShareRecord> {
  const endpoint = settings.supabaseUrl + "/rest/v1/share_records";

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const shareId = createShareId();

    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: "POST",
        headers: {
          ...supabaseHeaders(settings),
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          share_id: shareId,
          image_url: imageUrl,
        }),
      });
    } catch {
      console.error("share storage create request failed");
      throw new ShareRequestError(502, "Unable to create a share right now.");
    }

    if (response.ok) {
      return { shareId, imageUrl };
    }

    // A collision is extraordinarily unlikely, but an insert-only retry keeps the
    // mapping immutable even if it happens.
    if (response.status === 409) continue;

    console.error("share storage create failed", { status: response.status });
    throw new ShareRequestError(502, "Unable to create a share right now.");
  }

  throw new ShareRequestError(503, "Unable to create a unique share right now.");
}

async function findShareRecord(
  settings: ShareSettings,
  shareId: string,
): Promise<ShareRecord | null> {
  const endpoint = new URL(
    "/rest/v1/share_records",
    settings.supabaseUrl,
  );
  endpoint.searchParams.set("select", "share_id,image_url,created_at");
  endpoint.searchParams.set("share_id", "eq." + shareId);
  endpoint.searchParams.set("limit", "1");

  let response: Response;
  try {
    response = await fetch(endpoint, {
      headers: supabaseHeaders(settings),
    });
  } catch {
    console.error("share storage lookup request failed");
    throw new ShareRequestError(502, "Unable to retrieve this share right now.");
  }

  if (!response.ok) {
    console.error("share storage lookup failed", { status: response.status });
    throw new ShareRequestError(502, "Unable to retrieve this share right now.");
  }

  let payload: unknown;
  try {
    payload = (await response.json()) as unknown;
  } catch {
    throw new ShareRequestError(502, "Unable to retrieve this share right now.");
  }

  if (!Array.isArray(payload) || payload.length === 0) return null;

  const row = payload[0];
  if (!row || typeof row !== "object" || Array.isArray(row)) {
    throw new ShareRequestError(502, "Unable to retrieve this share right now.");
  }

  const shareIdValue = (row as Record<string, unknown>).share_id;
  const imageUrlValue = (row as Record<string, unknown>).image_url;
  const createdAtValue = (row as Record<string, unknown>).created_at;

  if (shareIdValue !== shareId || typeof imageUrlValue !== "string") {
    throw new ShareRequestError(502, "Unable to retrieve this share right now.");
  }

  try {
    return {
      shareId,
      imageUrl: validateCloudinaryImageUrl(
        imageUrlValue,
        settings.cloudinaryCloudName,
      ),
      createdAt: typeof createdAtValue === "string" ? createdAtValue : undefined,
    };
  } catch {
    console.error("share storage contains an invalid image URL", { shareId });
    throw new ShareRequestError(502, "Unable to retrieve this share right now.");
  }
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

function shareUrlFor(publicSiteUrl: string, shareId: string): string {
  return new URL("/share/" + shareId, publicSiteUrl).toString();
}

export function renderSharePage(
  record: ShareRecord,
  shareUrl: string,
  publicSiteUrl: string,
): string {
  const safeTitle = escapeHtml(TITLE);
  const safeDescription = escapeHtml(DESCRIPTION);
  const safeImageUrl = escapeHtml(record.imageUrl);
  const safeShareUrl = escapeHtml(shareUrl);
  const safeCreateUrl = escapeHtml(publicSiteUrl + "/#create");

  return [
    "<!doctype html>",
    '<html lang="en">',
    "<head>",
    '  <meta charset="utf-8" />',
    '  <meta name="viewport" content="width=device-width, initial-scale=1" />',
    "  <title>" + safeTitle + "</title>",
    '  <meta name="twitter:card" content="summary_large_image" />',
    '  <meta name="twitter:title" content="' + safeTitle + '" />',
    '  <meta name="twitter:description" content="' + safeDescription + '" />',
    '  <meta name="twitter:image" content="' + safeImageUrl + '" />',
    '  <meta property="og:title" content="' + safeTitle + '" />',
    '  <meta property="og:description" content="' + safeDescription + '" />',
    '  <meta property="og:image" content="' + safeImageUrl + '" />',
    '  <meta property="og:image:secure_url" content="' + safeImageUrl + '" />',
    '  <meta property="og:type" content="website" />',
    '  <meta property="og:url" content="' + safeShareUrl + '" />',
    '  <link rel="canonical" href="' + safeShareUrl + '" />',
    "  <style>",
    "    :root { color-scheme: light; --green: #164b38; --cream: #f8f0d8; --pink: #ee3f75; --yellow: #f3d93c; }",
    "    * { box-sizing: border-box; }",
    "    body { margin: 0; background: var(--cream); color: var(--green); font-family: Arial, sans-serif; }",
    "    main { width: min(960px, calc(100% - 32px)); margin: 0 auto; padding: 36px 0 56px; }",
    "    .brand { display: inline-flex; align-items: center; gap: 10px; color: inherit; text-decoration: none; font-weight: 800; letter-spacing: .08em; }",
    "    .mark { display: grid; place-items: center; width: 38px; height: 38px; background: var(--pink); color: var(--yellow); font-family: Georgia, serif; letter-spacing: -.08em; }",
    "    .hero { margin: 46px 0 30px; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr); gap: 42px; align-items: center; }",
    "    .eyebrow { font-size: 12px; font-weight: 700; letter-spacing: .14em; color: var(--pink); }",
    "    h1 { margin: 14px 0; font: 600 clamp(42px, 8vw, 78px)/.92 Georgia, serif; letter-spacing: -.06em; }",
    "    p { font-size: 17px; line-height: 1.55; color: #466258; }",
    "    .cta { display: inline-block; margin-top: 16px; padding: 14px 18px; background: var(--green); color: var(--cream); font-weight: 700; text-decoration: none; }",
    "    .image-wrap { background: var(--green); padding: 12px; box-shadow: 16px 16px 0 rgba(22, 75, 56, .12); }",
    "    img { display: block; width: 100%; height: auto; background: #e7d7a8; }",
    "    footer { margin-top: 52px; border-top: 1px solid rgba(22, 75, 56, .2); padding-top: 20px; font-size: 12px; letter-spacing: .08em; }",
    "    @media (max-width: 700px) { main { padding-top: 24px; } .hero { grid-template-columns: 1fr; gap: 28px; margin-top: 32px; } }",
    "  </style>",
    "</head>",
    "<body>",
    "  <main>",
    '    <a class="brand" href="' + safeCreateUrl + '" aria-label="HackerHouse Goa home"><span class="mark">HH</span><span>GOA <span style="color: var(--pink)">2026</span></span></a>',
    '    <section class="hero">',
    "      <div>",
    '        <div class="eyebrow">BUILD · SHIP · REPEAT</div>',
    "        <h1>Made for<br />HackerHouse Goa.</h1>",
    "        <p>" + safeDescription + "</p>",
    '        <a class="cta" href="' + safeCreateUrl + '">Create Your Own</a>',
    "      </div>",
    '      <div class="image-wrap"><img src="' + safeImageUrl + '" alt="Custom HackerHouse Goa frame" /></div>',
    "    </section>",
    "    <footer>HACKERHOUSE GOA · BUILD IN PUBLIC. SHIP FROM PARADISE.</footer>",
    "  </main>",
    "</body>",
    "</html>",
  ].join("\n");
}

function renderNotFoundPage(): string {
  return [
    "<!doctype html>",
    '<html lang="en">',
    "<head>",
    '  <meta charset="utf-8" />',
    "  <title>Share not found · HackerHouse Goa</title>",
    "</head>",
    "<body>",
    "  <main><h1>Share not found</h1><p>This HackerHouse Goa share link is invalid or no longer available.</p></main>",
    "</body>",
    "</html>",
  ].join("\n");
}

function renderUnavailablePage(): string {
  return [
    "<!doctype html>",
    '<html lang="en">',
    "<head>",
    '  <meta charset="utf-8" />',
    "  <title>Share unavailable · HackerHouse Goa</title>",
    "</head>",
    "<body>",
    "  <main><h1>Share unavailable</h1><p>Please try again shortly.</p></main>",
    "</body>",
    "</html>",
  ].join("\n");
}

function sendHtml(res: VercelResponse, statusCode: number, html: string): void {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; img-src 'self' https://res.cloudinary.com data:; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'",
  );
  res.status(statusCode).send(html);
}

function sendJson(
  res: VercelResponse,
  statusCode: number,
  body: Record<string, string>,
): void {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.status(statusCode).json(body);
}

async function handleCreateShare(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  const contentType = getHeader(req.headers, "content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    throw new ShareRequestError(
      415,
      "Content-Type must be application/json.",
    );
  }

  const contentLength = Number(getHeader(req.headers, "content-length"));
  if (Number.isFinite(contentLength) && contentLength > 4096) {
    throw new ShareRequestError(413, "Request body is too large.");
  }

  const settings = loadSettings();
  assertAllowedOrigin(req, settings);

  const { imageUrl } = parseCreateShareBody(req.body);
  const validatedImageUrl = validateCloudinaryImageUrl(
    imageUrl,
    settings.cloudinaryCloudName,
  );
  const record = await createShareRecord(settings, validatedImageUrl);
  const publicSiteUrl = resolvePublicSiteUrl(req, settings);
  const shareUrl = shareUrlFor(publicSiteUrl, record.shareId);

  console.info("share created", { shareId: record.shareId });
  sendJson(res, 201, { shareId: record.shareId, shareUrl });
}

async function handleSharePage(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  const shareId = getQueryValue(req.query, "shareId");

  if (!isShareId(shareId)) {
    console.info("share lookup", { shareId: "invalid", found: false });
    sendHtml(res, 404, renderNotFoundPage());
    return;
  }

  const settings = loadSettings();
  const record = await findShareRecord(settings, shareId);

  console.info("share lookup", { shareId, found: Boolean(record) });

  if (!record) {
    sendHtml(res, 404, renderNotFoundPage());
    return;
  }

  const publicSiteUrl = resolvePublicSiteUrl(req, settings);
  sendHtml(
    res,
    200,
    renderSharePage(record, shareUrlFor(publicSiteUrl, shareId), publicSiteUrl),
  );
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  try {
    if (req.method === "POST") {
      await handleCreateShare(req, res);
      return;
    }

    if (req.method === "GET") {
      await handleSharePage(req, res);
      return;
    }

    res.setHeader("Allow", "GET, POST");
    sendJson(res, 405, { error: "Method not allowed." });
  } catch (error) {
    const statusCode =
      error instanceof ShareRequestError ? error.statusCode : 500;
    const message =
      error instanceof ShareRequestError
        ? error.message
        : "Unable to process this share request.";

    console.error("share request failed", {
      method: req.method,
      statusCode,
    });

    if (req.method === "GET") {
      sendHtml(res, statusCode, renderUnavailablePage());
      return;
    }

    sendJson(res, statusCode, { error: message });
  }
}
