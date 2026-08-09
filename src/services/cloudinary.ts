import { canvasToBlob } from '../utils/render';

interface CloudinaryResponse {
  secure_url?: unknown;
  error?: { message?: unknown };
}

export async function uploadGraphic(
  canvas: HTMLCanvasElement,
  _format: 'frame' | 'id',
): Promise<string> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary sharing is not configured.');
  }

  const blob = await canvasToBlob(canvas);
  const formData = new FormData();
  formData.append('file', blob, 'hackerhouse-goa.png');
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', 'hh-goa');

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`,
    { method: 'POST', body: formData },
  );
  const data = await response.json().catch(() => ({})) as CloudinaryResponse;

  if (!response.ok || typeof data.secure_url !== 'string') {
    const message = typeof data.error?.message === 'string'
      ? data.error.message
      : 'Cloudinary upload failed.';
    throw new Error(message);
  }

  return data.secure_url;
}
