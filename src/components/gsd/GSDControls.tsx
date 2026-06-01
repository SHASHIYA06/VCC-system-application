'use client';

import React, { useState } from 'react';
import { Search, Filter, Download, RefreshCw, Settings } from 'lucide-react';

interface GSDControlsProps {
  onSearch: (query: string) => void;
  onFilter: (filter: string) => void;
  onExport: () => void;
  onRefresh: () => void;
  loading?: boolean;
}

export const GSDControls: React.FC<GSDControlsProps> = ({
  onSearch,
  onFilter,
  onExport,
  onRefresh,
  loading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/20 rounded-lg p-4 space-y-4">
      {/* Search */}
      <form onSubmit={handleSearch} className="space-y-2">
        <label className="block text-sm font-medium text-slate-300">Search</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search devices, wires, connectors..."
            className="flex-1 px-4 py-2 bg-slate-700 border border-cyan-500/30 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition disabled:opacity-50 flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Filter Toggle */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="w-full px-4 py-2 bg-slate-700 border border-cyan-500/30 text-slate-300 rounded-lg hover:bg-slate-600 hover:border-cyan-500 transition flex items-center justify-center gap-2"
      >
        <Filter className="w-4 h-4" />
        Filters
      </button>

      {/* Filters */}
      {showFilters && (
        <div className="space-y-3 pt-3 border-t border-slate-700">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Connection Type</label>
            <select
              onChange={(e) => onFilter(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 border border-cyan-500/30 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500 transition"
            >
              <option value="">All Types</option>
              <option value="power">Power</option>
              <option value="signal">Signal</option>
              <option value="communication">Communication</option>
              <option value="ground">Ground</option>
            </select>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-700">
        <button
          onClick={onExport}
          className="px-4 py-2 bg-slate-700 border border-cyan-500/30 text-slate-300 rounded-lg hover:bg-slate-600 hover:border-cyan-500 transition flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="px-4 py-2 bg-slate-700 border border-cyan-500/30 text-slate-300 rounded-lg hover:bg-slate-600 hover:border-cyan-500 transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
    </div>
  );
};

export default GSDControls;
