import Link from 'next/link';
import { ArrowLeft, FileText, Cable, Cpu } from 'lucide-react';
import { supabase, hasValidSupabaseConfig } from '@/lib/supabase';

export default async function DrawingDetail({ params }: { params: { id: string } }) {
  const { id } = params;

  // Mock data fallback
  let drawing = {
    id,
    drawing_no: id === '1' ? '942-58103' : '942-38409',
    title: id === '1' ? 'Train Lines Control' : 'TCMS RIO Pin Assignment - TC',
    system_code: id === '1' ? 'TRL' : 'TMS',
    status: 'active',
    current_revision: id === '1' ? 'A' : '2',
    notes: 'Master schematic for trainline loops and controls',
    pins: [
      { id: 'p1', pin_no: '1A', signal_name: 'DOOR_OPEN_CMD', connector_code: 'CN1', equipment_code: 'TCMS_RIO1' },
      { id: 'p2', pin_no: '1B', signal_name: 'DOOR_CLOSE_CMD', connector_code: 'CN1', equipment_code: 'TCMS_RIO1' },
    ]
  };

  if (hasValidSupabaseConfig) {
    try {
      const { data, error } = await supabase
        .from('drawings')
        .select(`
          *,
          systems(code),
          connectors(
            connector_code,
            equipment(equipment_code),
            pins(id, pin_no, signal_name)
          )
        `)
        .eq('id', id)
        .single();
      
      if (data && !error) {
        // Flatten the pins for display
        const allPins = data.connectors?.flatMap((c: { connector_code: string; equipment?: { equipment_code?: string }; pins?: { id: string; pin_number: string; signal_name?: string; description?: string }[] }) => 
          c.pins?.map((p: { id: string; pin_number: string; signal_name?: string; description?: string }) => ({
            ...p,
            connector_code: c.connector_code,
            equipment_code: c.equipment?.equipment_code || 'N/A'
          }))
        ) || [];

        drawing = {
          ...data,
          system_code: data.systems?.code || 'GEN',
          pins: allPins
        };
      }
    } catch (e) {
      console.error('Failed to fetch drawing details', e);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/drawings" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Register
        </Link>
      </div>

      <div className="overflow-hidden bg-white shadow sm:rounded-lg mb-8">
        <div className="px-4 py-6 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold leading-7 text-slate-900">{drawing.drawing_no}</h3>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">{drawing.title}</p>
            </div>
            <div className="flex space-x-3">
              <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                System: {drawing.system_code}
              </span>
              <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                Rev: {drawing.current_revision}
              </span>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-100">
          <dl className="divide-y divide-slate-100">
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-slate-900">Notes / Remarks</dt>
              <dd className="mt-1 text-sm leading-6 text-slate-700 sm:col-span-2 sm:mt-0">
                {drawing.notes || 'No notes available.'}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Pins and Signals Table */}
      <div className="mt-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h2 className="text-lg font-semibold leading-6 text-slate-900">Assigned Pins & Signals</h2>
            <p className="mt-2 text-sm text-slate-700">
              List of all physical pins, wires, and signals defined in this drawing.
            </p>
          </div>
        </div>
        <div className="mt-4 flow-root">
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
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Trace</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {drawing.pins.map((pin) => (
                      <tr key={pin.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 sm:pl-6 flex items-center">
                          <Cpu className="mr-2 h-4 w-4 text-slate-400" />
                          {pin.equipment_code}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">{pin.connector_code}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm font-semibold text-slate-700">{pin.pin_no}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">{pin.signal_name}</td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button className="text-blue-600 hover:text-blue-900 inline-flex items-center">
                            <Cable className="mr-1 h-4 w-4" /> Trace
                          </button>
                        </td>
                      </tr>
                    ))}
                    {drawing.pins.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-sm text-slate-500">
                          No pins recorded for this drawing yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
