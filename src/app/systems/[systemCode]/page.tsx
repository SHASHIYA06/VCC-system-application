import Link from 'next/link';
import { supabase, hasValidSupabaseConfig } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { FileText, Cpu, Cable } from 'lucide-react';

export default async function SystemDetailsPage({ params }: { params: { systemCode: string } }) {
  const code = params.systemCode.toUpperCase();
  
  let system = {
    code: code,
    name: 'Mock System',
    description: 'This is a mocked system for demonstration.',
    status: 'active'
  };
  
  let drawings: any[] = [
    { id: '1', drawing_no: '942-XXXXX', title: 'Mock System Control', current_revision: 'A', status: 'active' }
  ];
  
  let equipment: any[] = [
    { id: '1', equipment_code: `${code}-BCU`, name: 'Control Unit', location: 'DMC' }
  ];

  if (hasValidSupabaseConfig) {
    try {
      const { data: sysData, error: sysError } = await supabase
        .from('systems')
        .select('*')
        .eq('code', code)
        .single();
        
      if (sysError || !sysData) {
         notFound();
      }
      system = sysData;

      const { data: drwData } = await supabase
        .from('drawings')
        .select('id, drawing_no, title, current_revision, status')
        .eq('system_id', sysData.id);
        
      drawings = drwData || [];

      const { data: eqData } = await supabase
        .from('equipment')
        .select('id, equipment_code, name, location')
        .eq('system_id', sysData.id);
        
      equipment = eqData || [];
    } catch (e) {
      console.error('Failed to fetch system details', e);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <Link href="/systems" className="text-sm font-medium text-blue-600 hover:text-blue-500 mb-2 inline-block">
          &larr; Back to Systems
        </Link>
        <div className="flex items-center gap-4 mt-2">
          <h1 className="text-3xl font-bold leading-tight text-slate-900">
            {system.code} - {system.name}
          </h1>
          <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
            {system.status}
          </span>
        </div>
        <p className="mt-2 text-lg text-slate-600">{system.description}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Drawings Panel */}
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-6 flex items-center gap-2">
            <FileText className="h-5 w-5 text-slate-500" />
            <h3 className="text-base font-semibold leading-6 text-slate-900">Related Drawings</h3>
          </div>
          <ul role="list" className="divide-y divide-slate-200">
            {drawings.length > 0 ? drawings.map((dwg) => (
              <li key={dwg.id} className="flex items-center justify-between gap-x-6 py-4 px-4 sm:px-6 hover:bg-slate-50">
                <div className="min-w-0">
                  <div className="flex items-start gap-x-3">
                    <p className="text-sm font-semibold leading-6 text-slate-900">{dwg.drawing_no}</p>
                    <p className="rounded-md whitespace-nowrap mt-0.5 px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset text-slate-600 bg-slate-50 ring-slate-500/10">
                      Rev {dwg.current_revision}
                    </p>
                  </div>
                  <div className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-slate-500">
                    <p className="truncate">{dwg.title}</p>
                  </div>
                </div>
                <div className="flex flex-none items-center gap-x-4">
                  <Link
                    href={`/drawings/${dwg.id}`}
                    className="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 sm:block"
                  >
                    View<span className="sr-only">, {dwg.drawing_no}</span>
                  </Link>
                </div>
              </li>
            )) : (
              <li className="py-4 px-6 text-sm text-slate-500">No drawings found for this system.</li>
            )}
          </ul>
        </div>

        {/* Equipment Panel */}
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-6 flex items-center gap-2">
            <Cpu className="h-5 w-5 text-slate-500" />
            <h3 className="text-base font-semibold leading-6 text-slate-900">Equipment Nodes</h3>
          </div>
          <ul role="list" className="divide-y divide-slate-200">
            {equipment.length > 0 ? equipment.map((eq) => (
              <li key={eq.id} className="flex items-center justify-between gap-x-6 py-4 px-4 sm:px-6 hover:bg-slate-50">
                <div className="min-w-0">
                  <div className="flex items-start gap-x-3">
                    <p className="text-sm font-semibold leading-6 text-slate-900">{eq.equipment_code}</p>
                  </div>
                  <div className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-slate-500">
                    <p className="truncate">{eq.name}</p>
                    <svg viewBox="0 0 2 2" className="h-0.5 w-0.5 fill-current">
                      <circle cx={1} cy={1} r={1} />
                    </svg>
                    <p className="truncate">Loc: {eq.location}</p>
                  </div>
                </div>
                <div className="flex flex-none items-center gap-x-4">
                  <Link
                    href={`/equipment/${eq.id}`}
                    className="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 sm:block"
                  >
                    View
                  </Link>
                </div>
              </li>
            )) : (
              <li className="py-4 px-6 text-sm text-slate-500">No equipment found for this system.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
