'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import { 
  ChevronLeft, ChevronRight, X, Download, Maximize2, 
  Search, ZoomIn, ZoomOut, Loader2, AlertCircle, Eye,
  RotateCw
} from 'lucide-react';

// Configure PDF.js worker — CDN to avoid bundling the large worker file
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerEnhancedProps {
  src: string;
  initialPage?: number;
  title?: string;
  searchQuery?: string;
  onClose?: () => void;
  inline?: boolean;
}

export default function PdfViewerEnhanced({ 
  src, 
  initialPage = 1, 
  title, 
  searchQuery: initialSearchQuery = '',
  onClose,
  inline = false
}: PdfViewerEnhancedProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(initialPage);
  const [scale, setScale] = useState(1.2);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [searchResults, setSearchResults] = useState<number[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  const [useIframe, setUseIframe] = useState(false);
  const [activeHighlight, setActiveHighlight] = useState('');
  const [rotation, setRotation] = useState(0);

  useEffect(() => { setPageNumber(initialPage); }, [initialPage]);

  useEffect(() => {
    if (initialSearchQuery && pdfDocument) {
      setSearchQuery(initialSearchQuery);
      setActiveHighlight(initialSearchQuery);
      performSearch(initialSearchQuery);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSearchQuery, pdfDocument]);

  function onDocumentLoadSuccess({ numPages: n }: { numPages: number }) {
    setNumPages(n);
    setPageNumber(initialPage);
    setLoading(false);
    setError(null);
  }

  function onDocumentLoadError(err: Error) {
    console.error('PDF canvas load error — switching to iframe:', err.message);
    setUseIframe(true);
    setLoading(false);
    setError(null);
  }

  // ─── OCR-style text highlighting ─────────────────────────────────────────
  const customTextRenderer = useCallback(({ str }: { str: string }) => {
    if (!activeHighlight.trim()) return str;
    
    // Extract base number (e.g. 3001 from 3001A or 3001/1)
    const baseMatch = activeHighlight.match(/(\d{3,5})/);
    const base = baseMatch ? baseMatch[1] : activeHighlight.trim();
    
    const escaped = base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    if (!regex.test(str)) return str;
    return str.replace(
      new RegExp(`(${escaped})`, 'gi'),
      '<mark style="background:#facc15;color:#000;border-radius:2px;padding:0 2px;">$1</mark>'
    );
  }, [activeHighlight]);

  // ─── Search through all PDF pages ────────────────────────────────────────
  async function performSearch(query: string) {
    if (!query.trim() || !pdfDocument) return;
    setIsSearching(true);
    setSearchResults([]);
    setCurrentSearchIndex(0);

    try {
      const results: number[] = [];

      // 1. Try backend PDF page mapping API first (fast)
      try {
        const sourceFile = decodeURIComponent(src.split('/').pop() || '');
        const res = await fetch(`/api/drawings/pdf-mapping?drawing_no=${encodeURIComponent(query)}&source_file=${encodeURIComponent(sourceFile)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.pdfPageNo && data.pdfPageNo > 0 && data.pdfPageNo <= numPages) {
            results.push(data.pdfPageNo);
          }
        }
      } catch { /* fallback */ }

      // 2. Full text scan of every page (OCR-style)
      if (results.length === 0) {
        const qNormalized = query.toLowerCase().replace(/[\/\-\s]/g, '');
        for (let i = 1; i <= numPages; i++) {
          const page = await pdfDocument.getPage(i);
          const tc = await page.getTextContent();
          const text = tc.items.map((it: any) => it.str).join('').toLowerCase().replace(/[\/\-\s]/g, '');
          if (text.includes(qNormalized)) results.push(i);
        }
      }

      setSearchResults(results);
      if (results.length > 0) {
        setPageNumber(results[0]);
        setCurrentSearchIndex(0);
        setActiveHighlight(query); // trigger yellow highlights
      } else {
        setActiveHighlight('');
      }
    } catch (err) {
      console.error('PDF search error:', err);
    } finally {
      setIsSearching(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) performSearch(searchQuery);
  }

  function clearSearch() {
    setSearchQuery('');
    setActiveHighlight('');
    setSearchResults([]);
    setCurrentSearchIndex(0);
  }

  function prevPage() { if (pageNumber > 1) setPageNumber(p => p - 1); }
  function nextPage() { if (pageNumber < numPages) setPageNumber(p => p + 1); }

  function prevResult() {
    if (!searchResults.length) return;
    const idx = currentSearchIndex > 0 ? currentSearchIndex - 1 : searchResults.length - 1;
    setCurrentSearchIndex(idx);
    setPageNumber(searchResults[idx]);
  }
  function nextResult() {
    if (!searchResults.length) return;
    const idx = currentSearchIndex < searchResults.length - 1 ? currentSearchIndex + 1 : 0;
    setCurrentSearchIndex(idx);
    setPageNumber(searchResults[idx]);
  }

  function zoomIn() { setScale(s => Math.min(s + 0.25, 4.0)); }
  function zoomOut() { setScale(s => Math.max(s - 0.25, 0.4)); }
  function rotate() { setRotation(r => (r + 90) % 360); }

  const containerClass = inline
    ? 'w-full h-full bg-slate-950 flex flex-col relative'
    : 'fixed inset-0 z-[200] bg-black/95 backdrop-blur flex flex-col';

  return (
    <div className={containerClass}>
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-900 border-b border-slate-700/80 flex-shrink-0">
        
        {/* Title + close */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {onClose && (
            <button onClick={onClose} className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0">
              <X className="h-4 w-4 text-white" />
            </button>
          )}
          <h3 className="text-white font-semibold text-sm truncate">{title || 'PDF Viewer'}</h3>
        </div>

        {/* OCR Search bar */}
        <form onSubmit={handleSearch} className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 px-2.5 py-1.5 rounded-lg flex-shrink-0">
          <Search className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search text (OCR highlight)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="bg-transparent outline-none text-white text-xs w-52 placeholder-slate-500"
          />
          {isSearching && <Loader2 className="h-3.5 w-3.5 text-cyan-400 animate-spin flex-shrink-0" />}
          {activeHighlight && !isSearching && (
            <span className="text-[10px] text-amber-400 font-mono flex-shrink-0">
              {searchResults.length} pg
            </span>
          )}
          {searchResults.length > 0 && (
            <div className="flex items-center gap-0.5 ml-1 pl-1.5 border-l border-slate-600">
              <button type="button" onClick={prevResult} className="p-0.5 hover:bg-slate-700 rounded">
                <ChevronLeft className="h-3.5 w-3.5 text-white" />
              </button>
              <span className="text-[10px] text-slate-400 font-mono w-8 text-center">
                {currentSearchIndex + 1}/{searchResults.length}
              </span>
              <button type="button" onClick={nextResult} className="p-0.5 hover:bg-slate-700 rounded">
                <ChevronRight className="h-3.5 w-3.5 text-white" />
              </button>
            </div>
          )}
          {searchQuery && (
            <button type="button" onClick={clearSearch} className="ml-1 text-slate-500 hover:text-white">
              <X className="h-3 w-3" />
            </button>
          )}
        </form>

        {/* Controls */}
        <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 px-2 py-1.5 rounded-lg flex-shrink-0">
          {/* Page nav */}
          <button onClick={prevPage} disabled={pageNumber <= 1}
            className="p-1 hover:bg-slate-700 rounded disabled:opacity-30 transition-colors">
            <ChevronLeft className="h-4 w-4 text-white" />
          </button>
          <div className="flex items-center gap-1">
            <input
              type="number" min={1} max={numPages || 1} value={pageNumber}
              onChange={e => { const v = parseInt(e.target.value); if (v > 0 && v <= numPages) setPageNumber(v); }}
              className="w-10 px-1 py-0.5 bg-slate-900 border border-slate-600 rounded text-white text-center text-xs font-mono"
            />
            <span className="text-slate-500 text-xs">/ {numPages}</span>
          </div>
          <button onClick={nextPage} disabled={pageNumber >= numPages}
            className="p-1 hover:bg-slate-700 rounded disabled:opacity-30 transition-colors">
            <ChevronRight className="h-4 w-4 text-white" />
          </button>

          <div className="w-px h-5 bg-slate-700 mx-1" />

          {/* Zoom */}
          <button onClick={zoomOut} className="p-1 hover:bg-slate-700 rounded transition-colors">
            <ZoomOut className="h-4 w-4 text-white" />
          </button>
          <span className="text-white text-xs font-mono w-10 text-center">{Math.round(scale * 100)}%</span>
          <button onClick={zoomIn} className="p-1 hover:bg-slate-700 rounded transition-colors">
            <ZoomIn className="h-4 w-4 text-white" />
          </button>

          <div className="w-px h-5 bg-slate-700 mx-1" />

          {/* Rotate */}
          <button onClick={rotate} title="Rotate 90°" className="p-1 hover:bg-slate-700 rounded transition-colors">
            <RotateCw className="h-4 w-4 text-white" />
          </button>

          {/* Toggle viewer mode */}
          <button
            onClick={() => { setUseIframe(!useIframe); setLoading(true); }}
            title="Toggle browser/canvas viewer"
            className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
              useIframe ? 'bg-amber-500/25 text-amber-400 border border-amber-500/30' : 'bg-slate-700 text-slate-300'
            }`}
          >
            {useIframe ? 'Canvas' : 'Browser'}
          </button>

          <div className="w-px h-5 bg-slate-700 mx-1" />

          {/* Download / open */}
          <a href={src} target="_blank" rel="noopener noreferrer" title="Open in new tab"
            className="p-1 hover:bg-slate-700 rounded transition-colors">
            <Maximize2 className="h-4 w-4 text-white" />
          </a>
          <a href={src} download title="Download PDF"
            className="p-1 hover:bg-slate-700 rounded transition-colors">
            <Download className="h-4 w-4 text-white" />
          </a>
        </div>
      </div>

      {/* ─── PDF Content ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto bg-slate-800 flex items-start justify-center p-4 min-h-0">
        {loading && (
          <div className="flex flex-col items-center justify-center h-full w-full">
            <Loader2 className="h-12 w-12 text-cyan-400 animate-spin mb-4" />
            <p className="text-slate-300 text-sm">Loading PDF document...</p>
          </div>
        )}

        {error && !useIframe && (
          <div className="flex flex-col items-center justify-center h-full">
            <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
            <p className="text-red-400 text-sm mb-4">{error}</p>
            <button onClick={() => { setUseIframe(true); setLoading(false); }}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-semibold">
              Open in Browser Viewer
            </button>
          </div>
        )}

        {useIframe ? (
          <iframe
            key={`${src}-${pageNumber}`}
            src={`${src}#page=${pageNumber}`}
            className="w-full h-full border-0 rounded-lg bg-white shadow-2xl min-h-[600px]"
            title={title || 'PDF'}
            onLoad={() => setLoading(false)}
            onError={() => setError('Failed to load PDF in browser viewer')}
          />
        ) : (
          !error && (
            <div className={`${loading ? 'invisible' : 'visible'} shadow-2xl`}>
              <Document
                file={src}
                onLoadSuccess={({ numPages: n, ...pdf }) => {
                  onDocumentLoadSuccess({ numPages: n });
                  setPdfDocument(pdf);
                }}
                onLoadError={onDocumentLoadError}
                loading={null}
                error={null}
              >
                <Page
                  key={`${pageNumber}-${scale}-${rotation}`}
                  pageNumber={pageNumber}
                  scale={scale}
                  rotate={rotation}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  loading={null}
                  // Yellow OCR-style highlight via customTextRenderer
                  customTextRenderer={activeHighlight ? customTextRenderer : undefined}
                  onRenderSuccess={() => setLoading(false)}
                />
              </Document>
            </div>
          )
        )}
      </div>

      {/* ─── Footer status bar ───────────────────────────────────────────── */}
      <div className="px-4 py-2 bg-slate-900 border-t border-slate-700 flex items-center justify-between flex-shrink-0">
        <div className="text-slate-400 text-xs">
          {activeHighlight && searchResults.length > 0 ? (
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-sm bg-yellow-400" />
              <span>OCR found <span className="text-yellow-400 font-bold">{searchResults.length}</span> page(s) with "<span className="text-white font-mono">{activeHighlight}</span>"</span>
            </span>
          ) : activeHighlight && !isSearching ? (
            <span className="text-amber-400">No OCR match for "{activeHighlight}" — try broader terms</span>
          ) : (
            <span>Page <span className="text-cyan-400 font-mono font-bold">{pageNumber}</span> of {numPages} · {Math.round(scale * 100)}% zoom</span>
          )}
        </div>
        <div className="text-slate-600 text-[10px] font-mono truncate max-w-xs">{src.split('/').pop()}</div>
      </div>
    </div>
  );
}
