import { useState, useEffect, useRef } from "react";
import { read, plot, renderLayers, renderBoard, stringifySvg } from "@tracespace/core";

export default function GerberViewer({ gerberFiles, side = "top", className = "" }) {
  const [svgContent, setSvgContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);
  const cacheRef = useRef({});

  useEffect(() => {
    if (!gerberFiles || gerberFiles.length === 0) {
      setLoading(false);
      setError("No Gerber files provided");
      return;
    }

    const cacheKey = gerberFiles.join(",");

    async function renderGerbers() {
      setLoading(true);
      setError(null);

      try {
        let boardResult = cacheRef.current[cacheKey];

        if (!boardResult) {
          const fileObjects = await Promise.all(
            gerberFiles.map(async (filePath) => {
              const response = await fetch(filePath);
              if (!response.ok) throw new Error(`Failed to load ${filePath}`);
              const blob = await response.blob();
              let filename = filePath.split("/").pop();

              // Rename .GM1 → .GKO so @tracespace treats it as board outline
              if (/\.GM1$/i.test(filename)) {
                filename = filename.replace(/\.GM1$/i, ".GKO");
              }

              return new File([blob], filename);
            })
          );

          const readResult = await read(fileObjects);
          const plotResult = plot(readResult);
          const layersResult = renderLayers(plotResult);
          boardResult = renderBoard(layersResult);
          cacheRef.current[cacheKey] = boardResult;
        }

        const svgElement = side === "bottom" ? boardResult.bottom : boardResult.top;
        if (svgElement) {
          setSvgContent(stringifySvg(svgElement));
        } else {
          setError(`No ${side} view available`);
        }
      } catch (err) {
        console.error("Gerber render error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    renderGerbers();
  }, [gerberFiles, side]);

  if (loading) {
    return (
      <div className={`flex flex-col items-center justify-center bg-gray-900 rounded-xl ${className}`}>
        <div className="w-8 h-8 border-2 border-gray-600 border-t-gray-300 rounded-full animate-spin" />
        <p className="mt-3 text-sm text-gray-500">Rendering Gerber files...</p>
      </div>
    );
  }

  if (error || !svgContent) {
    return (
      <div className={`flex flex-col items-center justify-center bg-gray-900 rounded-xl border-2 border-dashed border-gray-700 ${className}`}>
        <svg className="w-12 h-12 text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />
        </svg>
        <p className="text-gray-500 font-medium">PCB {side === "top" ? "Top" : "Bottom"} Layer</p>
        <p className="text-gray-600 text-sm mt-1">
          {error || "Add Gerber files to view the PCB layout"}
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`bg-gray-900 rounded-xl overflow-hidden flex items-center justify-center ${className}`}
      style={{ lineHeight: 0 }}
    >
      {/* Inject the SVG and force it to fill the container while preserving aspect ratio */}
      <div
        className="w-full h-full"
        style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
        dangerouslySetInnerHTML={{
          __html: svgContent.replace(
            /<svg /,
            '<svg style="max-width:100%;max-height:100%;width:auto;height:auto;" '
          ),
        }}
      />
    </div>
  );
}
