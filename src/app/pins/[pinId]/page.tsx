import Link from 'next/link';
import { supabase, hasValidSupabaseConfig } from '@/lib/supabase';
import { notFound } from 'next/navigation';

export default async function PinDetailsPage({ params }: { params: Promise<{ pinId: string }> }) {
  const { pinId } = await params; const id = pinId;
  
  let pin = {
    id: id,
    pin_number: '14',
    signal_name: 'BRAKE_CMD',
    description: 'Brake Application Command',
    connector_code: 'CN2',
    equipment_code: 'TC-BECU',
    wire_no: 'W1001'
  };

  if (hasValidSupabaseConfig) {
    try {
      const { data, error } = await supabase
        .from('pins')
        .select(`
          *,
          connectors (connector_code, equipment(equipment_code)),
          wires (wire_no)
        `)
        .eq('id', id)
        .single();
        
      if (error || !data) {
         notFound();
      }
      
      pin = {
        ...data,
        connector_code: data.connectors?.connector_code || 'Unknown',
        equipment_code: data.connectors?.equipment?.equipment_code || 'Unknown',
        wire_no: data.wires?.wire_no || null
      };
    } catch (e) {
      console.error('Failed to fetch pin details', e);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <Link href="/pins" className="text-sm font-medium text-blue-600 hover:text-blue-500 mb-2 inline-block">
          &larr; Back to Pins
        </Link>
        <div className="flex items-center gap-4 mt-2">
          <h1 className="text-3xl font-bold leading-tight text-slate-900">
            Pin: {pin.pin_number}
          </h1>
          <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-0.5 text-sm font-medium text-slate-800">
            {pin.signal_name}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
            <h3 className="text-base font-semibold leading-6 text-slate-900">Connection Details</h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-slate-500">Equipment</dt>
                <dd className="mt-1 text-sm text-slate-900">{pin.equipment_code}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-slate-500">Connector</dt>
                <dd className="mt-1 text-sm text-slate-900">{pin.connector_code}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-slate-500">Attached Wire</dt>
                <dd className="mt-1 text-sm text-slate-900">
                  {pin.wire_no ? (
                    <Link href={`/wires/${pin.wire_no}`} className="text-blue-600 hover:underline">
                      {pin.wire_no}
                    </Link>
                  ) : 'Not wired'}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-slate-500">Description</dt>
                <dd className="mt-1 text-sm text-slate-900">{pin.description}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
