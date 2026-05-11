import Link from 'next/link';
import { supabase, hasValidSupabaseConfig } from '@/lib/supabase';

const mockEquipment = [
  { id: '1', equipment_code: 'DMC-BCU', name: 'Brake Control Unit', system_code: 'BRAKE', location: 'DMC', car_type: 'DMC' },
  { id: '2', equipment_code: 'TC-BECU', name: 'Brake Electronic Control Unit', system_code: 'BRAKE', location: 'TC', car_type: 'TC' },
  { id: '3', equipment_code: 'DMC-VVVF', name: 'Traction Inverter', system_code: 'TRAC', location: 'DMC', car_type: 'DMC' },
  { id: '4', equipment_code: 'TC-LTJB', name: 'Low Tension Junction Box', system_code: 'TRL', location: 'TC Underframe', car_type: 'TC' },
];

export default async function EquipmentRegister() {
  let equipment = mockEquipment;

  if (hasValidSupabaseConfig) {
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('id, equipment_code, name, location, systems(code), car_types(code)')
        .order('equipment_code');
      
      if (data && !error) {
        equipment = data.map((eq: any) => ({
          id: eq.id,
          equipment_code: eq.equipment_code,
          name: eq.name,
          location: eq.location || 'N/A',
          system_code: eq.systems?.code || 'GEN',
          car_type: eq.car_types?.code || 'ALL'
        }));
      }
    } catch (e) {
      console.error('Failed to fetch equipment from Supabase', e);
    }
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold leading-6 text-slate-900">Equipment Library</h1>
          <p className="mt-2 text-sm text-slate-700">
            A comprehensive list of all electrical and control equipment modules across the train.
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
                      Equipment Code
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                      Name
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                      System
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                      Car Type
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                      Location
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">View</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {equipment.map((eq) => (
                    <tr key={eq.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 sm:pl-6">
                        {eq.equipment_code}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">{eq.name}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                          {eq.system_code}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">{eq.car_type}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">{eq.location}</td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <Link href={`/equipment/${eq.id}`} className="text-blue-600 hover:text-blue-900">
                          View<span className="sr-only">, {eq.equipment_code}</span>
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
