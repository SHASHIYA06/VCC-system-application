import Link from 'next/link';
import { supabase, hasValidSupabaseConfig } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import WireTraceDiagram from '@/components/diagrams/WireTraceDiagram';

export default async function WireDetailsPage({ params }: { params: { wireNo: string } }) {
  const id = params.wireNo;
  
  let wire = {
    id: id,
    wire_no: `W-${id}`,
    signal_name: 'MOCK_SIGNAL',
    description: 'Mock Wire description',
    type: 'Control',
    color: 'Red',
    cross_section_mm2: 1.5,
  };
  
  // Mock data for the diagram
  const sourceEquipment = 'DMC-BCU';
  const sourcePin = 'CN1-14';
  const targetEquipment = 'TC-BECU';
  const targetPin = 'CN2-8';

  if (hasValidSupabaseConfig) {
    try {
      const { data: wData, error: wError } = await supabase
        .from('wires')
        .select('*')
        .eq('id', id)
        .single();
        
      if (wError || !wData) {
         notFound();
      }
      
      wire = wData;
    } catch (e) {
      console.error('Failed to fetch wire details', e);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <Link href="/wires" className="text-sm font-medium text-blue-600 hover:text-blue-500 mb-2 inline-block">
          &larr; Back to Wires
        </Link>
        <div className="flex items-center gap-4 mt-2">
          <h1 className="text-3xl font-bold leading-tight text-slate-900">
            Wire: {wire.wire_no}
          </h1>
          <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-0.5 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
            {wire.type}
          </span>
        </div>
        <div className="mt-2 text-sm text-slate-600">
          <p>Signal: <span className="font-mono bg-slate-100 px-1 rounded">{wire.signal_name}</span></p>
          <p>{wire.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden h-full">
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
              <h3 className="text-base font-semibold leading-6 text-slate-900">Properties</h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-1">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-slate-500">Color</dt>
                  <dd className="mt-1 text-sm text-slate-900">{wire.color || 'N/A'}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-slate-500">Cross Section (mm²)</dt>
                  <dd className="mt-1 text-sm text-slate-900">{wire.cross_section_mm2 || 'N/A'}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
              <h3 className="text-base font-semibold leading-6 text-slate-900">Wire Trace Diagram</h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <WireTraceDiagram
                wireNo={wire.wire_no}
                sourceEquipment={sourceEquipment}
                sourcePin={sourcePin}
                targetEquipment={targetEquipment}
                targetPin={targetPin}
                color={wire.color === 'Red' ? '#ef4444' : '#3b82f6'}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
