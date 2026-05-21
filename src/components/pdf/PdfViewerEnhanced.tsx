'use client';

import { useState, useEffect, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { 
  ChevronLeft, ChevronRight, X, Download, Maximize2, 
  Search, ZoomIn, ZoomOut, Loader2, AlertCircle 
} from 'lucide-react';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PdfViewerEnhancedProps {
  src: string;
  initialPage?: number;
  title?: string;
  searchQuery?: string;
  onClose?: () => void;
}

export default function PdfViewerEnhanced({ 
  src, 
  initialPage = 1, 
  title, 
  searchQuery: initialSearchQuery = '',
  onClose 
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

  useEffect(() => {
    setPageNumber(initialPage);
  }, [initialPage]);

  useEffect(() => {
    if (initialSearchQuery && pdfDocument) {
      performSearch(initialSearchQuery);
    }
  }, [initialSearchQuery, pdfDocument]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(initialPage);
    setLoading(false);
    setError(null);
  }

  function onDocumentLoadError(error: Error) {
    console.error('PDF load error:', error);
    setError('Failed to load PDF. Please try again.');
    setLoading(false);
  }

  async function performSearch(query: string) {
    if (!query.trim() || !pdfDocument) return;

    setIsSearching(true);
    setSearchResults([]);
    setCurrentSearchIndex(0);

    try {
      const results: number[] = [];
      
      // Search through all pages
      for (let i = 1; i <= numPages; i++) {
        const page = await pdfDocument.getPage(i);
        const textContent = await page.getTextContent();
        const text = textContent.items
          .map((item: any) => item.str)
          .join(' ')
          .toLowerCase();

        if (text.includes(query.toLowerCase())) {
          results.push(i);
        }
      }

      setSearchResults(results);
      
      // Jump to first result
      if (results.length > 0) {
        setPageNumber(results[0]);
        setCurrentSearchIndex(0);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      performSearch(searchQuery);
    }
  }

  function goToPrevPage() {
    if (pageNumber > 1) setPageNumber(pageNumber - 1);
  }

  function goToNextPage() {
    if (pageNumber < numPages) setPageNumber(pageNumber + 1);
  }

  function goToPrevSearchResult() {
    if (searchResults.length === 0) return;
    const newIndex = currentSearchIndex > 0 ? currentSearchIndex - 1 : searchResults.length - 1;
    setCurrentSearchIndex(newIndex);
    setPageNumber(searchResults[newIndex]);
  }

  function goToNextSearchResult() {
    if (searchResults.length === 0) return;
    const newIndex = currentSearchIndex < searchResults.length - 1 ? currentSearchIndex + 1 : 0;
    setCurrentSearchIndex(newIndex);
    setPageNumber(searchResults[newIndex]);
  }

  function zoomIn() {
    setScale(Math.min(scale + 0.2, 3.0));
  }

  function zoomOut() {
    setScale(Math.max(scale - 0.2, 0.5));
  }

  function handlePageInput(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      const value = parseInt((e.target as HTMLInputElement).value);
      if (value > 0 && value <= numPages) {
        setPageNumber(value);
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-700">
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            title="Close"
          >
            <X className="h-5 w-5 text-white" />
          </button>
          <h3 className="text-white font-medium truncate max-w-md">{title || 'PDF Viewer'}</h3>
        </div>
        
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 bg-slate-800 px-3 py-2 rounded-lg">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search in PDF (e.g., wire number)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-white text-sm w-64"
          />
          {isSearching && <Loader2 className="h-4 w-4 text-cyan-400 animate-spin" />}
          {searchResults.length > 0 && (
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-slate-700">
              <span className="text-xs text-slate-400">
                {currentSearchIndex + 1} / {searchResults.length}
              </span>
              <button
                type="button"
                onClick={goToPrevSearchResult}
                className="p-1 hover:bg-slate-700 rounded"
                title="Previous result"
              >
                <ChevronLeft className="h-4 w-4 text-white" />
              </button>
              <button
                type="button"
                onClick={goToNextSearchResult}
                className="p-1 hover:bg-slate-700 rounded"
                title="Next result"
              >
                <ChevronRight className="h-4 w-4 text-white" />
              </button>
            </div>
          )}
        </form>

        {/* Controls */}
        <div className="flex items-center gap-3 bg-slate-800 px-4 py-2 rounded-lg">
          <button 
            onClick={goToPrevPage} 
            disabled={pageNumber <= 1}
            className="p-1.5 hover:bg-slate-700 rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Previous page"
          >
            <ChevronLeft className="h-5 w-5 text-white" />
          </button>
          
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={numPages}
              value={pageNumber}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (val > 0 && val <= numPages) setPageNumber(val);
              }}
              onKeyDown={handlePageInput}
              className="w-14 px-2 py-1 bg-slate-900 border border-slate-600 rounded text-white text-center text-sm font-mono"
            />
            <span className="text-slate-400 text-sm">/ {numPages}</span>
          </div>
          
          <button 
            onClick={goToNextPage} 
            disabled={pageNumber >= numPages}
            className="p-1.5 hover:bg-slate-700 rounded disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Next page"
          >
            <ChevronRight className="h-5 w-5 text-white" />
          </button>
          
          <div className="w-px h-6 bg-slate-700 mx-2" />
          
          <button 
            onClick={zoomOut}
            className="p-1.5 hover:bg-slate-700 rounded transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="h-5 w-5 text-white" />
          </button>
          <span className="text-white text-sm font-mono w-12 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button 
            onClick={zoomIn}
            className="p-1.5 hover:bg-slate-700 rounded transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="h-5 w-5 text-white" />
          </button>
          
          <div className="w-px h-6 bg-slate-700 mx-2" />
          
          <a 
            href={src} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="p-1.5 hover:bg-slate-700 rounded transition-colors"
            title="Open in new tab"
          >
            <Maximize2 className="h-5 w-5 text-white" />
          </a>
          
          <a 
            href={src} 
            download
            className="p-1.5 hover:bg-slate-700 rounded transition-colors"
            title="Download PDF"
          >
            <Download className="h-5 w-5 text-white" />
          </a>
        </div>
      </div>
      
      {/* PDF Content */}
      <div className="flex-1 overflow-auto bg-slate-800 flex items-start justify-center p-4">
        {loading && (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 className="h-12 w-12 text-cyan-400 animate-spin mb-4" />
            <p className="text-white">Loading PDF...</p>
          </div>
        )}
        
        {error && (
          <div className="flex flex-col items-center justify-center h-full">
            <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
            <p className="text-red-400">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg"
            >
              Retry
            </button>
          </div>
        )}
        
        {!loading && !error && (
          <Document
            file={src}
            onLoadSuccess={(pdf) => {
              onDocumentLoadSuccess(pdf);
              setPdfDocument(pdf);
            }}
            onLoadError={onDocumentLoadError}
            loading={
              <div className="flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
              </div>
            }
            error={
              <div className="text-red-400">
                Failed to load PDF
              </div>
            }
          >
            <div className="bg-white shadow-2xl">
              <Page 
                pageNumber={pageNumber} 
                scale={scale}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                loading={
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
                  </div>
                }
              />
            </div>
          </Document>
        )}
      </div>
      
      {/* Footer */}
      <div className="px-4 py-2 bg-slate-900 border-t border-slate-700 flex items-center justify-between">
        <div className="text-slate-400 text-sm">
          {searchResults.length > 0 ? (
            <span>
              Found <span className="text-cyan-400 font-bold">{searchResults.length}</span> page(s) 
              containing "<span className="text-white font-mono">{searchQuery}</span>"
            </span>
          ) : searchQuery && !isSearching ? (
            <span className="text-amber-400">No results found for "{searchQuery}"</span>
          ) : (
            <span>
              Showing page <span className="text-cyan-400 font-mono font-bold">{pageNumber}</span> of {numPages}
            </span>
          )}
        </div>
        <div className="text-slate-500 text-xs">
          Use search to find wires, connectors, or any text in the PDF
        </div>
      </div>
    </div>
  );
}
