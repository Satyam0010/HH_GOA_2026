interface CreateShareResponse {
  error?: unknown;
  shareId?: unknown;
  shareUrl?: unknown;
}

export interface ShareResult {
  shareId: string;
  shareUrl: string;
}

export async function createShare(imageUrl: string): Promise<ShareResult> {
  const response = await fetch("/api/share", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageUrl }),
  });
  const payload = (await response
    .json()
    .catch(() => ({}))) as CreateShareResponse;

  if (
    !response.ok ||
    typeof payload.shareId !== "string" ||
    typeof payload.shareUrl !== "string"
  ) {
    const message =
      typeof payload.error === "string"
        ? payload.error
        : "Could not create a share link.";
    throw new Error(message);
  }

  return {
    shareId: payload.shareId,
    shareUrl: payload.shareUrl,
  };
}
