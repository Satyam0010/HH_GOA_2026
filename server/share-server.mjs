import { createHash, randomUUID } from 'node:crypto';
import { createServer } from 'node:http';
import { Readable } from 'node:stream';
import { URL } from 'node:url';

const port = Number(process.env.PORT || 8787);
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;
const publicOrigin = (process.env.PUBLIC_SHARE_ORIGIN || '').replace(/\/$/, '');
const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
const maxBodySize = 11 * 1024 * 1024;

function send(res, status, body, headers = {}) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': allowedOrigin, ...headers });
  res.end(JSON.stringify(body));
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}

async function readFormData(req) {
  const headers = Object.fromEntries(Object.entries(req.headers).filter(([, value]) => typeof value === 'string'));
  const request = new Request(`http://${req.headers.host || 'localhost'}${req.url || '/'}`, {
    method: 'POST',
    headers,
    body: Readable.toWeb(req),
    duplex: 'half',
  });
  return request.formData();
}

async function uploadToCloudinary(image, format) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const folder = 'HackerHouse-goa-2026';
  const publicId = `${format}-${randomUUID()}`;
  const signature = createHash('sha1').update(`folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`).digest('hex');
  const form = new FormData();
  form.append('file', image);
  form.append('api_key', apiKey);
  form.append('timestamp', timestamp);
  form.append('folder', folder);
  form.append('public_id', publicId);
  form.append('signature', signature);
  const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`, { method: 'POST', body: form });
  const payload = await response.json();
  if (!response.ok || typeof payload.secure_url !== 'string') throw new Error('Cloudinary upload failed.');
  return payload.secure_url;
}

const server = createServer(async (req, res) => {
  const requestUrl = new URL(req.url || '/', `http://${req.headers.host}`);
  if (req.method === 'OPTIONS') {
    res.writeHead(204, { 'Access-Control-Allow-Origin': allowedOrigin, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' });
    return res.end();
  }

  if (req.method === 'POST' && requestUrl.pathname === '/upload') {
    if (!cloudName || !apiKey || !apiSecret || !publicOrigin) return send(res, 503, { error: 'Share server is not configured.' });
    try {
      const form = await readFormData(req);
      const image = form.get('file');
      const format = form.get('format') || 'id';
      if (!(image instanceof Blob) || !['image/png', 'image/jpeg'].includes(image.type)) return send(res, 400, { error: 'A PNG or JPEG image is required.' });
      if (image.size > maxBodySize) return send(res, 413, { error: 'Image is too large.' });
      if (!['frame', 'id'].includes(format)) return send(res, 400, { error: 'Invalid graphic format.' });
      const imageUrl = await uploadToCloudinary(image, format);
      const shareUrl = `${publicOrigin}/share?image=${encodeURIComponent(imageUrl)}`;
      return send(res, 200, { url: shareUrl });
    } catch (error) {
      return send(res, 500, { error: error instanceof Error ? error.message : 'Upload failed.' });
    }
  }

  if (req.method === 'GET' && requestUrl.pathname === '/share') {
    const imageUrl = requestUrl.searchParams.get('image') || '';
    const expectedPrefix = `https://res.cloudinary.com/${cloudName}/`;
    if (!imageUrl.startsWith(expectedPrefix)) return send(res, 400, { error: 'Invalid share image.' });
    const image = escapeHtml(imageUrl);
    const title = 'My HackerHouse Goa Builder ID';
    const description = 'Just built my HackerHouse Goa Builder ID. #FrameInGoa';
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(`<!doctype html><html><head><meta charset="utf-8"><meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:image" content="${image}"><meta property="og:image:secure_url" content="${image}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${title}"><meta name="twitter:description" content="${description}"><meta name="twitter:image" content="${image}"><title>${title}</title></head><body><img src="${image}" alt="${title}" style="max-width:100%;height:auto"></body></html>`);
  }

  send(res, 404, { error: 'Not found.' });
});

server.listen(port, () => console.log(`Share server listening on ${port}`));
