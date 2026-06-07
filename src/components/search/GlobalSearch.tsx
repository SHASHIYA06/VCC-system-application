'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, FileText, Cpu, Waypoints, Activity, Link as LinkIcon, CircuitBoard, X, Sparkles, Zap, Command } from 'lucide-react';
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
      {/* Enhanced Trigger Button - Glassmorphism */}
      <div className="w-full max-w-lg">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center w-full h-14 px-6 text-sm glass-card-premium backdrop-blur-xl border border-glass-border rounded-3xl text-white/80 hover:text-white hover:border-accent-500/40 transition-all shadow-glow-sm group relative overflow-hidden"
        >
          {/* Glow effect on hover */}
          <div className="absolute inset-0 bg-gradient-accent opacity-0 group-hover:opacity-5 transition-opacity rounded-3xl" />
          
          <Search className="w-5 h-5 mr-3 text-accent-400 group-hover:text-accent-300 transition-colors" />
          <span className="flex-1 text-left font-medium">Search systems, wires, drawings...</span>
          
          {/* Enhanced keyboard shortcut */}
          <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-accent-400 bg-glass-light border border-accent-500/20 rounded-2xl shadow-inner-glow">
            <Command className="w-3 h-3" />
            <span>K</span>
          </div>
        </button>
      </div>

      {/* Enhanced Modal Overlay with Glassmorphism */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[8vh] sm:pt-[12vh]">
            {/* Premium backdrop with blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-2xl"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Enhanced Modal with 3D glassmorphism */}
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ 
                duration: 0.3, 
                ease: [0.16, 1, 0.3, 1],
                type: "spring",
                damping: 25,
                stiffness: 200
              }}
              className="relative w-full max-w-4xl mx-4 glass-card-premium backdrop-blur-4xl shadow-premium rounded-5xl overflow-hidden border-2 border-glass-border flex flex-col max-h-[80vh]"
              style={{
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.85) 100%)',
              }}
            >
              {/* Decorative glow elements */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-accent opacity-60" />
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent-500/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />

              {/* Enhanced Search Input */}
              <div className="relative flex items-center px-8 py-6 border-b border-glass-border bg-gradient-to-r from-glass-light to-transparent">
                <div className="relative flex items-center w-full">
                  <Search className="w-6 h-6 text-accent-400 absolute left-4 z-10" />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full h-16 pl-14 pr-16 text-xl bg-glass-light backdrop-blur-xl border-2 border-glass-border focus:border-accent-500 rounded-3xl text-white placeholder:text-white/50 focus:outline-none transition-all shadow-inner-glow focus:shadow-glow-lg font-medium"
                    placeholder="Search wire, trainline, drawing, equipment..."
                  />
                  {isSearching ? (
                    <div className="absolute right-4 p-2">
                      <Loader2 className="w-6 h-6 animate-spin text-accent-400" />
                    </div>
                  ) : (
                    <button 
                      onClick={() => setIsOpen(false)} 
                      className="absolute right-4 p-2 hover:bg-white/10 rounded-2xl text-white/60 hover:text-white transition-all"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  )}
                </div>
              </div>

              {/* Enhanced Results Area */}
              <div className="overflow-y-auto flex-1 p-6">
                {!query && (
                  <div className="p-8 text-center">
                    <Sparkles className="w-12 h-12 text-accent-400 mx-auto mb-4" />
                    <p className="text-white/80 text-lg mb-6 font-medium">
                      Search across the entire VCC system database
                    </p>
                    <p className="text-white/60 text-sm mb-8">
                      Find wires, drawings, equipment, systems, and more with instant results
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                      {['3005', 'Brake System', '6009', 'Door Control', 'HSCB', 'TRAC', 'VAC'].map(term => (
                        <button 
                          key={term} 
                          onClick={() => setQuery(term)} 
                          className="px-4 py-2 glass-card-premium border border-glass-border rounded-2xl text-white/70 hover:text-white hover:border-accent-500/40 transition-all font-medium"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {query && flatResults.length === 0 && !isSearching && (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 rounded-full glass-card-premium border border-glass-border flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-white/60" />
                    </div>
                    <p className="text-white/80 text-lg font-medium mb-2">No results found</p>
                    <p className="text-white/60">Try searching for "{query}" with different keywords</p>
                  </div>
                )}

                {flatResults.length > 0 && (
                  <div className="space-y-2">
                    {flatResults.map((item, index) => {
                      const Icon = item.icon;
                      const selected = index === selectedIndex;
                      return (
                        <motion.button
                          key={`${item.type}-${index}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.02 }}
                          onClick={() => { router.push(item.link); setIsOpen(false); }}
                          onMouseEnter={() => setSelectedIndex(index)}
                          className={`flex items-center gap-4 px-6 py-4 text-left rounded-3xl transition-all w-full relative overflow-hidden group ${
                            selected 
                              ? 'glass-card-premium border-2 border-accent-500/60 shadow-glow-lg bg-gradient-to-r from-accent-500/10 to-purple-500/10' 
                              : 'glass-card-medium border border-glass-border hover:border-accent-500/30 hover:shadow-glow-sm'
                          }`}
                        >
                          {/* Selection glow effect */}
                          {selected && (
                            <div className="absolute inset-0 bg-gradient-accent opacity-5 rounded-3xl" />
                          )}
                          
                          <div className={`flex items-center justify-center w-12 h-12 rounded-2xl shrink-0 transition-all ${
                            selected 
                              ? 'bg-accent-500/20 text-accent-300 border border-accent-500/40' 
                              : 'glass-card-light text-white/70 border border-glass-border group-hover:text-white group-hover:border-accent-500/30'
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className={`font-bold text-base truncate ${selected ? 'text-white' : 'text-white/90'}`}>
                              {item.title}
                            </span>
                            <span className={`text-sm truncate ${selected ? 'text-accent-200' : 'text-white/60'}`}>
                              {item.subtitle}
                            </span>
                          </div>
                          
                          <div className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
                            selected
                              ? 'bg-accent-500/30 text-accent-200 border border-accent-500/40'
                              : 'glass-card-light text-white/70 border border-glass-border'
                          }`}>
                            {item.type}
                          </div>
                          
                          {selected && (
                            <Zap className="w-4 h-4 text-accent-400 shrink-0 animate-pulse" />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>
              
              {/* Enhanced Footer */}
              <div className="px-8 py-4 border-t border-glass-border bg-gradient-to-r from-glass-light to-transparent flex items-center justify-between">
                <div className="flex items-center gap-6 text-xs text-white/70">
                  <span className="flex items-center gap-2">
                    <kbd className="glass-card-premium border border-glass-border rounded-lg px-2 py-1 shadow-inner-glow font-mono">↑↓</kbd>
                    <span className="font-medium">Navigate</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <kbd className="glass-card-premium border border-glass-border rounded-lg px-2 py-1 shadow-inner-glow font-mono">↵</kbd>
                    <span className="font-medium">Select</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <kbd className="glass-card-premium border border-glass-border rounded-lg px-2 py-1 shadow-inner-glow font-mono">ESC</kbd>
                    <span className="font-medium">Close</span>
                  </span>
                </div>
                <div className="text-xs text-accent-400 font-bold bg-accent-500/10 px-3 py-1.5 rounded-xl border border-accent-500/20">
                  {flatResults.length} result{flatResults.length !== 1 ? 's' : ''}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
