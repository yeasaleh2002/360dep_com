/**
 * Image size/quality presets, shared by the browser encoder and the server validator.
 * WebP at ~0.82 gives a large size cut without visible artefacts on photographs;
 * logos keep more quality because flat colours and sharp edges show compression first.
 */
export const IMAGE_PRESETS = {
  photo: { maxEdge: 1920, quality: 0.82 },
  portrait: { maxEdge: 1200, quality: 0.84 },
  logo: { maxEdge: 800, quality: 0.9 },
} as const;

export type ImagePreset = keyof typeof IMAGE_PRESETS;
