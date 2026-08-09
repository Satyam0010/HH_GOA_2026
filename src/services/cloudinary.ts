import { canvasToBlob } from '../utils/render';

interface UploadResponse {
  url?: unknown;
  error?: unknown;
}

export async function uploadGraphic(canvas: HTMLCanvasElement, format: 'frame' | 'id'): Promise<string> {
  const apiUrl = import.meta.env.VITE_SHARE_API_URL;
  if (!apiUrl) {
    throw new Error('Sharing is not configured. Set VITE_SHARE_API_URL.');
  }

  const blob = await canvasToBlob(canvas);
  const form = new FormData();
  form.append('file', blob, 'hackerhouse-goa-builder-id.png');
  form.append('format', format);

  let response: Response;
  try {
    response = await fetch(`${apiUrl.replace(/\/$/, '')}/upload`, {
      method: 'POST',
      body: form,
    });
  } catch {
    throw new Error('Could not reach the share server. Please try again shortly.');
  }

  const data = await response.json().catch(() => ({})) as UploadResponse;
  if (!response.ok || typeof data.url !== 'string') {
    throw new Error(typeof data.error === 'string' ? data.error : 'Could not upload your graphic.');
  }

  return data.url;
}
