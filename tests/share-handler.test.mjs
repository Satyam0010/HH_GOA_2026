import assert from "node:assert/strict";

process.env.SUPABASE_URL = "https://project.supabase.co";
process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";
process.env.CLOUDINARY_CLOUD_NAME = "hackerhouse-goa";
process.env.PUBLIC_SITE_URL = "https://hackerhouse.example";

const { default: handler } = await import(
  "../node_modules/.tmp/share-handler-test/share.js"
);

const records = new Map();
const originalFetch = globalThis.fetch;

globalThis.fetch = async (input, init = {}) => {
  const url = new URL(String(input));
  const method = init.method ?? "GET";

  assert.equal(url.origin, "https://project.supabase.co");
  assert.equal(url.pathname, "/rest/v1/share_records");

  if (method === "POST") {
    const record = JSON.parse(String(init.body));
    if (records.has(record.share_id)) {
      return new Response(JSON.stringify({ code: "23505" }), { status: 409 });
    }

    records.set(record.share_id, {
      ...record,
      created_at: "2026-08-11T00:00:00.000Z",
    });
    return new Response(null, { status: 201 });
  }

  if (method === "GET") {
    const requestedId = url.searchParams.get("share_id")?.replace(/^eq\./, "");
    const record = requestedId ? records.get(requestedId) : undefined;
    return new Response(JSON.stringify(record ? [record] : []), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  throw new Error("Unexpected storage method: " + method);
};

async function invoke({
  method,
  query = {},
  body,
  headers = {},
}) {
  const responseHeaders = new Map();
  let statusCode;
  let responseBody;

  const response = {
    setHeader(name, value) {
      responseHeaders.set(name.toLowerCase(), value);
    },
    status(code) {
      statusCode = code;
      return {
        json(value) {
          responseBody = JSON.stringify(value);
        },
        send(value) {
          responseBody = value;
        },
      };
    },
  };

  await handler({ method, query, body, headers }, response);
  return { body: responseBody, headers: responseHeaders, statusCode };
}

try {
  const imageA =
    "https://res.cloudinary.com/hackerhouse-goa/image/upload/v1/hh-goa/a.png";
  const imageB =
    "https://res.cloudinary.com/hackerhouse-goa/image/upload/v1/hh-goa/b.png";

  const createdA = await invoke({
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://hackerhouse.example",
    },
    body: { imageUrl: imageA },
  });
  assert.equal(createdA.statusCode, 201);
  assert.equal(
    createdA.headers.get("content-type"),
    "application/json; charset=utf-8",
  );
  const shareA = JSON.parse(createdA.body);
  assert.match(shareA.shareId, /^[a-f0-9]{32}$/);
  assert.equal(
    shareA.shareUrl,
    "https://hackerhouse.example/share/" + shareA.shareId,
  );

  const createdB = await invoke({
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://hackerhouse.example",
    },
    body: { imageUrl: imageB },
  });
  assert.equal(createdB.statusCode, 201);
  const shareB = JSON.parse(createdB.body);
  assert.notEqual(shareA.shareId, shareB.shareId);

  const pageA = await invoke({
    method: "GET",
    query: { shareId: shareA.shareId },
    headers: { host: "hackerhouse.example" },
  });
  assert.equal(pageA.statusCode, 200);
  assert.equal(pageA.headers.get("content-type"), "text/html; charset=utf-8");
  assert.equal(pageA.headers.get("location"), undefined);
  assert.match(
    pageA.body,
    new RegExp('name="twitter:image" content="' + imageA + '"'),
  );
  assert.match(
    pageA.body,
    new RegExp('property="og:image" content="' + imageA + '"'),
  );
  assert.match(
    pageA.body,
    new RegExp('rel="canonical" href="' + shareA.shareUrl + '"'),
  );

  const twitterbotPage = await invoke({
    method: "GET",
    query: { shareId: shareA.shareId },
    headers: {
      host: "hackerhouse.example",
      "user-agent": "Twitterbot",
    },
  });
  assert.equal(twitterbotPage.statusCode, 200);
  assert.equal(twitterbotPage.body, pageA.body);

  const pageB = await invoke({
    method: "GET",
    query: { shareId: shareB.shareId },
    headers: { host: "hackerhouse.example" },
  });
  assert.equal(pageB.statusCode, 200);
  assert.match(
    pageB.body,
    new RegExp('name="twitter:image" content="' + imageB + '"'),
  );

  const unknown = await invoke({
    method: "GET",
    query: { shareId: "0123456789abcdef0123456789abcdef" },
    headers: { host: "hackerhouse.example" },
  });
  assert.equal(unknown.statusCode, 404);
  assert.equal(unknown.headers.get("content-type"), "text/html; charset=utf-8");

  const malformed = await invoke({
    method: "GET",
    query: { shareId: "not-a-share-id" },
    headers: { host: "hackerhouse.example" },
  });
  assert.equal(malformed.statusCode, 404);

  const unsafeImage = await invoke({
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://hackerhouse.example",
    },
    body: { imageUrl: "https://example.com/not-cloudinary.png" },
  });
  assert.equal(unsafeImage.statusCode, 400);

  console.log("share handler tests passed");
} finally {
  globalThis.fetch = originalFetch;
}
