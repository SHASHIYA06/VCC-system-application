import Link from 'next/link';
import { supabase, hasValidSupabaseConfig } from '@/lib/supabase';
import { notFound } from 'next/navigation';

export default async function EquipmentDetailsPage({ params }: { params: { equipmentCode: string } }) {
  const id = params.equipmentCode;
  
  let equipment = {
    id: id,
    equipment_code: `EQ-${id}`,
    name: 'Mock Equipment',
    description: 'Detailed description of the equipment.',
    location: 'TC Cabinet',
    system_code: 'TMS',
    car_type: 'TC'
  };
  
  let connectors: { id: string; connector_code: string; type?: string; description?: string }[] = [
    { id: '1', connector_code: 'CN1', type: 'Plug', description: 'Power Input' },
    { id: '2', connector_code: 'CN2', type: 'Receptacle', description: 'Control Signals' }
  ];

  if (hasValidSupabaseConfig) {
    try {
      const { data: eqData, error: eqError } = await supabase
        .from('equipment')
        .select(`
          *,
          systems (code),
          car_types (code)
        `)
        .eq('id', id)
        .single();
        
      if (eqError || !eqData) {
         notFound();
      }
      
      equipment = {
        ...eqData,
        system_code: eqData.systems?.code || 'GEN',
        car_type: eqData.car_types?.code || 'ALL'
      };

      const { data: cnData } = await supabase
        .from('connectors')
        .select('id, connector_code, type, description')
        .eq('equipment_id', id);
        
      connectors = cnData || [];
    } catch (e) {
      console.error('Failed to fetch equipment details', e);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <Link href="/equipment" className="text-sm font-medium text-blue-600 hover:text-blue-500 mb-2 inline-block">
          &larr; Back to Equipment
        </Link>
        <div className="flex items-center gap-4 mt-2">
          <h1 className="text-3xl font-bold leading-tight text-slate-900">
            {equipment.equipment_code}
          </h1>
          <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-0.5 text-sm font-medium text-slate-800">
            {equipment.name}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Details Panel */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
              <h3 className="text-base font-semibold leading-6 text-slate-900">Equipment Details</h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-1">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-slate-500">System</dt>
                  <dd className="mt-1 text-sm text-slate-900">{equipment.system_code}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-slate-500">Car Type</dt>
                  <dd className="mt-1 text-sm text-slate-900">{equipment.car_type}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-slate-500">Location</dt>
                  <dd className="mt-1 text-sm text-slate-900">{equipment.location}</dd>
                </div>
                {equipment.description && (
                  <div className="sm:col-span-2 lg:col-span-1">
                    <dt className="text-sm font-medium text-slate-500">Description</dt>
                    <dd className="mt-1 text-sm text-slate-900">{equipment.description}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>

        {/* Connectors Panel */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
              <h3 className="text-base font-semibold leading-6 text-slate-900">Associated Connectors</h3>
            </div>
            <ul role="list" className="divide-y divide-slate-200">
              {connectors.length > 0 ? connectors.map((cn) => (
                <li key={cn.id} className="flex items-center justify-between gap-x-6 py-4 px-4 sm:px-6 hover:bg-slate-50">
                  <div className="min-w-0">
                    <div className="flex items-start gap-x-3">
                      <p className="text-sm font-semibold leading-6 text-slate-900">{cn.connector_code}</p>
                      <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
                        {cn.type}
                      </span>
                    </div>
                    {cn.description && (
                      <div className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-slate-500">
                        <p className="truncate">{cn.description}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-none items-center gap-x-4">
                    <Link
                      href={`/connectors/${cn.id}`}
                      className="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 sm:block"
                    >
                      View Pins
                    </Link>
                  </div>
                </li>
              )) : (
                <li className="py-4 px-6 text-sm text-slate-500">No connectors found for this equipment.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
