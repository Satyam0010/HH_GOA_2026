declare const Deno: {
  env: {
    get(name: string): string | undefined;
  };
  serve(handler: (req: Request) => Response | Promise<Response>): void;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const MAX_DATA_URL_LENGTH = 11 * 1024 * 1024;
const allowedFormats = new Set(["image/png", "image/jpeg"]);

function response(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function sha1(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-1", bytes);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });
  if (req.method !== "POST") return response({ error: "Method not allowed." }, 405);

  try {
    const cloudName = Deno.env.get("CLOUDINARY_CLOUD_NAME");
    const apiKey = Deno.env.get("CLOUDINARY_API_KEY");
    const apiSecret = Deno.env.get("CLOUDINARY_API_SECRET");
    if (!cloudName || !apiKey || !apiSecret) return response({ error: "Image sharing is not configured yet." }, 503);

    const body = await req.json() as { image?: unknown; format?: unknown };
    if (typeof body.image !== "string" || body.image.length > MAX_DATA_URL_LENGTH) return response({ error: "The generated image is too large." }, 413);
    if (typeof body.format !== "string" || !["frame", "id"].includes(body.format)) return response({ error: "Invalid graphic format." }, 400);

    const match = body.image.match(/^data:(image\/(?:png|jpeg));base64,([A-Za-z0-9+/=]+)$/);
    if (!match || !allowedFormats.has(match[1])) return response({ error: "Only PNG and JPEG images are supported." }, 400);

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const folder = "hh-goa-2026";
    const publicId = `${body.format}-${crypto.randomUUID()}`;
    const signature = await sha1(`folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`);
    const form = new FormData();
    form.append("file", body.image);
    form.append("api_key", apiKey);
    form.append("timestamp", timestamp);
    form.append("folder", folder);
    form.append("public_id", publicId);
    form.append("signature", signature);

    const cloudinaryResponse = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`, { method: "POST", body: form });
    if (!cloudinaryResponse.ok) return response({ error: "Image sharing is temporarily unavailable." }, 502);
    const uploaded = await cloudinaryResponse.json() as { secure_url?: unknown };
    if (typeof uploaded.secure_url !== "string") return response({ error: "Image sharing is temporarily unavailable." }, 502);

    return response({ url: uploaded.secure_url });
  } catch (error) {
    console.error("upload-graphic failed", error);
    return response({ error: "Image sharing is temporarily unavailable." }, 500);
  }
});
