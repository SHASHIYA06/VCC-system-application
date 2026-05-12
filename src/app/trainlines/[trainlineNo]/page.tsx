import Link from 'next/link';
import { TRAINLINE_REGISTRY, EQUIPMENT_REGISTRY, VCC_DRAWING_REGISTRY } from '@/types/index';
import { ArrowLeft, Zap, AlertTriangle, Info, ChevronRight } from 'lucide-react';

interface TrainlineCrossing {
  type: 'crossed' | 'jumper' | 'loop';
  from: string;
  to: string;
  description: string;
}

const TRAINLINE_CROSSINGS: Record<number, TrainlineCrossing[]> = {
  3005: [{ type: 'crossed', from: 'X1 pin 19', to: 'X1 pin 20', description: 'Crossed with 3006 - Powering 2 loop' }],
  3006: [{ type: 'crossed', from: 'X1 pin 20', to: 'X1 pin 19', description: 'Crossed with 3005 - Powering 1 loop' }],
  6009: [{ type: 'jumper', from: 'Jumper 43', to: 'Jumper 44', description: 'Left door open crossed with 6046 at jumper positions' }],
  6046: [{ type: 'jumper', from: 'Jumper 43', to: 'Jumper 44', description: 'Right door open crossed with 6009 at jumper positions' }],
  6014: [{ type: 'jumper', from: 'Jumper 46', to: 'Jumper 47', description: 'Left door close crossed with 6051 at jumper positions' }],
  6051: [{ type: 'jumper', from: 'Jumper 46', to: 'Jumper 47', description: 'Right door close crossed with 6014 at jumper positions' }],
  4024: [{ type: 'loop', from: 'BCU/BECU', to: 'All cars', description: 'Brake loop normal - runs through all cars' }],
  4062: [{ type: 'loop', from: 'EBMV/EBSS', to: 'All cars', description: 'Emergency brake loop normal - failsafe redundant path' }],
  4103: [{ type: 'loop', from: 'EBMV/EBSS', to: 'All cars', description: 'Emergency brake loop redundant - secondary failsafe path' }],
  4122: [{ type: 'loop', from: 'PBMV/PBPS', to: 'DMC/MC', description: 'Parking brake applied - DMC and MC cars' }],
  4153: [{ type: 'loop', from: 'PBMV/PBPS', to: 'DMC/MC', description: 'Parking brake released - DMC and MC cars' }],
};

function getVoltageColor(domain: string): string {
  if (domain.includes('750') || domain.includes('415') || domain.includes('230')) return 'text-red-600 bg-red-50';
  if (domain.includes('110')) return 'text-amber-600 bg-amber-50';
  return 'text-slate-600 bg-slate-50';
}

function getSystemForTrainline(trainlineNo: number): string {
  const trainline = TRAINLINE_REGISTRY[trainlineNo];
  return trainline?.system_id || 'GEN';
}

function getRelatedDrawings(systemCode: string) {
  return Object.values(VCC_DRAWING_REGISTRY)
    .filter(d => d.system_code === systemCode)
    .slice(0, 3);
}

function getCrossingWarning(trainlineNo: number) {
  const crossings = TRAINLINE_CROSSINGS[trainlineNo];
  if (!crossings) return null;
  return crossings[0];
}

export default async function TrainlineDetailPage({ params }: { params: { trainlineNo: string } }) {
  const trainlineNo = parseInt(params.trainlineNo);
  const trainline = TRAINLINE_REGISTRY[trainlineNo];

  if (!trainline) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/trainlines" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 mb-6">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Trainlines
          </Link>
          <div className="rounded-lg border border-slate-200 bg-white shadow-sm p-12 text-center">
            <Zap className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-lg font-medium text-slate-900">Trainline Not Found</h3>
            <p className="mt-2 text-sm text-slate-500">
              Trainline {trainlineNo} is not in the registry. It may not be defined in the VCC documents.
            </p>
            <Link href="/trainlines" className="mt-6 inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">
              Browse All Trainlines
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const systemCode = trainline.system_id;
  const crossing = getCrossingWarning(trainlineNo);
  const relatedDrawings = getRelatedDrawings(systemCode);

  const relatedTrainlines = Object.values(TRAINLINE_REGISTRY)
    .filter(t => t.system_id === systemCode && t.trainline_no !== trainlineNo)
    .slice(0, 8);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/trainlines" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500 mb-6">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Trainlines
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
              <span className="text-xl font-bold">{trainlineNo}</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold leading-tight text-slate-900">{trainline.name}</h1>
              <p className="mt-1 text-slate-600">{trainline.description}</p>
            </div>
          </div>
        </div>

        {crossing && (
          <div className={`rounded-lg border p-4 mb-8 ${crossing.type === 'crossed' ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'}`}>
            <div className="flex items-start gap-3">
              <AlertTriangle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${crossing.type === 'crossed' ? 'text-amber-600' : 'text-blue-600'}`} />
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  {crossing.type === 'crossed' ? 'Crossed Connection' : crossing.type === 'jumper' ? 'Jumper Position' : 'Loop Path'}
                </h3>
                <p className="mt-1 text-sm text-slate-700">{crossing.description}</p>
                <div className="mt-2 flex items-center gap-2 text-xs font-mono">
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200">{crossing.from}</span>
                  <span className="text-slate-400">→</span>
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200">{crossing.to}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
                <h2 className="text-base font-semibold leading-6 text-slate-900">Trainline Properties</h2>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <dl className="grid grid-cols-2 gap-x-4 gap-y-6">
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Trainline Number</dt>
                    <dd className="mt-1 text-sm text-slate-900 font-mono text-lg">{trainline.trainline_no}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Voltage Domain</dt>
                    <dd className="mt-1">
                      <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-sm font-medium ${getVoltageColor(trainline.voltage_domain)}`}>
                        {trainline.voltage_domain}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-slate-500">System</dt>
                    <dd className="mt-1 text-sm text-slate-900">
                      <Link href={`/systems/${systemCode}`} className="text-blue-600 hover:underline">
                        {systemCode}
                      </Link>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-slate-500">Cross-Connected</dt>
                    <dd className="mt-1 text-sm text-slate-900">
                      {trainline.is_cross_connected ? (
                        <span className="inline-flex items-center rounded bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
                          Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                          No
                        </span>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {crossing && (
              <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
                  <h2 className="text-base font-semibold leading-6 text-slate-900">Cross-Connection Details</h2>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 rounded-lg border border-slate-200 p-4 text-center">
                        <div className="text-xs font-medium text-slate-500 mb-1">FROM</div>
                        <div className="font-mono font-semibold text-slate-900">{crossing.from}</div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-400 flex-shrink-0" />
                      <div className="flex-1 rounded-lg border border-slate-200 p-4 text-center">
                        <div className="text-xs font-medium text-slate-500 mb-1">TO</div>
                        <div className="font-mono font-semibold text-slate-900">{crossing.to}</div>
                      </div>
                    </div>
                    <div className="rounded-lg bg-amber-50 p-3 border border-amber-100">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-amber-800">
                          <strong>Maintenance Note:</strong> When tracing or replacing wires on this trainline, ensure correct pin/wire assignment at both ends. Incorrect cross-connection can cause unintended trainline activation.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
                <h2 className="text-base font-semibold leading-6 text-slate-900">Related Trainlines in {systemCode}</h2>
              </div>
              <ul role="list" className="divide-y divide-slate-200">
                {relatedTrainlines.map(tl => (
                  <li key={tl.trainline_no} className="flex items-center justify-between gap-x-6 py-4 px-4 sm:px-6 hover:bg-slate-50">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-x-3">
                        <span className="inline-flex items-center justify-center w-12 h-8 rounded bg-slate-100 text-sm font-mono font-semibold text-slate-700">
                          {tl.trainline_no}
                        </span>
                        <span className="text-sm font-medium text-slate-900 truncate">{tl.name}</span>
                        {tl.is_cross_connected && (
                          <span className="inline-flex items-center rounded bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                            Crossed
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-slate-500 truncate">{tl.description}</p>
                    </div>
                    <Link
                      href={`/trainlines/${tl.trainline_no}`}
                      className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
                    >
                      View
                    </Link>
                  </li>
                ))}
                {relatedTrainlines.length === 0 && (
                  <li className="py-4 px-6 text-sm text-slate-500">No other trainlines in this system.</li>
                )}
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
                <h3 className="text-base font-semibold leading-6 text-slate-900">Related VCC Drawings</h3>
              </div>
              <ul role="list" className="divide-y divide-slate-200">
                {relatedDrawings.map(d => (
                  <li key={d.id} className="py-3 px-4 sm:px-6">
                    <Link href={`/drawings/${d.id}`} className="block hover:bg-slate-50 -mx-4 px-4 sm:px-6 py-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-mono font-medium text-blue-600">{d.drawing_no}</span>
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </div>
                      <p className="mt-1 text-xs text-slate-600 line-clamp-2">{d.title}</p>
                    </Link>
                  </li>
                ))}
                {relatedDrawings.length === 0 && (
                  <li className="py-4 px-6 text-sm text-slate-500">No drawings available.</li>
                )}
              </ul>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
                <h3 className="text-base font-semibold leading-6 text-slate-900">Wire Number Format</h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-32 h-16 rounded-lg bg-slate-100 border-2 border-dashed border-slate-300">
                    <span className="text-sm font-mono font-bold text-slate-600">XXXXX</span>
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Position 1-2:</span>
                    <span className="font-mono">Unit (00=device)</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Position 3:</span>
                    <span className="font-mono">Car Type</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Position 4:</span>
                    <span className="font-mono">Trainline (L/H)</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Position 5:</span>
                    <span className="font-mono">Serial</span>
                  </div>
                </div>
                <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-100">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-blue-700">
                      Wire numbers starting with "{trainlineNo.toString().charAt(0)}" indicate trainline {trainlineNo} connections.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
                <h3 className="text-base font-semibold leading-6 text-slate-900">Fleet Distribution</h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-center gap-3">
                  {['DMC', 'TC', 'MC', 'MC', 'TC', 'DMC'].map((car, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className={`w-10 h-14 rounded border-2 flex items-center justify-center text-xs font-bold ${
                        car === 'DMC' ? 'border-blue-300 bg-blue-50 text-blue-700' :
                        car === 'TC' ? 'border-green-300 bg-green-50 text-green-700' :
                        'border-orange-300 bg-orange-50 text-orange-700'
                      }`}>
                        {car}
                      </div>
                      <span className="mt-1 text-xs text-slate-500">#{i + 1}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-xs text-slate-500 text-center">
                  Trainlines run through all cars via X1/X2 inter-car jumpers
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}