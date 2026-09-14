import { supabase } from "@/integrations/supabase/client";

export const MAX_UPLOAD_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export const SUPPORTED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/heic",
  "image/heif",
];

export type ImageVariant = "hero" | "card" | "thumb";

interface VariantConfig {
  maxDimension: number;
  quality: number;
  fileName: string;
}

const OUTING_VARIANTS_CONFIG: Record<ImageVariant, VariantConfig> = {
  hero: { maxDimension: 1600, quality: 0.8, fileName: "hero.webp" },
  card: { maxDimension: 600, quality: 0.75, fileName: "card.webp" },
  thumb: { maxDimension: 300, quality: 0.7, fileName: "thumb.webp" },
};

/**
 * Validates user selected image file for format, size, and integrity.
 */
export function validateImageFile(
  file: File | null | undefined,
  maxSizeBytes: number = MAX_UPLOAD_FILE_SIZE_BYTES,
): { valid: boolean; error?: string } {
  if (!file || !(file instanceof File)) {
    return { valid: false, error: "Please select an image file." };
  }

  // Validate format
  const isMimeValid =
    file.type.startsWith("image/") ||
    SUPPORTED_IMAGE_MIME_TYPES.some((mime) => file.type.toLowerCase().includes(mime));

  if (!isMimeValid) {
    return {
      valid: false,
      error: "Unsupported format. Please select a valid image (JPG, PNG, WEBP, HEIC).",
    };
  }

  // Validate size
  if (file.size > maxSizeBytes) {
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    const maxMb = (maxSizeBytes / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      error: `Image is too large (${sizeInMb} MB). Maximum allowed size is ${maxMb} MB.`,
    };
  }

  if (file.size === 0) {
    return { valid: false, error: "The selected file is empty." };
  }

  return { valid: true };
}

/**
 * Calculates downscaled dimensions while strictly preventing upscaling.
 */
function calculateScaledDimensions(
  origWidth: number,
  origHeight: number,
  maxDimension: number,
): { width: number; height: number } {
  if (origWidth <= maxDimension && origHeight <= maxDimension) {
    return { width: origWidth, height: origHeight };
  }

  if (origWidth >= origHeight) {
    const width = maxDimension;
    const height = Math.max(1, Math.round((origHeight * maxDimension) / origWidth));
    return { width, height };
  }

  const height = maxDimension;
  const width = Math.max(1, Math.round((origWidth * maxDimension) / origHeight));
  return { width, height };
}

/**
 * Loads an image from a File into an HTMLImageElement safely.
 */
function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      if (img.naturalWidth === 0 || img.naturalHeight === 0) {
        reject(new Error("Image appears to be corrupted or empty."));
      } else {
        resolve(img);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load or decode image file."));
    };

    img.src = objectUrl;
  });
}

/**
 * Renders an image element to a canvas and outputs a compressed WebP (or fallback JPEG) Blob.
 */
function renderToCompressedBlob(
  img: HTMLImageElement,
  targetWidth: number,
  targetHeight: number,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) {
        reject(new Error("Could not access 2D canvas context."));
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Fill background with dark surface color in case of transparency
      ctx.fillStyle = "#0F3040";
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // Attempt WebP encoding first
      canvas.toBlob(
        (blob) => {
          if (blob && blob.size > 0) {
            resolve(blob);
          } else {
            // Fallback to JPEG if WebP blob generation fails
            canvas.toBlob(
              (fallbackBlob) => {
                if (fallbackBlob && fallbackBlob.size > 0) {
                  resolve(fallbackBlob);
                } else {
                  reject(new Error("Failed to compress image to Blob."));
                }
              },
              "image/jpeg",
              quality,
            );
          }
        },
        "image/webp",
        quality,
      );
    } catch (err) {
      reject(err);
    }
  });
}

export interface GeneratedImageVariants {
  hero: Blob;
  card: Blob;
  thumb: Blob;
  originalWidth: number;
  originalHeight: number;
}

/**
 * Generates all 3 WebP variants (Hero, Card, Thumb) from a single File.
 */
export async function createOutingImageVariants(file: File): Promise<GeneratedImageVariants> {
  const img = await loadImageElement(file);
  const origW = img.naturalWidth;
  const origH = img.naturalHeight;

  // 1. Hero variant
  const heroDim = calculateScaledDimensions(origW, origH, OUTING_VARIANTS_CONFIG.hero.maxDimension);
  const heroBlob = await renderToCompressedBlob(
    img,
    heroDim.width,
    heroDim.height,
    OUTING_VARIANTS_CONFIG.hero.quality,
  );

  // 2. Card variant
  const cardDim = calculateScaledDimensions(origW, origH, OUTING_VARIANTS_CONFIG.card.maxDimension);
  const cardBlob = await renderToCompressedBlob(
    img,
    cardDim.width,
    cardDim.height,
    OUTING_VARIANTS_CONFIG.card.quality,
  );

  // 3. Thumb variant
  const thumbDim = calculateScaledDimensions(
    origW,
    origH,
    OUTING_VARIANTS_CONFIG.thumb.maxDimension,
  );
  const thumbBlob = await renderToCompressedBlob(
    img,
    thumbDim.width,
    thumbDim.height,
    OUTING_VARIANTS_CONFIG.thumb.quality,
  );

  return {
    hero: heroBlob,
    card: cardBlob,
    thumb: thumbBlob,
    originalWidth: origW,
    originalHeight: origH,
  };
}

/**
 * Uploads all 3 outing image variants to Supabase Storage in parallel.
 * Returns the canonical card URL reference.
 */
export async function uploadOptimizedOutingImages(
  file: File,
  outingId: string = crypto.randomUUID(),
): Promise<{
  canonicalUrl: string;
  heroUrl: string;
  cardUrl: string;
  thumbUrl: string;
}> {
  const variants = await createOutingImageVariants(file);
  const folder = `outings/${outingId}`;

  // Upload hero, card, and thumb in parallel
  const [heroRes, cardRes, thumbRes] = await Promise.all([
    supabase.storage.from("outing-image").upload(`${folder}/hero.webp`, variants.hero, {
      contentType: "image/webp",
      upsert: true,
    }),
    supabase.storage.from("outing-image").upload(`${folder}/card.webp`, variants.card, {
      contentType: "image/webp",
      upsert: true,
    }),
    supabase.storage.from("outing-image").upload(`${folder}/thumb.webp`, variants.thumb, {
      contentType: "image/webp",
      upsert: true,
    }),
  ]);

  if (heroRes.error) throw heroRes.error;
  if (cardRes.error) throw cardRes.error;
  if (thumbRes.error) throw thumbRes.error;

  const cardPublicUrl = supabase.storage.from("outing-image").getPublicUrl(`${folder}/card.webp`)
    .data.publicUrl;
  const heroPublicUrl = supabase.storage.from("outing-image").getPublicUrl(`${folder}/hero.webp`)
    .data.publicUrl;
  const thumbPublicUrl = supabase.storage.from("outing-image").getPublicUrl(`${folder}/thumb.webp`)
    .data.publicUrl;

  return {
    canonicalUrl: cardPublicUrl,
    heroUrl: heroPublicUrl,
    cardUrl: cardPublicUrl,
    thumbUrl: thumbPublicUrl,
  };
}

/**
 * Generates and uploads optimized avatar variants (avatar.webp, thumb.webp).
 */
export async function uploadOptimizedAvatar(
  file: File,
  userId: string = crypto.randomUUID(),
): Promise<string> {
  const img = await loadImageElement(file);
  const origW = img.naturalWidth;
  const origH = img.naturalHeight;

  // Avatar (400px) and Thumb (150px)
  const avatarDim = calculateScaledDimensions(origW, origH, 400);
  const avatarBlob = await renderToCompressedBlob(img, avatarDim.width, avatarDim.height, 0.75);

  const thumbDim = calculateScaledDimensions(origW, origH, 150);
  const thumbBlob = await renderToCompressedBlob(img, thumbDim.width, thumbDim.height, 0.7);

  const folder = `avatars/${userId}`;

  const [avatarRes, thumbRes] = await Promise.all([
    supabase.storage.from("outing-image").upload(`${folder}/avatar.webp`, avatarBlob, {
      contentType: "image/webp",
      upsert: true,
    }),
    supabase.storage.from("outing-image").upload(`${folder}/thumb.webp`, thumbBlob, {
      contentType: "image/webp",
      upsert: true,
    }),
  ]);

  if (avatarRes.error) throw avatarRes.error;
  if (thumbRes.error) throw thumbRes.error;

  return supabase.storage.from("outing-image").getPublicUrl(`${folder}/avatar.webp`).data.publicUrl;
}

/**
 * Optimizes chat image attachment before upload.
 */
export async function uploadOptimizedChatImage(file: File): Promise<string> {
  const img = await loadImageElement(file);
  const origW = img.naturalWidth;
  const origH = img.naturalHeight;

  const cardDim = calculateScaledDimensions(origW, origH, 800);
  const cardBlob = await renderToCompressedBlob(img, cardDim.width, cardDim.height, 0.75);

  const fileName = `chats/${crypto.randomUUID()}.webp`;
  const { error } = await supabase.storage.from("outing-image").upload(fileName, cardBlob, {
    contentType: "image/webp",
    upsert: true,
  });

  if (error) throw error;

  return supabase.storage.from("outing-image").getPublicUrl(fileName).data.publicUrl;
}

/**
 * Resolves the optimal URL variant for any image URL (OutSy Storage, Unsplash, or Legacy).
 * Automatically delivers hero, card, or thumb without breaking existing images.
 */
export function getOptimizedImageUrl(
  url: string | null | undefined,
  variant: ImageVariant = "card",
): string {
  if (!url || typeof url !== "string") {
    return "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop&q=80";
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop&q=80";
  }

  // 1. Handle OutSy multi-variant storage paths (/outings/{id}/card.webp, etc.)
  if (trimmed.includes("/outings/")) {
    if (variant === "hero") {
      return trimmed.replace(/\/(card|thumb|hero)\.webp$/, "/hero.webp");
    }
    if (variant === "thumb") {
      return trimmed.replace(/\/(card|thumb|hero)\.webp$/, "/thumb.webp");
    }
    return trimmed.replace(/\/(card|thumb|hero)\.webp$/, "/card.webp");
  }

  // 2. Handle OutSy avatar storage paths (/avatars/{id}/avatar.webp, etc.)
  if (trimmed.includes("/avatars/")) {
    if (variant === "thumb") {
      return trimmed.replace(/\/(avatar|thumb)\.webp$/, "/thumb.webp");
    }
    return trimmed.replace(/\/(avatar|thumb)\.webp$/, "/avatar.webp");
  }

  // 3. Handle Unsplash image URLs
  if (trimmed.includes("images.unsplash.com")) {
    const widthParam = variant === "hero" ? "w=1600" : variant === "thumb" ? "w=300" : "w=600";
    const qualityParam = variant === "hero" ? "q=80" : variant === "thumb" ? "q=70" : "q=75";

    // If URL already has query parameters, adjust w & q
    try {
      const parsed = new URL(trimmed);
      parsed.searchParams.set(
        "w",
        variant === "hero" ? "1600" : variant === "thumb" ? "300" : "600",
      );
      parsed.searchParams.set("auto", "format");
      parsed.searchParams.set("fit", "crop");
      parsed.searchParams.set("q", variant === "hero" ? "80" : variant === "thumb" ? "70" : "75");
      return parsed.toString();
    } catch {
      // Fallback regex replacement if URL parsing fails
      return trimmed.replace(/w=\d+/, widthParam).replace(/q=\d+/, qualityParam);
    }
  }

  // 4. Legacy URLs (or external image links) - return directly
  return trimmed;
}
