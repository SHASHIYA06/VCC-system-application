'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, FileText, Cpu, Waypoints, Activity, Link as LinkIcon, CircuitBoard, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface SearchResult {
  query: string;
  type: string;
  total: number;
  wires?: any[];
  drawings?: any[];
  equipment?: any[];
  trainlines?: any[];
  systems?: any[];
  pins?: any[];
}

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Flatten results for keyboard navigation
  const flatResults = React.useMemo(() => {
    if (!results) return [];
    const items: { type: string; data: any; title: string; subtitle: string; icon: any; link: string }[] = [];
    
    results.systems?.forEach(sys => 
      items.push({ type: 'System', data: sys, title: sys.name, subtitle: sys.code, icon: Activity, link: `/systems/${sys.code}` })
    );
    results.drawings?.forEach(dwg => 
      items.push({ type: 'Drawing', data: dwg, title: dwg.title, subtitle: dwg.drawingNo, icon: FileText, link: `/drawings/${dwg.drawingNo}` })
    );
    results.trainlines?.forEach(tl => 
      items.push({ type: 'Trainline', data: tl, title: tl.itemName, subtitle: tl.wireNo || 'No Wire', icon: Waypoints, link: `/trainlines/${tl.wireNo}` })
    );
    results.wires?.forEach(wire => 
      items.push({ type: 'Wire', data: wire, title: wire.wireNo, subtitle: wire.description || wire.signalName || 'Wire', icon: CircuitBoard, link: `/wires/${wire.wireNo}` })
    );
    results.equipment?.forEach(eq => 
      items.push({ type: 'Device', data: eq, title: eq.tagNo || eq.deviceName, subtitle: eq.deviceName, icon: Cpu, link: `/equipment/${eq.tagNo || eq.id}` })
    );
    results.pins?.forEach(pin => 
      items.push({ type: 'Pin', data: pin, title: `Pin ${pin.pinNo}`, subtitle: `Connector ${pin.connectorCode || ''}`, icon: LinkIcon, link: `/pins/${pin.id}` })
    );

    return items;
  }, [results]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
      
      if (isOpen && flatResults.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % flatResults.length);
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + flatResults.length) % flatResults.length);
        }
        if (e.key === 'Enter') {
          e.preventDefault();
          if (flatResults[selectedIndex]) {
            router.push(flatResults[selectedIndex].link);
            setIsOpen(false);
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, flatResults, selectedIndex, router]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setQuery('');
      setResults(null);
    }
    return () => { document.body.style.overflow = 'unset'; }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=10`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
          setSelectedIndex(0);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <>
      {/* Trigger Button */}
      <div className="w-full max-w-md">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center w-full h-10 px-4 text-sm bg-slate-100/50 border border-slate-200/60 rounded-xl text-slate-500 hover:bg-slate-100 hover:border-slate-300 transition-all shadow-sm group"
        >
          <Search className="w-4 h-4 mr-2 text-slate-400 group-hover:text-slate-600 transition-colors" />
          <span className="flex-1 text-left">Search systems, wires, drawings...</span>
          <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 bg-white border border-slate-200 rounded-md">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
      </div>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] sm:pt-[15vh]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-2xl mx-4 bg-white shadow-2xl rounded-2xl overflow-hidden border border-slate-200/60 flex flex-col max-h-[80vh]"
            >
              {/* Search Input */}
              <div className="relative flex items-center px-4 border-b border-slate-100">
                <Search className="w-5 h-5 text-slate-400" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full h-14 px-3 text-lg bg-transparent border-0 focus:ring-0 text-slate-900 placeholder:text-slate-400"
                  placeholder="Search wire, trainline, drawing, or equipment..."
                />
                {isSearching ? (
                  <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                ) : (
                  <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-600 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Results Area */}
              <div className="overflow-y-auto flex-1 p-2">
                {!query && (
                  <div className="p-6 text-center text-sm text-slate-500">
                    <p>Start typing to search across the entire vehicle circuit knowledge base.</p>
                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                      {['3005', 'Brake', '6009', 'Door', 'HSCB'].map(term => (
                        <button key={term} onClick={() => setQuery(term)} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-colors">
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {query && flatResults.length === 0 && !isSearching && (
                  <div className="p-10 text-center text-slate-500">
                    <p>No results found for "{query}"</p>
                  </div>
                )}

                {flatResults.length > 0 && (
                  <div className="flex flex-col gap-1 py-2">
                    {flatResults.map((item, index) => {
                      const Icon = item.icon;
                      const selected = index === selectedIndex;
                      return (
                        <button
                          key={`${item.type}-${index}`}
                          onClick={() => { router.push(item.link); setIsOpen(false); }}
                          onMouseEnter={() => setSelectedIndex(index)}
                          className={`flex items-center gap-4 px-4 py-3 text-left rounded-xl transition-all ${
                            selected ? 'bg-blue-50 text-blue-900' : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${selected ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className="font-medium text-sm truncate">{item.title}</span>
                            <span className={`text-xs truncate ${selected ? 'text-blue-600/70' : 'text-slate-500'}`}>{item.subtitle}</span>
                          </div>
                          <div className="shrink-0 text-xs font-medium px-2 py-1 rounded-md bg-slate-100 text-slate-500">
                            {item.type}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              
              {/* Footer */}
              <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1"><kbd className="bg-white border border-slate-200 rounded px-1 shadow-sm">↑</kbd><kbd className="bg-white border border-slate-200 rounded px-1 shadow-sm">↓</kbd> to navigate</span>
                  <span className="flex items-center gap-1"><kbd className="bg-white border border-slate-200 rounded px-1 shadow-sm">↵</kbd> to select</span>
                  <span className="flex items-center gap-1"><kbd className="bg-white border border-slate-200 rounded px-1 shadow-sm">ESC</kbd> to close</span>
                </div>
                <div>{flatResults.length} result{flatResults.length !== 1 ? 's' : ''}</div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
