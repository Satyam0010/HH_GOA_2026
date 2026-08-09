import { canvasToBlob } from '../utils/render';

interface UploadResponse {
  url: string;
}

export async function uploadGraphic(canvas: HTMLCanvasElement, format: 'frame' | 'id'): Promise<string> {
  const blob = await canvasToBlob(canvas);
  const image = await blobToDataUrl(blob);
  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-graphic`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ image, format }),
  });
  const result = await response.json() as Partial<UploadResponse> & { error?: string };
  if (!response.ok || typeof result.url !== 'string') throw new Error(result.error || 'Image sharing is temporarily unavailable.');
  return result.url;
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Could not prepare image.'));
    reader.onerror = () => reject(new Error('Could not prepare image.'));
    reader.readAsDataURL(blob);
  });
}
