// ─────────────────────────────────────────────────────────────
// Gerber → Three.js CanvasTexture
//
// Runs the same @tracespace/core pipeline as GerberViewer but
// renders to an off-screen canvas instead of an SVG string so
// the result can be used as a Three.js material texture.
// ─────────────────────────────────────────────────────────────
import {
  read,
  plot,
  renderLayers,
  renderBoard,
  stringifySvg,
} from "@tracespace/core";
import * as THREE from "three";

const textureCache = new Map();

/**
 * Convert an array of Gerber file paths into top/bottom
 * THREE.CanvasTexture objects.
 *
 * @param {string[]} gerberFiles – public paths, e.g. ["/gerbers/central-brake/CENTBRAKE.GTL", …]
 * @param {{ resolution?: number }} options
 * @returns {Promise<{ top?: THREE.CanvasTexture, bottom?: THREE.CanvasTexture }>}
 */
export async function gerberToTexture(gerberFiles, options = {}) {
  const { resolution = 4096 } = options;

  // ── cache check ─────────────────────────────────────────
  const cacheKey = [...gerberFiles].sort().join("|");
  if (textureCache.has(cacheKey)) return textureCache.get(cacheKey);

  // ── 1. fetch files & run tracespace pipeline ────────────
  const fileObjects = await Promise.all(
    gerberFiles.map(async (filePath) => {
      const response = await fetch(filePath);
      if (!response.ok) throw new Error(`Failed to load ${filePath}`);
      const blob = await response.blob();
      let filename = filePath.split("/").pop();

      // Rename .GM1 → .GKO so @tracespace identifies it as the
      // board outline layer.  Without this, the SVG viewBox won't
      // be clipped to the board boundary and the texture misaligns.
      if (/\.GM1$/i.test(filename)) {
        filename = filename.replace(/\.GM1$/i, ".GKO");
      }

      return new File([blob], filename);
    }),
  );

  const readResult = await read(fileObjects);
  const plotResult = plot(readResult);
  const layersResult = renderLayers(plotResult);
  const boardResult = renderBoard(layersResult);

  // ── 2. convert each side SVG → Canvas → CanvasTexture ───
  const result = {};

  for (const side of ["top", "bottom"]) {
    const svgElement = boardResult[side];
    if (!svgElement) continue;

    const svgString = stringifySvg(svgElement);
    const canvas = await svgToCanvas(svgString, resolution);

    const texture = new THREE.CanvasTexture(canvas);
    texture.flipY = false;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 16; // sharper at oblique viewing angles
    texture.needsUpdate = true;

    result[side] = texture;
  }

  textureCache.set(cacheKey, result);
  return result;
}

// ─────────────────────────────────────────────────────────────
// SVG string → off-screen Canvas at the given resolution.
// Uses the SVG viewBox to preserve aspect ratio.
// ─────────────────────────────────────────────────────────────
function svgToCanvas(svgString, resolution) {
  return new Promise((resolve, reject) => {
    // Extract viewBox for correct aspect ratio
    const vbMatch = svgString.match(/viewBox="([^"]+)"/);
    const [, , vbW, vbH] = vbMatch
      ? vbMatch[1].split(/[\s,]+/).map(Number)
      : [0, 0, 1, 1];

    const aspect = vbW / vbH;
    const canvasW =
      aspect >= 1 ? resolution : Math.round(resolution * aspect);
    const canvasH =
      aspect >= 1 ? Math.round(resolution / aspect) : resolution;

    const canvas = document.createElement("canvas");
    canvas.width = canvasW;
    canvas.height = canvasH;
    const ctx = canvas.getContext("2d");

    const img = new Image();
    const blob = new Blob([svgString], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvasW, canvasH);
      URL.revokeObjectURL(url);
      resolve(canvas);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to render Gerber SVG to canvas"));
    };

    img.src = url;
  });
}
