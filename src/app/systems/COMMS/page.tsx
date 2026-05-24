'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Radio, ArrowRight, Search, Cpu, Cable, FileText, Settings, Wifi, Tv, Speaker, Camera, Bell, Loader2 } from 'lucide-react';

interface COMMSWire {
  wireNo: string;
  signal: string;
  description: string;
  from: string;
  to: string;
  voltageClass?: string;
  wireColor?: string;
  drawing?: string;
}

interface COMMSComponent {
  component: string;
  designation: string;
  location: string;
  function: string;
  drawing: string;
}

interface COMMSNetwork {
  network: string;
  protocol: string;
  devices: string[];
  cable: string;
}

interface COMMSDrawing {
  drawingNo: string;
  title: string;
  description: string;
}

export default function COMMSPage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('wiring');
  const [wires, setWires] = useState<COMMSWire[]>([]);
  const [components, setComponents] = useState<COMMSComponent[]>([]);
  const [networks, setNetworks] = useState<COMMSNetwork[]>([]);
  const [drawings, setDrawings] = useState<COMMSDrawing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCOMMSData();
  }, []);

  async function fetchCOMMSData() {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch COMMS wires from database
      const wireRes = await fetch('/api/wires?system=COMMS');
      const wireData = await wireRes.json();
      
      // Fetch COMMS components from database
      const compRes = await fetch('/api/equipment?system=COMMS');
      const compData = await compRes.json();
      
      // Fetch COMMS drawings from database
      const drawingRes = await fetch('/api/drawings?system=COMMS');
      const drawingData = await drawingRes.json();
      
      // Transform wire data
      const transformedWires: COMMSWire[] = (wireData.wires || []).map((w: any) => ({
        wireNo: w.wireNo,
        signal: w.signalName || w.description || 'Unknown',
        description: w.description || 'No description',
        from: w.sourceEquipment || 'Unknown',
        to: w.destEquipment || 'Unknown',
        voltageClass: w.voltageClass,
        wireColor: w.wireColor,
        drawing: w.drawingNo || 'N/A'
      }));
      
      // Transform component data
      const transformedComponents: COMMSComponent[] = (compData.equipment || []).map((c: any) => ({
        component: c.deviceName || c.name || 'Unknown',
        designation: c.tagNo || c.designation || 'N/A',
        location: c.carType || 'TC',
        function: c.description || 'No description',
        drawing: c.drawingNo || 'N/A'
      }));
      
      // Transform drawing data
      const transformedDrawings: COMMSDrawing[] = (drawingData.drawings || []).map((d: any) => ({
        drawingNo: d.drawingNo,
        title: d.title || 'Untitled',
        description: d.description || 'No description'
      }));
      
      // Define network architecture
      const transformedNetworks: COMMSNetwork[] = [
        { network: 'PIS Network', protocol: 'Ethernet 100BASE-TX', devices: ['PIS Controller', 'TFT Displays', 'Digital Signs'], cable: 'CAT5e Shielded' },
        { network: 'CCTV Network', protocol: 'Ethernet 100BASE-TX', devices: ['CCTV Controller', 'Cameras', 'NVR'], cable: 'CAT5e Shielded' },
        { network: 'TCMS Network', protocol: 'CAN Bus / Ethernet', devices: ['TCMS RIO', 'All ECUs'], cable: 'CAN Bus / CAT5e' },
        { network: 'Radio Network', protocol: 'UHF/VHF', devices: ['Radio Set', 'Antenna'], cable: 'Coaxial' },
      ];
      
      setWires(transformedWires);
      setComponents(transformedComponents);
      setNetworks(transformedNetworks);
      setDrawings(transformedDrawings);
    } catch (err) {
      console.error('Failed to fetch COMMS data:', err);
      setError('Failed to load COMMS data. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const filteredWires = wires.filter(w => 
    !search || 
    w.wireNo.includes(search) || 
    w.signal.toLowerCase().includes(search.toLowerCase()) ||
    w.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animated-bg min-h-screen p-6 grid-pattern">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Link href="/systems" className="text-cyan-400 hover:text-cyan-300 text-sm">← Systems</Link>
        </div>
        <h1 className="text-3xl font-bold gradient-text flex items-center gap-3">
          <Radio className="h-8 w-8 text-pink-400" />
          Communications System
        </h1>
        <p className="mt-2 text-slate-400">
          PIS, PA, DVAS, Radio, CBTC, CCTV - All communication systems
        </p>
      </div>

      <div className="flex gap-2 mb-6 border-b border-slate-700">
        {[
          { id: 'wiring', label: 'Wiring', icon: Cable },
          { id: 'networks', label: 'Networks', icon: Wifi },
          { id: 'components', label: 'Components', icon: Cpu },
          { id: 'drawings', label: 'Drawings', icon: FileText },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === tab.id ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}>
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'wiring' && (
        <div className="space-y-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input type="text" placeholder="Search wire..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200" />
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
            </div>
          ) : error ? (
            <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
              {error}
            </div>
          ) : (
            <div className="glass-card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50 bg-slate-800/30">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Wire</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Signal</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">From</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">To</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {filteredWires.map((wire, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30">
                      <td className="px-4 py-3">
                        <Link href={`/wires/${wire.wireNo}`} className="font-mono font-bold text-cyan-400">{wire.wireNo}</Link>
                      </td>
                      <td className="px-4 py-3 text-white text-sm">{wire.signal}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-300">{wire.from}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-300">{wire.to}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          wire.signal.toLowerCase().includes('audio') ? 'bg-purple-500/20 text-purple-400' :
                          wire.signal.toLowerCase().includes('eth') || wire.signal.toLowerCase().includes('network') ? 'bg-blue-500/20 text-blue-400' :
                          wire.signal.toLowerCase().includes('data') ? 'bg-green-500/20 text-green-400' :
                          'bg-slate-500/20 text-slate-400'
                        }`}>
                          {wire.signal.toLowerCase().includes('audio') ? 'Audio' : 
                           wire.signal.toLowerCase().includes('eth') || wire.signal.toLowerCase().includes('network') ? 'Network' : 
                           wire.signal.toLowerCase().includes('data') ? 'Data' : 'Control'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredWires.length === 0 && (
                <div className="p-8 text-center text-slate-500">
                  No wires found matching "{search}"
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'networks' && (
        <div className="space-y-4">
          {networks.map((net, idx) => (
            <div key={idx} className="glass-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Wifi className="h-5 w-5 text-pink-400" />
                <span className="font-semibold text-white">{net.network}</span>
                <span className="text-xs text-slate-400 ml-2">{net.protocol}</span>
              </div>
              <div className="text-xs text-slate-400 mb-2">Cable: {net.cable}</div>
              <div className="flex flex-wrap gap-2">
                {net.devices.map((d, dIdx) => (
                  <span key={dIdx} className="px-2 py-1 bg-slate-700/50 rounded text-xs text-slate-300">{d}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'components' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {components.map((comp, idx) => (
            <div key={idx} className="glass-card p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg font-bold text-pink-400">{comp.component}</span>
                <span className="font-mono text-cyan-400">{comp.designation}</span>
              </div>
              <div className="text-sm text-slate-400">{comp.function}</div>
              <div className="text-xs text-slate-500 mt-2">Location: {comp.location}</div>
              <div className="text-xs text-slate-500">Drawing: <Link href={`/drawings/${comp.drawing}`} className="text-cyan-400">{comp.drawing}</Link></div>
            </div>
          ))}
          {components.length === 0 && !loading && (
            <div className="col-span-2 p-8 text-center text-slate-500">
              No components found for COMMS system
            </div>
          )}
        </div>
      )}

      {activeTab === 'drawings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {drawings.map((dwg, idx) => (
            <Link key={idx} href={`/drawings/${dwg.drawingNo}`} className="glass-card p-4 hover:bg-slate-800/50">
              <span className="font-mono text-lg font-bold text-cyan-400">{dwg.drawingNo}</span>
              <div className="text-white font-medium mt-2">{dwg.title}</div>
              <div className="text-xs text-slate-500 mt-1">{dwg.description}</div>
            </Link>
          ))}
          {drawings.length === 0 && !loading && (
            <div className="col-span-2 p-8 text-center text-slate-500">
              No drawings found for COMMS system
            </div>
          )}
        </div>
      )}
    </div>
  );
}