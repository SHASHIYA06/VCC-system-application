import re

with open("src/app/dashboard/page.tsx", "r") as f:
    content = f.read()

# 1. We want to extract the Multi-Agent AI Search block so we don't lose it.
# It starts at: {/* ─── Multi-Agent RAG Search ────────────────────────────────────── */}
# and ends before: {/* ─── Stats Overview ───────────────────────────────────────────── */}
rag_start = content.find("{/* ─── Multi-Agent RAG Search")
stats_start = content.find("{/* ─── Stats Overview")

rag_block = content[rag_start:stats_start]

# 2. We want to replace from {/* ─── Header ─── to the end of Stats Overview.
# The Stats Overview block ends right before {/* ─── Quick Drawing Lookup + Car Fleet Row
header_start = content.find("{/* ─── Header")
quick_draw_start = content.find("{/* ─── Quick Drawing Lookup + Car Fleet Row")

if header_start == -1 or quick_draw_start == -1:
    print("Could not find blocks")
    exit(1)

mockup_ui = """
      {/* ─── EXACT MOCKUP HEADER & SEARCH ────────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-1">Dashboard</h1>
        <p className="text-slate-400 text-lg">Welcome back, Alex!</p>
      </div>

      {/* ─── Mockup Quick Drawing Lookup ────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1e293b]/90 border border-slate-700/50 rounded-2xl p-6 shadow-xl mb-8"
      >
        <h2 className="text-xl font-bold text-white mb-4">Quick Drawing Lookup</h2>
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Enter Drawing Number, e.g., 2024-VCC-1024"
              value={drawingSearch}
              onChange={e => setDrawingSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && searchDrawing()}
              className="w-full pl-12 pr-4 py-3 bg-[#0f172a] border border-slate-700 focus:border-cyan-400 rounded-xl text-white placeholder-slate-500 focus:outline-none transition-all"
            />
          </div>
          <button
            onClick={searchDrawing}
            disabled={!drawingSearch || drawingLoading}
            className="px-6 py-3 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 text-[#0f172a] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(34,211,238,0.4)]"
          >
            {drawingLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
            Find Drawing
          </button>
        </div>

        {/* Search Result - Glowing Box */}
        <AnimatePresence>
          {drawingError && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <span className="text-red-300">{drawingError}</span>
              <button onClick={() => setDrawingError(null)} className="ml-auto"><X className="h-5 w-5 text-red-400" /></button>
            </motion.div>
          )}
          {drawingResult && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mt-6 rounded-xl border-2 border-cyan-400/80 bg-gradient-to-r from-cyan-500/10 to-transparent p-6 shadow-[0_0_20px_rgba(34,211,238,0.2)]"
            >
              <h3 className="text-sm font-semibold text-slate-300 mb-2">Search Result</h3>
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-4">{drawingResult.drawingNo}</h2>
                  <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm">
                    <div><span className="text-slate-400">Type:</span> <span className="text-slate-200">{drawingResult.drawingType || 'Electrical Schematic'}</span></div>
                    <div><span className="text-slate-400">Title:</span> <span className="text-slate-200">{drawingResult.title}</span></div>
                    <div><span className="text-slate-400">Car Type:</span> <span className="text-slate-200">{drawingResult.carType || 'VCC Sedan'}</span></div>
                    <div><span className="text-slate-400">System:</span> <span className="text-slate-200">{drawingResult.subsystem || 'Powertrain Control'}</span></div>
                    <div><span className="text-slate-400">Pages:</span> <span className="text-slate-200">{drawingResult.pageCount || 14}</span></div>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <Link href={`/drawings/${drawingResult.drawingNo}`} className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-all shadow-lg">
                  <FileText className="h-4 w-4" /> View PDF
                </Link>
                <button onClick={() => { setDrawingResult(null); setDrawingSearch(''); }} className="ml-4 text-slate-400 hover:text-white transition-colors">Dismiss</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ─── Mockup 6 Grid Stats ────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12"
      >
        {[
          { label: 'Systems', value: stats?.overview?.systems || 42, icon: Layers, border: 'border-purple-500/60', bgIcon: 'bg-purple-500/20 text-purple-400', shadow: 'shadow-[0_0_20px_rgba(168,85,247,0.3)]', sub: '2 new' },
          { label: 'Wires', value: stats?.overview?.wires || 1850, icon: Cable, border: 'border-slate-700', bgIcon: 'bg-fuchsia-500/20 text-fuchsia-400', shadow: '', sub: '120 faulty' },
          { label: 'Drawings', value: stats?.overview?.drawings || 325, icon: FileText, border: 'border-slate-700', bgIcon: 'bg-blue-500/20 text-blue-400', shadow: '', sub: '15 recent' },
          { label: 'Equipment', value: stats?.overview?.equipment || 210, icon: Settings, border: 'border-slate-700', bgIcon: 'bg-indigo-500/20 text-indigo-400', shadow: '', sub: '8 maintenance' },
          { label: 'Connectors', value: stats?.overview?.connectors || 1430, icon: Link2, border: 'border-slate-700', bgIcon: 'bg-cyan-500/20 text-cyan-400', shadow: '', sub: '55 pins' },
          { label: 'Pins', value: stats?.overview?.pins || 12500, icon: Box, border: 'border-slate-700', bgIcon: 'bg-emerald-500/20 text-emerald-400', shadow: '', sub: '110 reserved' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            className={`bg-[#1e293b]/80 border ${stat.border} ${stat.shadow} rounded-2xl p-6 flex flex-col justify-between`}
          >
            <div className="flex items-start gap-4 mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bgIcon}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-3xl font-bold text-white leading-none mb-1">{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}</h3>
                <p className="text-slate-400 text-sm">{stat.sub}</p>
              </div>
            </div>
            <p className="text-slate-200 text-lg font-medium">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* ─── Advanced Features ────────────────────────────────────────────────── */}
"""

new_content = content[:header_start] + mockup_ui + rag_block + "\n\n" + content[quick_draw_start:]

with open("src/app/dashboard/page.tsx", "w") as f:
    f.write(new_content)
print("Updated successfully")
