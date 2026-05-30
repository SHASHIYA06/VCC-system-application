'use client';

import { useState, useEffect, use } from 'react';
import { 
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, 
  X, Loader2, FileText, Maximize2, Eye
} from 'lucide-react';

interface PdfViewerProps {
  src: string;
  initialPage?: number;
  title?: string;
  onClose?: () => void;
  /**
   * The page number where the requested drawing starts. If omitted the
   * component will default to {@link initialPage}. This is used by the
   * drawing list page to jump directly to the correct page inside a large
   * OCR PDF.
   */
  startPage?: number;
  /**
   * When true the viewer should ignore {@link startPage} and simply display
   * the schematic PDF. The schematic is a separate file that contains only
   * the schematic view of the drawing.
   */
  isSchematic?: boolean;
}

export default function PdfViewer({ src, initialPage = 1, title, onClose, startPage, isSchematic = false }: PdfViewerProps) {
  const [page, setPage] = useState(startPage ?? initialPage);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState<number | null>(null);

  const pdfUrl = `${src}#page=${page}`;

  // Reset to the start page whenever the source changes
  useEffect(() => {
    setPage(startPage ?? initialPage);
    setLoading(true);
  }, [src, startPage, initialPage]);

  // Load the PDF once to determine the total number of pages
  useEffect(() => {
    const loadPdf = async () => {
      try {
        const pdf = await import('pdfjs-dist/legacy/build/pdf').then(m => m.getDocument(src).promise);
        setTotalPages(pdf.numPages);
      } catch {
        // If pdfjs fails we simply leave totalPages null
      } finally {
        setLoading(false);
      }
    };
    loadPdf();
  }, [src]);

  function goToPrevPage() {
    if (page > 1) setPage(page - 1);
  }

  function goToNextPage() {
    if (totalPages && page < totalPages) setPage(page + 1);
  }

  function handlePageInput(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      const value = parseInt((e.target as HTMLInputElement).value);
      if (value > 0) setPage(value);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-700">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <X className="h-5 w-5 text-white" />
          </button>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-cyan-400" />
            <h3 className="text-white font-medium truncate max-w-md">{title || 'PDF Viewer'}</h3>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-slate-800 px-4 py-2 rounded-lg">
          <button onClick={goToPrevPage} disabled={page <= 1}
            className="p-1.5 hover:bg-slate-700 rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            <ChevronLeft className="h-5 w-5 text-white" />
          </button>
          
          <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={totalPages ?? undefined}
            value={page}
            onChange={(e) => setPage(Math.max(1, Math.min(totalPages ?? Infinity, parseInt(e.target.value) || 1)))}
            onKeyDown={handlePageInput}
            className="w-14 px-2 py-1 bg-slate-900 border border-slate-600 rounded text-white text-center text-sm font-mono"
          />
            <span className="text-slate-400 text-sm">page</span>
          </div>
          
          <button onClick={goToNextPage}
            className="p-1.5 hover:bg-slate-700 rounded transition-colors">
            <ChevronRight className="h-5 w-5 text-white" />
          </button>
          
          <div className="w-px h-6 bg-slate-700 mx-2" />
          
          <a href={src} target="_blank" rel="noopener noreferrer" 
            className="p-1.5 hover:bg-slate-700 rounded transition-colors"
            title="Open in new tab">
            <Maximize2 className="h-5 w-5 text-white" />
          </a>
          
          <a href={src} download
            className="p-1.5 hover:bg-slate-700 rounded transition-colors"
            title="Download PDF">
            <Download className="h-5 w-5 text-white" />
          </a>
        </div>
      </div>
      
      <div className="flex-1 bg-slate-800 overflow-hidden">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-12 w-12 text-cyan-400 animate-spin" />
          </div>
        )}
        
        <iframe
          src={pdfUrl}
          className="w-full h-full border-0"
          title={`PDF: ${title || src}`}
          onLoad={() => setLoading(false)}
        />
      </div>
      
      <div className="px-4 py-2 bg-slate-900 border-t border-slate-700 flex items-center justify-between">
        <div className="text-slate-400 text-sm">
          Showing page <span className="text-cyan-400 font-mono font-bold">{page}</span>
        </div>
        <div className="text-slate-500 text-xs">
          Use arrow keys to navigate • Page numbers supported in most browsers
        </div>
      </div>
    </div>
  );
}
