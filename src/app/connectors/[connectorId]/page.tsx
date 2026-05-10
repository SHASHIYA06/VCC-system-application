import Link from 'next/link';
import { supabase, hasValidSupabaseConfig } from '@/lib/supabase';
import { notFound } from 'next/navigation';

export default async function ConnectorDetailsPage({ params }: { params: { connectorId: string } }) {
  const id = params.connectorId;
  
  let connector = {
    id: id,
    connector_code: `CN-${id}`,
    type: 'Plug',
    description: 'Control Signals',
    equipment_code: 'EQ-123'
  };
  
  let pins: any[] = [
    { id: '1', pin_number: '1', signal_name: '24V_DC', description: 'Power' },
    { id: '2', pin_number: '2', signal_name: 'GND', description: 'Ground' },
    { id: '3', pin_number: '3', signal_name: 'DOOR_OPEN', description: 'Door Open Command' }
  ];

  if (hasValidSupabaseConfig) {
    try {
      const { data: cnData, error: cnError } = await supabase
        .from('connectors')
        .select(`
          *,
          equipment (equipment_code)
        `)
        .eq('id', id)
        .single();
        
      if (cnError || !cnData) {
         notFound();
      }
      
      connector = {
        ...cnData,
        equipment_code: cnData.equipment?.equipment_code || 'Unknown'
      };

      const { data: pData } = await supabase
        .from('pins')
        .select('id, pin_number, signal_name, description')
        .eq('connector_id', id)
        .order('pin_number');
        
      pins = pData || [];
    } catch (e) {
      console.error('Failed to fetch connector details', e);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <Link href="/connectors" className="text-sm font-medium text-blue-600 hover:text-blue-500 mb-2 inline-block">
          &larr; Back to Connectors
        </Link>
        <div className="flex items-center gap-4 mt-2">
          <h1 className="text-3xl font-bold leading-tight text-slate-900">
            {connector.connector_code}
          </h1>
          <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-0.5 text-sm font-medium text-slate-800">
            {connector.type}
          </span>
        </div>
        <p className="mt-2 text-sm text-slate-500">Equipment: {connector.equipment_code}</p>
        <p className="mt-1 text-sm text-slate-600">{connector.description}</p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
          <h3 className="text-base font-semibold leading-6 text-slate-900">Pins & Signals</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-300">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-6">
                  Pin No
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  Signal Name
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  Description
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Trace</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {pins.length > 0 ? pins.map((p) => (
                <tr key={p.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 sm:pl-6">
                    {p.pin_number}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                    <span className="font-mono bg-slate-100 px-1 rounded">{p.signal_name}</span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">{p.description}</td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <Link href={`/pins/${p.id}`} className="text-blue-600 hover:text-blue-900">
                      Trace<span className="sr-only">, Pin {p.pin_number}</span>
                    </Link>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="py-4 pl-4 pr-3 text-sm text-slate-500 sm:pl-6 text-center">
                    No pins defined for this connector.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
