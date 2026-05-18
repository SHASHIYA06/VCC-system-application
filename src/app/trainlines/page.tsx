import Link from 'next/link';
import { query } from '@/lib/db';
import { Zap, ArrowRight } from 'lucide-react';

interface Trainline {
  id: string;
  trainline_no: number;
  name: string;
  description: string;
  voltage_domain: string;
  is_cross_connected: boolean;
}

export default async function TrainlinesPage() {
  let trainlines: Trainline[] = [];
  
  try {
    trainlines = await query<Trainline>('SELECT * FROM trainlines ORDER BY trainline_no');
  } catch (e) {
    console.error('Failed to fetch trainlines', e);
  }

  const voltageColors: Record<string, string> = {
    '110VDC': 'text-green-400 bg-green-500/20',
    '415VAC': 'text-amber-400 bg-amber-500/20',
    '750VDC': 'text-red-400 bg-red-500/20',
  };

  return (
    <div className="animated-bg min-h-screen p-6 grid-pattern">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text">Trainline Explorer</h1>
        <p className="mt-2 text-slate-400">
          Trace priority signals across the 6-car formation (DMC-TC-MC-MC-TC-DMC)
        </p>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="glass-table">
            <thead>
              <tr>
                <th className="text-cyan-400">Trainline #</th>
                <th className="text-cyan-400">Name</th>
                <th className="text-cyan-400">Description</th>
                <th className="text-cyan-400">Voltage</th>
                <th className="text-cyan-400">Cross-Connected</th>
                <th className="text-cyan-400">Action</th>
              </tr>
            </thead>
            <tbody>
              {trainlines.map((tl) => (
                <tr key={tl.id} className="hover:bg-cyan-500/5">
                  <td className="font-mono text-lg text-cyan-400 font-bold">{tl.trainline_no}</td>
                  <td className="text-white font-medium">{tl.name}</td>
                  <td className="text-slate-400">{tl.description}</td>
                  <td>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${voltageColors[tl.voltage_domain] || 'text-slate-400 bg-slate-700'}`}>
                      {tl.voltage_domain || 'N/A'}
                    </span>
                  </td>
                  <td>
                    {tl.is_cross_connected ? (
                      <span className="text-amber-400 text-sm">⚡ Yes</span>
                    ) : (
                      <span className="text-slate-500 text-sm">No</span>
                    )}
                  </td>
                  <td>
                    <Link href={`/trainlines/${tl.trainline_no}`} className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                      Trace <ArrowRight className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {trainlines.length === 0 && (
        <div className="glass-card p-8 text-center">
          <Zap className="h-12 w-12 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400">No trainlines found in database</p>
        </div>
      )}
    </div>
  );
}