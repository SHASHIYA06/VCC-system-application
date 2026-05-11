import Link from 'next/link';
import { supabase, hasValidSupabaseConfig } from '@/lib/supabase';

// Mock data fallback if Supabase is not configured
const mockDrawings = [
  { id: '1', drawing_no: '942-58103', title: 'Train Lines Control', system_code: 'TRL', status: 'active', current_revision: 'A' },
  { id: '2', drawing_no: '942-58124', title: 'Brake Loop', system_code: 'BRAKE', status: 'active', current_revision: 'C' },
  { id: '3', drawing_no: '942-58130', title: 'APS - Auxiliary Power Supply', system_code: 'APS', status: 'active', current_revision: 'B' },
  { id: '4', drawing_no: '942-38305', title: 'LTEB Pin Assignment - DMC', system_code: 'LTEB', status: 'active', current_revision: '0' },
  { id: '5', drawing_no: '942-38409', title: 'TCMS RIO Pin Assignment - TC', system_code: 'TMS', status: 'active', current_revision: '2' },
];

export default async function DrawingsRegister() {
  let drawings = mockDrawings;

  if (hasValidSupabaseConfig) {
    try {
      const { data, error } = await supabase
        .from('drawings')
        .select('id, drawing_no, title, current_revision, status, systems(code)')
        .order('drawing_no');
      
      if (data && !error) {
        drawings = data.map((d: any) => ({
          id: d.id,
          drawing_no: d.drawing_no,
          title: d.title,
          current_revision: d.current_revision || 'N/A',
          status: d.status || 'active',
          system_code: d.systems?.code || 'GEN'
        }));
      }
    } catch (e) {
      console.error('Failed to fetch from Supabase', e);
    }
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold leading-6 text-slate-900">Master Drawing Register</h1>
          <p className="mt-2 text-sm text-slate-700">
            A complete list of all VCC circuit diagrams and pin assignments in the KMRCL RS3R project.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          {!hasValidSupabaseConfig && (
            <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20 mr-4">
              Using Mock Data (Supabase not configured)
            </span>
          )}
          <button
            type="button"
            className="block rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Add Document
          </button>
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
                      Drawing No
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                      Title
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                      System
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                      Revision
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                      Status
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">View</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {drawings.map((drawing) => (
                    <tr key={drawing.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 sm:pl-6">
                        {drawing.drawing_no}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">{drawing.title}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                          {drawing.system_code}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">{drawing.current_revision}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                        <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                          {drawing.status}
                        </span>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <Link href={`/drawings/${drawing.id}`} className="text-blue-600 hover:text-blue-900">
                          View<span className="sr-only">, {drawing.drawing_no}</span>
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
