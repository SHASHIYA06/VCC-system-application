import Link from 'next/link';
import { supabase, hasValidSupabaseConfig } from '@/lib/supabase';

const mockConnectors = [
  { id: '1', connector_code: 'CN1', equipment_code: 'DMC-BCU', type: 'Plug' },
  { id: '2', connector_code: 'CN2', equipment_code: 'TC-BECU', type: 'Receptacle' },
  { id: '3', connector_code: 'CN3', equipment_code: 'DMC-VVVF', type: 'Terminal Block' },
];

export default async function ConnectorsRegister() {
  let connectors = mockConnectors;

  if (hasValidSupabaseConfig) {
    try {
      const { data, error } = await supabase
        .from('connectors')
        .select('id, connector_code, type, equipment(equipment_code)')
        .order('connector_code');
      
      if (data && !error) {
        connectors = data.map((cn: any) => ({
          id: cn.id,
          connector_code: cn.connector_code,
          type: cn.type || 'N/A',
          equipment_code: cn.equipment?.equipment_code || 'N/A',
        }));
      }
    } catch (e) {
      console.error('Failed to fetch connectors from Supabase', e);
    }
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold leading-6 text-slate-900">Connector Library</h1>
          <p className="mt-2 text-sm text-slate-700">
            A comprehensive list of all connectors and terminal blocks.
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
                      Connector Code
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                      Equipment
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                      Type
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">View</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {connectors.map((cn) => (
                    <tr key={cn.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 sm:pl-6">
                        {cn.connector_code}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                        {cn.equipment_code}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">{cn.type}</td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <Link href={`/connectors/${cn.id}`} className="text-blue-600 hover:text-blue-900">
                          View<span className="sr-only">, {cn.connector_code}</span>
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
