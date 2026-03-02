import { useState, useEffect, useRef } from "react";
import { gerberToTexture } from "../utils/gerberToTexture";

/**
 * React hook that asynchronously converts Gerber files into
 * Three.js CanvasTextures for the top and bottom board faces.
 *
 * Returns `{ textures, loading, error }`.
 * `textures` is `null` until ready, then `{ top?, bottom? }`.
 *
 * When `gerberFiles` is empty or undefined the hook short-circuits
 * and returns null textures — existing plain-material behaviour
 * is preserved.
 */
export function useGerberTexture(gerberFiles) {
  const [textures, setTextures] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const cancelledRef = useRef(false);

  // Stable dependency key — avoids re-running on every render
  // when the array reference changes but contents are identical.
  const filesKey = gerberFiles?.length ? gerberFiles.join(",") : "";

  useEffect(() => {
    if (!filesKey) {
      setTextures(null);
      setLoading(false);
      setError(null);
      return;
    }

    cancelledRef.current = false;
    setLoading(true);
    setError(null);

    gerberToTexture(gerberFiles)
      .then((result) => {
        if (!cancelledRef.current) {
          setTextures(result);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelledRef.current) {
          console.error("Gerber texture generation failed:", err);
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      cancelledRef.current = true;
    };
  }, [filesKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return { textures, loading, error };
}
