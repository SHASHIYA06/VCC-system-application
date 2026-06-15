'use client';

import { useState, useEffect, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import { 
  ChevronLeft, ChevronRight, X, Download, Maximize2, 
  Search, ZoomIn, ZoomOut, Loader2, AlertCircle,
  RotateCw, FileText, Eye, ExternalLink
} from 'lucide-react';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface EnhancedPdfViewerProps {
  drawingNo: string;
  title?: string;
  sourceFile?: string;
  initialPage?: number;
  onClose?: () => void;
  inline?: boolean;
}

export default function EnhancedPdfViewer({ 
  drawingNo,
  title, 
  sourceFile,
  initialPage = 1, 
  onClose,
  inline = false
}: EnhancedPdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(initialPage);
  const [scale, setScale] = useState(1.0); // Default to 100% for accurate viewing
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [mappedPage, setMappedPage] = useState<number | null>(initialPage !== 1 ? initialPage : null);
  const [fitToWidth, setFitToWidth] = useState(true); // Auto-fit to screen width

  // Sync pageNumber when initialPage prop changes
  useEffect(() => {
    if (initialPage > 0) {
      setPageNumber(initialPage);
      setMappedPage(initialPage);
    }
  }, [initialPage]);

  // Fetch the correct PDF page mapping
  useEffect(() => {
    async function fetchMapping() {
      if (!drawingNo || !sourceFile) return;
      
      try {
        const res = await fetch(
          `/api/drawings/pdf-mapping?drawing_no=${encodeURIComponent(drawingNo)}&source_file=${encodeURIComponent(sourceFile)}`
        );
        
        if (res.ok) {
          const data = await res.json();
          if (data.pdfPageNo) {
            setMappedPage(data.pdfPageNo);
            setPageNumber(data.pdfPageNo);
          }
        }
      } catch (err) {
        console.error('Failed to fetch PDF mapping:', err);
      }
    }
    
    fetchMapping();
  }, [drawingNo, sourceFile]);

  // Set PDF URL and calculate responsive zoom
  useEffect(() => {
    if (sourceFile) {
      setPdfUrl(`/api/pdf/${encodeURIComponent(sourceFile)}`);
    }
    
    // Calculate optimal zoom based on screen width for better fit
    const calculateOptimalZoom = () => {
      const screenWidth = window.innerWidth;
      let optimalZoom = 1.0; // Default 100%
      
      if (screenWidth < 768) {
        optimalZoom = 0.6; // Mobile: 60%
      } else if (screenWidth < 1024) {
        optimalZoom = 0.8; // Tablet: 80%
      } else if (screenWidth < 1440) {
        optimalZoom = 1.0; // Laptop: 100%
      } else {
        optimalZoom = 1.0; // Desktop: 100% (user can zoom in manually)
      }
      
      if (fitToWidth) {
        setScale(optimalZoom);
      }
    };
    
    calculateOptimalZoom();
    window.addEventListener('resize', calculateOptimalZoom);
    
    return () => window.removeEventListener('resize', calculateOptimalZoom);
  }, [sourceFile, fitToWidth]);

  function onDocumentLoadSuccess({ numPages: n }: { numPages: number }) {
    setNumPages(n);
    if (mappedPage && mappedPage <= n) {
      setPageNumber(mappedPage);
    }
    setLoading(false);
    setError(null);
  }

  function onDocumentLoadError(err: Error) {
    console.error('PDF load error:', err);
    setError('Failed to load PDF. Please try again.');
    setLoading(false);
  }

  function prevPage() { 
    if (pageNumber > 1) setPageNumber(p => p - 1); 
  }
  
  function nextPage() { 
    if (pageNumber < numPages) setPageNumber(p => p + 1); 
  }

  function zoomIn() { 
    setScale(s => Math.min(s + 0.2, 3.0)); 
  }
  
  function zoomOut() { 
    setScale(s => Math.max(s - 0.2, 0.5)); 
  }
  
  function rotate() { 
    setRotation(r => (r + 90) % 360); 
  }

  const containerClass = inline
    ? 'w-full h-full bg-slate-950 flex flex-col relative rounded-xl overflow-hidden border border-slate-800'
    : 'fixed inset-0 z-[200] bg-black/95 backdrop-blur flex flex-col';

  if (!pdfUrl) {
    return (
      <div className={containerClass}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-amber-400 mx-auto mb-4" />
            <p className="text-slate-300 text-sm">No PDF source available</p>
            <p className="text-slate-500 text-xs mt-2">Drawing: {drawingNo}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-cyan-500/20 flex-shrink-0 shadow-lg">
        
        {/* Title Section */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {onClose && (
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-slate-700/50 rounded-lg transition-all hover:scale-105 active:scale-95"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          )}
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="h-5 w-5 text-cyan-400 flex-shrink-0" />
            <div className="min-w-0">
              <h3 className="text-white font-bold text-sm truncate">
                {drawingNo} {title && `- ${title}`}
              </h3>
              {mappedPage && (
                <p className="text-xs text-cyan-400 font-mono">
                  Mapped to Page {mappedPage}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700 px-3 py-2 rounded-lg flex-shrink-0">
          {/* Page Navigation */}
          <button 
            onClick={prevPage} 
            disabled={pageNumber <= 1}
            className="p-1.5 hover:bg-slate-700 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-110 active:scale-95"
          >
            <ChevronLeft className="h-4 w-4 text-white" />
          </button>
          
          <div className="flex items-center gap-1.5">
            <input
              type="number" 
              min={1} 
              max={numPages || 1} 
              value={pageNumber}
              onChange={e => { 
                const v = parseInt(e.target.value); 
                if (v > 0 && v <= numPages) setPageNumber(v); 
              }}
              className="w-12 px-2 py-1 bg-slate-900 border border-slate-600 rounded text-white text-center text-sm font-mono focus:border-cyan-500 focus:outline-none"
            />
            <span className="text-slate-400 text-sm font-mono">/ {numPages}</span>
          </div>
          
          <button 
            onClick={nextPage} 
            disabled={pageNumber >= numPages}
            className="p-1.5 hover:bg-slate-700 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-110 active:scale-95"
          >
            <ChevronRight className="h-4 w-4 text-white" />
          </button>

          <div className="w-px h-6 bg-slate-700 mx-1" />

          {/* Zoom Controls */}
          <button 
            onClick={zoomOut} 
            className="p-1.5 hover:bg-slate-700 rounded transition-all hover:scale-110 active:scale-95"
          >
            <ZoomOut className="h-4 w-4 text-white" />
          </button>
          
          <span className="text-white text-sm font-mono w-12 text-center">
            {Math.round(scale * 100)}%
          </span>
          
          <button 
            onClick={zoomIn} 
            className="p-1.5 hover:bg-slate-700 rounded transition-all hover:scale-110 active:scale-95"
          >
            <ZoomIn className="h-4 w-4 text-white" />
          </button>
          
          {/* Fit to Width Toggle */}
          <button 
            onClick={() => setFitToWidth(!fitToWidth)}
            title={fitToWidth ? "Manual Zoom" : "Fit to Width"}
            className={`p-1.5 rounded transition-all hover:scale-110 active:scale-95 ${
              fitToWidth ? 'bg-cyan-600 hover:bg-cyan-500' : 'hover:bg-slate-700'
            }`}
          >
            <Maximize2 className="h-4 w-4 text-white" />
          </button>

          <div className="w-px h-6 bg-slate-700 mx-1" />

          {/* Rotate */}
          <button 
            onClick={rotate} 
            title="Rotate 90°" 
            className="p-1.5 hover:bg-slate-700 rounded transition-all hover:scale-110 active:scale-95"
          >
            <RotateCw className="h-4 w-4 text-white" />
          </button>

          <div className="w-px h-6 bg-slate-700 mx-1" />

          {/* External Actions */}
          <a 
            href={pdfUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            title="Open in new tab"
            className="p-1.5 hover:bg-slate-700 rounded transition-all hover:scale-110 active:scale-95"
          >
            <ExternalLink className="h-4 w-4 text-white" />
          </a>
          
          <a 
            href={pdfUrl} 
            download 
            title="Download PDF"
            className="p-1.5 hover:bg-slate-700 rounded transition-all hover:scale-110 active:scale-95"
          >
            <Download className="h-4 w-4 text-white" />
          </a>
        </div>
      </div>

      {/* PDF Content */}
      <div className="flex-1 overflow-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-start justify-center p-6 min-h-0">
        {loading && (
          <div className="flex flex-col items-center justify-center h-full w-full">
            <Loader2 className="h-12 w-12 text-cyan-400 animate-spin mb-4" />
            <p className="text-slate-300 text-sm">Loading PDF document...</p>
            <p className="text-slate-500 text-xs mt-2">{sourceFile}</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center h-full">
            <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
            <p className="text-red-400 text-sm mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-semibold transition-all"
            >
              Retry
            </button>
          </div>
        )}

        {!error && (
          <div className={`${loading ? 'invisible' : 'visible'} shadow-2xl rounded-lg overflow-hidden border-2 border-cyan-500/20`}>
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
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
                onRenderSuccess={() => setLoading(false)}
                className="shadow-2xl"
              />
            </Document>
          </div>
        )}
      </div>

      {/* Footer Status Bar */}
      <div className="px-4 py-3 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-t border-cyan-500/20 flex items-center justify-between flex-shrink-0 shadow-lg">
        <div className="text-slate-400 text-sm flex items-center gap-4">
          <span className="flex items-center gap-2">
            <span className="text-cyan-400 font-mono font-bold">{drawingNo}</span>
            <span className="text-slate-600">•</span>
            <span>Page <span className="text-cyan-400 font-mono font-bold">{pageNumber}</span> of {numPages}</span>
          </span>
          {mappedPage && pageNumber === mappedPage && (
            <span className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 border border-green-500/20 rounded text-green-400 text-xs">
              <Eye className="h-3 w-3" />
              Correct Page
            </span>
          )}
        </div>
        <div className="text-slate-600 text-xs font-mono truncate max-w-xs">
          {sourceFile}
        </div>
      </div>
    </div>
  );
}
