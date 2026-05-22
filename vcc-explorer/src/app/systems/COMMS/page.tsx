'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Radio, ArrowRight, Search, Cpu, Cable, FileText, Settings, Wifi, Tv, Speaker, Camera, Bell } from 'lucide-react';

const COMMS_WIRING = [
  { wireNo: '8001', signal: 'PA_ENABLE', description: 'PA system enable from TCMS', from: 'TCMS_RIO1-U25-A1', to: 'PA_AMP-CN1-1' },
  { wireNo: '8002', signal: 'PA_AUDIO_P', description: 'PA audio positive', from: 'PA_AMP-CN2-1', to: 'PA_SPK-CN1-1', audio: true },
  { wireNo: '8003', signal: 'PA_AUDIO_N', description: 'PA audio negative', from: 'PA_AMP-CN2-2', to: 'PA_SPK-CN1-2', audio: true },
  { wireNo: '8010', signal: 'DVAS_TRIGGER', description: 'DVAS trigger signal', from: 'TCMS_RIO1-U25-B1', to: 'DVAS-CN1-1' },
  { wireNo: '8015', signal: 'DVAS_STATUS', description: 'DVAS status feedback', from: 'DVAS-CN2-1', to: 'TCMS_RIO1-U25-B2' },
  { wireNo: '8020', signal: 'PIS_DISPLAY_1', description: 'PIS display data 1', from: 'PIS_CTRL-CN1-1', to: 'TFT1-CN1-1', data: true },
  { wireNo: '8021', signal: 'PIS_DISPLAY_2', description: 'PIS display data 2', from: 'PIS_CTRL-CN1-2', to: 'TFT2-CN1-1', data: true },
  { wireNo: '8030', signal: 'RADIO_TX', description: 'Radio transmit enable', from: 'RADIO-CN1-1', to: 'TCMS_RIO1-U25-C1' },
  { wireNo: '8035', signal: 'RADIO_RX', description: 'Radio receive output', from: 'RADIO-CN2-1', to: 'TCMS_RIO1-U25-C2' },
  { wireNo: '8040', signal: 'CBTC_ENABLE', description: 'CBTC communication enable', from: 'ATC-CN1-1', to: 'TCMS_RIO1-U25-D1' },
  { wireNo: '8045', signal: 'CBTC_STATUS', description: 'CBTC status output', from: 'ATC-CN2-1', to: 'TCMS_RIO1-U25-D2' },
  { wireNo: '8050', signal: 'CCTV_RECORD', description: 'CCTV recording trigger', from: 'CCTV_CTRL-CN1-1', to: 'NVR-CN1-1' },
  { wireNo: '8055', signal: 'CCTV_MOTION', description: 'CCTV motion detection', from: 'CAM1-CN1-1', to: 'CCTV_CTRL-CN2-1' },
  { wireNo: '8060', signal: 'ETH_PIS', description: 'Ethernet for PIS - CAT5e', from: 'PIS_SW-CN1-1', to: 'TFT_DISPLAYS', network: true },
  { wireNo: '8065', signal: 'ETH_CCTV', description: 'Ethernet for CCTV - CAT5e', from: 'CCTV_SW-CN1-1', to: 'CAMERAS_NVR', network: true },
];

const COMMS_COMPONENTS = [
  { component: 'PA Amplifier', designation: 'PA_AMP', location: 'TC Ceiling', function: 'Public address audio amplification', drawing: '942-58147' },
  { component: 'PA Speaker', designation: 'PA_SPK', location: 'Saloon Ceiling', function: 'Passenger announcement output', drawing: '942-58147' },
  { component: 'Digital Voice Announcer', designation: 'DVAS', location: 'TC Ceiling', function: 'Automated station announcements', drawing: '942-58148' },
  { component: 'PIS Controller', designation: 'PIS_CTRL', location: 'TC Ceiling', function: 'Passenger info system control', drawing: '942-58149' },
  { component: 'TFT Display', designation: 'TFT1-8', location: 'Saloon Ceiling', function: 'Passenger information display', drawing: '942-58150' },
  { component: 'Radio Set', designation: 'RADIO', location: 'TC Cabinet', function: 'Train radio communication', drawing: '942-58151' },
  { component: 'ATC/ATB', designation: 'ATC', location: 'TC Cabinet', function: 'Automatic train control', drawing: '942-58152' },
  { component: 'CCTV Controller', designation: 'CCTV_CTRL', location: 'TC Cabinet', function: 'CCTV system control', drawing: '942-58153' },
  { component: 'Network Video Recorder', designation: 'NVR', location: 'TC Cabinet', function: 'CCTV recording storage', drawing: '942-58153' },
  { component: 'Camera', designation: 'CAM1-16', location: 'Various', function: 'CCTV monitoring', drawing: '942-58154' },
  { component: 'Ethernet Switch', designation: 'ETH_SW', location: 'TC Cabinet', function: 'Network backbone', drawing: '942-58149' },
];

const NETWORK_ARCH = [
  { network: 'PIS Network', protocol: 'Ethernet 100BASE-TX', devices: ['PIS Controller', 'TFT Displays', 'Digital Signs'], cable: 'CAT5e Shielded' },
  { network: 'CCTV Network', protocol: 'Ethernet 100BASE-TX', devices: ['CCTV Controller', 'Cameras', 'NVR'], cable: 'CAT5e Shielded' },
  { network: 'TCMS Network', protocol: 'CAN Bus / Ethernet', devices: ['TCMS RIO', 'All ECUs'], cable: 'CAN Bus / CAT5e' },
  { network: 'Radio Network', protocol: 'UHF/VHF', devices: ['Radio Set', 'Antenna'], cable: 'Coaxial' },
];

const DRAWINGS = [
  { drawingNo: '942-58147', title: 'PA System', description: 'Public address and DVAS' },
  { drawingNo: '942-58148', title: 'DVAS Circuit', description: 'Digital voice announcer' },
  { drawingNo: '942-58149', title: 'PIS System', description: 'Passenger information displays' },
  { drawingNo: '942-58150', title: 'TFT Display Circuit', description: 'Display wiring' },
  { drawingNo: '942-58151', title: 'Radio System', description: 'Train radio' },
  { drawingNo: '942-58152', title: 'ATC/CBTC', description: 'Automatic train control' },
  { drawingNo: '942-58153', title: 'CCTV System', description: 'Closed circuit TV' },
  { drawingNo: '942-58154', title: 'Camera Wiring', description: 'Camera connections' },
];

export default function COMMSPage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('wiring');

  const filteredWiring = COMMS_WIRING.filter(w => !search || w.wireNo.includes(search) || w.signal.toLowerCase().includes(search.toLowerCase()));

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
                {filteredWiring.map(wire => (
                  <tr key={wire.wireNo} className="hover:bg-slate-800/30">
                    <td className="px-4 py-3">
                      <Link href={`/wires/${wire.wireNo}`} className="font-mono font-bold text-cyan-400">{wire.wireNo}</Link>
                    </td>
                    <td className="px-4 py-3 text-white text-sm">{wire.signal}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-300">{wire.from}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-300">{wire.to}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        wire.audio ? 'bg-purple-500/20 text-purple-400' :
                        wire.network ? 'bg-blue-500/20 text-blue-400' :
                        wire.data ? 'bg-green-500/20 text-green-400' :
                        'bg-slate-500/20 text-slate-400'
                      }`}>
                        {wire.audio ? 'Audio' : wire.network ? 'Network' : wire.data ? 'Data' : 'Control'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'networks' && (
        <div className="space-y-4">
          {NETWORK_ARCH.map(net => (
            <div key={net.network} className="glass-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Wifi className="h-5 w-5 text-pink-400" />
                <span className="font-semibold text-white">{net.network}</span>
                <span className="text-xs text-slate-400 ml-2">{net.protocol}</span>
              </div>
              <div className="text-xs text-slate-400 mb-2">Cable: {net.cable}</div>
              <div className="flex flex-wrap gap-2">
                {net.devices.map(d => (
                  <span key={d} className="px-2 py-1 bg-slate-700/50 rounded text-xs text-slate-300">{d}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'components' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {COMMS_COMPONENTS.map(comp => (
            <div key={comp.designation} className="glass-card p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg font-bold text-pink-400">{comp.component}</span>
                <span className="font-mono text-cyan-400">{comp.designation}</span>
              </div>
              <div className="text-sm text-slate-400">{comp.function}</div>
              <div className="text-xs text-slate-500 mt-2">Drawing: <Link href={`/drawings/${comp.drawing}`} className="text-cyan-400">{comp.drawing}</Link></div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'drawings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DRAWINGS.map(dwg => (
            <Link key={dwg.drawingNo} href={`/drawings/${dwg.drawingNo}`} className="glass-card p-4 hover:bg-slate-800/50">
              <span className="font-mono text-lg font-bold text-cyan-400">{dwg.drawingNo}</span>
              <div className="text-white font-medium mt-2">{dwg.title}</div>
              <div className="text-xs text-slate-500 mt-1">{dwg.description}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}