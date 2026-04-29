import { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────────
// PDF viewer — iframe-based using the browser's native PDF
// renderer, with a custom toolbar overlay for consistent
// page navigation, zoom, fullscreen, download, and open-in-new-tab.
//
// Each schematic block is its own PDF (pageCount usually == 1),
// but multi-page PDFs still get prev/next + page input.
// ─────────────────────────────────────────────────────────────

export default function PdfViewer({
  pdfPath,
  page = 1,
  pageCount = 1,
  title = "Document",
  className = "",
}) {
  const [currentPage, setCurrentPage] = useState(page);
  const [zoom, setZoom] = useState(100); // percent
  const containerRef = useRef(null);

  useEffect(() => {
    setCurrentPage(page);
    setZoom(100);
  }, [pdfPath, page]);

  if (!pdfPath) {
    return (
      <div className={`flex flex-col items-center justify-center bg-gray-900/30 ${className}`}>
        <svg className="w-10 h-10 text-gray-700 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
        <p className="text-gray-600 text-sm font-medium">Under Development</p>
      </div>
    );
  }

  const showPager = pageCount > 1;

  // PDF URL fragment: page + zoom + suppress native toolbar/sidebar.
  // view=FitH gives proper fit-to-width on first load across browsers.
  const src = `${pdfPath}#page=${currentPage}&zoom=${zoom}&toolbar=0&navpanes=0&scrollbar=1&view=FitH`;

  const goPrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goNext = () => setCurrentPage((p) => Math.min(pageCount, p + 1));
  const zoomIn = () => setZoom((z) => Math.min(300, z + 25));
  const zoomOut = () => setZoom((z) => Math.max(50, z - 25));
  const resetZoom = () => setZoom(100);

  const openExternal = () =>
    window.open(pdfPath, "_blank", "noopener,noreferrer");

  const downloadPdf = () => {
    const a = document.createElement("a");
    a.href = pdfPath;
    a.download = pdfPath.split("/").pop();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const goFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen?.();
  };

  const btnBase =
    "h-7 px-2 inline-flex items-center justify-center gap-1 rounded-md text-[11px] font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed";
  const btnGhost = `${btnBase} text-gray-300 hover:bg-gray-700/60 hover:text-white`;
  const btnIcon = `${btnGhost} w-7 px-0`;

  return (
    <div ref={containerRef} className={`relative flex flex-col bg-gray-950 ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-2 px-2 sm:px-3 py-2 border-b border-gray-800/70 bg-gray-900/80 backdrop-blur-sm shrink-0">
        {/* Left: page navigation (only when pageCount > 1) */}
        <div className="flex items-center gap-1 min-h-[28px]">
          {showPager && (
            <>
              <button type="button" onClick={goPrev} disabled={currentPage <= 1} className={btnIcon} title="Previous page" aria-label="Previous page">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex items-center gap-1 px-2 h-7 rounded-md bg-gray-800/60 border border-gray-700/50">
                <input
                  type="number" min={1} max={pageCount} value={currentPage}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    if (!isNaN(v)) setCurrentPage(Math.min(pageCount, Math.max(1, v)));
                  }}
                  className="w-8 bg-transparent text-center text-[11px] font-mono text-gray-100 focus:outline-none"
                />
                <span className="text-[11px] font-mono text-gray-500">/ {pageCount}</span>
              </div>
              <button type="button" onClick={goNext} disabled={currentPage >= pageCount} className={btnIcon} title="Next page" aria-label="Next page">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Centre: title (hidden on small screens — toolbar room is tight) */}
        <div className="hidden md:block text-[11px] text-gray-500 font-medium truncate max-w-[40%]">
          {title}
        </div>

        {/* Right: zoom + external */}
        <div className="flex items-center gap-1">
          <button type="button" onClick={zoomOut} disabled={zoom <= 50} className={btnIcon} title="Zoom out" aria-label="Zoom out">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
            </svg>
          </button>
          <button type="button" onClick={resetZoom} className={`${btnGhost} font-mono w-12`} title="Reset zoom">
            {zoom}%
          </button>
          <button type="button" onClick={zoomIn} disabled={zoom >= 300} className={btnIcon} title="Zoom in" aria-label="Zoom in">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
            </svg>
          </button>

          <div className="w-px h-5 bg-gray-700/60 mx-1" />

          <button type="button" onClick={goFullscreen} className={btnIcon} title="Fullscreen" aria-label="Fullscreen">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4h4M16 4h4v4M4 16v4h4M20 16v4h-4" />
            </svg>
          </button>
          <button type="button" onClick={downloadPdf} className={btnIcon} title="Download" aria-label="Download PDF">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
            </svg>
          </button>
          <button type="button" onClick={openExternal} className={btnIcon} title="Open in new tab" aria-label="Open in new tab">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 3h7v7M21 3l-9 9M21 14v5a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h5" />
            </svg>
          </button>
        </div>
      </div>

      {/* PDF iframe */}
      <div className="relative flex-1 min-h-0 bg-gray-800">
        <iframe
          key={`${pdfPath}-${currentPage}-${zoom}`}
          src={src}
          title={title}
          className="absolute inset-0 w-full h-full border-0"
          style={{ colorScheme: "normal" }}
        />
      </div>
    </div>
  );
}
