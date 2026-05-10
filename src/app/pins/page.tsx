import Link from 'next/link';
import { supabase, hasValidSupabaseConfig } from '@/lib/supabase';

const mockPins = [
  { id: '1', pin_number: '1', connector: { connector_code: 'CN1', equipment: { equipment_code: 'DMC-BCU' } }, signal_name: '24V_DC', wire: { wire_no: 'P2001' } },
  { id: '2', pin_number: '2', connector: { connector_code: 'CN1', equipment: { equipment_code: 'DMC-BCU' } }, signal_name: 'GND', wire: null },
  { id: '3', pin_number: '14', connector: { connector_code: 'CN2', equipment: { equipment_code: 'TC-BECU' } }, signal_name: 'BRAKE_CMD', wire: { wire_no: 'W1001' } },
];

export default async function PinsRegister() {
  let pins: any[] = mockPins;

  if (hasValidSupabaseConfig) {
    try {
      const { data, error } = await supabase
        .from('pins')
        .select(`
          id, 
          pin_number, 
          signal_name, 
          connectors(connector_code, equipment(equipment_code)),
          wires(wire_no)
        `);
      
      if (data && !error) {
        pins = data.map((d: any) => ({
          ...d,
          connector: d.connectors,
          wire: d.wires
        }));
      }
    } catch (e) {
      console.error('Failed to fetch pins from Supabase', e);
    }
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold leading-6 text-slate-900">Pin Directory</h1>
          <p className="mt-2 text-sm text-slate-700">
            A comprehensive list of all pins across all connectors.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          {!hasValidSupabaseConfig && (
            <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20 mr-4">
              Using Mock Data
            </span>
          )}
        </div>
      </div>
      
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-slate-300">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-6">
                      Equipment
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                      Connector
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                      Pin No
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                      Signal Name
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                      Attached Wire
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">View</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {pins.map((p: any) => (
                    <tr key={p.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 sm:pl-6">
                        {p.connector?.equipment?.equipment_code || 'Unknown'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                        {p.connector?.connector_code || 'Unknown'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 font-bold">
                        {p.pin_number}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                        <span className="font-mono bg-slate-100 px-1 rounded">{p.signal_name}</span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                        {p.wire ? (
                           <Link href={`/wires/${p.wire.id || p.wire.wire_no}`} className="text-blue-600 hover:text-blue-900">
                             {p.wire.wire_no}
                           </Link>
                        ) : 'N/A'}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <Link href={`/pins/${p.id}`} className="text-blue-600 hover:text-blue-900">
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
