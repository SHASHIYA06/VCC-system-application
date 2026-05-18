import Link from 'next/link';
import { query } from '@/lib/db';
import { Cable, ArrowRight, Search } from 'lucide-react';

interface Wire {
  id: string;
  wire_no: string;
  description: string;
  wire_size: string;
  wire_color: string;
  voltage_class: string;
}

export default async function WiresPage() {
  let wires: Wire[] = [];
  
  try {
    wires = await query<Wire>('SELECT * FROM wires ORDER BY wire_no');
  } catch (e) {
    console.error('Failed to fetch wires', e);
  }

  const voltageColors: Record<string, string> = {
    '110VDC': 'text-green-400 bg-green-500/20',
    '415VAC': 'text-amber-400 bg-amber-500/20',
    '750VDC': 'text-red-400 bg-red-500/20',
    'DATA': 'text-purple-400 bg-purple-500/20',
  };

  return (
    <div className="animated-bg min-h-screen p-6 grid-pattern">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text">Wire Intelligence</h1>
        <p className="mt-2 text-slate-400">
          Complete wire registry with specifications for point-to-point tracing
        </p>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="glass-table">
            <thead>
              <tr>
                <th className="text-cyan-400">Wire No</th>
                <th className="text-cyan-400">Description</th>
                <th className="text-cyan-400">Size</th>
                <th className="text-cyan-400">Color</th>
                <th className="text-cyan-400">Voltage</th>
                <th className="text-cyan-400">Action</th>
              </tr>
            </thead>
            <tbody>
              {wires.map((wire) => (
                <tr key={wire.id} className="hover:bg-cyan-500/5">
                  <td className="font-mono text-lg text-cyan-400 font-bold">{wire.wire_no}</td>
                  <td className="text-white">{wire.description || '-'}</td>
                  <td className="text-slate-400">{wire.wire_size || '-'}</td>
                  <td>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${wire.wire_color?.toLowerCase().includes('red') ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-300'}`}>
                      {wire.wire_color || '-'}
                    </span>
                  </td>
                  <td>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${voltageColors[wire.voltage_class || ''] || 'text-slate-400 bg-slate-700'}`}>
                      {wire.voltage_class || 'N/A'}
                    </span>
                  </td>
                  <td>
                    <Link href={`/wires/${wire.wire_no}`} className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                      Trace <ArrowRight className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {wires.length === 0 && (
        <div className="glass-card p-8 text-center">
          <Cable className="h-12 w-12 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400">No wires found in database</p>
        </div>
      )}
    </div>
  );
}