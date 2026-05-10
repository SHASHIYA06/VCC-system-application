import Link from 'next/link';
import { supabase, hasValidSupabaseConfig } from '@/lib/supabase';

const mockWires = [
  { id: '1', wire_no: 'W1001', signal_name: 'BRAKE_CMD', description: 'Brake Application Command', type: 'Control' },
  { id: '2', wire_no: 'W1002', signal_name: 'DOOR_CLS', description: 'Door Close Signal', type: 'Control' },
  { id: '3', wire_no: 'P2001', signal_name: '110V_DC', description: 'Auxiliary Power', type: 'Power' },
];

export default async function WiresRegister() {
  let wires = mockWires;

  if (hasValidSupabaseConfig) {
    try {
      const { data, error } = await supabase
        .from('wires')
        .select('id, wire_no, signal_name, description, type')
        .order('wire_no');
      
      if (data && !error) {
        wires = data;
      }
    } catch (e) {
      console.error('Failed to fetch wires from Supabase', e);
    }
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold leading-6 text-slate-900">Wire Traceability</h1>
          <p className="mt-2 text-sm text-slate-700">
            A complete registry of all wires, facilitating point-to-point tracing and troubleshooting.
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
                      Wire No
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                      Signal Name
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                      Description
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                      Type
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Trace</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {wires.map((wire) => (
                    <tr key={wire.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 sm:pl-6">
                        {wire.wire_no}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                        <span className="font-mono bg-slate-100 px-1 rounded">{wire.signal_name}</span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">{wire.description}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                          {wire.type}
                        </span>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <Link href={`/wires/${wire.id}`} className="text-blue-600 hover:text-blue-900">
                          Trace<span className="sr-only">, {wire.wire_no}</span>
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
