"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Info } from 'lucide-react';

interface TrainlineTrace {
  trainline_no: string;
  description: string;
  cars: { carCode: string; connections: string[] }[];
}

export default function TrainlineTracePage() {
  const params = useParams();
  const trainlineNo = params.trainlineNo as string;
  const [trace, setTrace] = useState<TrainlineTrace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTrace() {
      try {
        const res = await fetch(`/api/trainlines/${trainlineNo}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        // Mock a trace structure for now
        const mockTrace: TrainlineTrace = {
          trainline_no: trainlineNo,
          description: data.trainline?.description || 'No description',
          cars: [
            { carCode: 'DMC', connections: ['3005', '3006'] },
            { carCode: 'TC', connections: ['3005'] },
            { carCode: 'MC', connections: ['3005', '3006'] },
            { carCode: 'MC', connections: ['3005', '3006'] },
            { carCode: 'TC', connections: ['3005'] },
            { carCode: 'DMC', connections: ['3005', '3006'] },
          ],
        };
        setTrace(mockTrace);
      } catch (e) {
        setError('Unable to load trainline trace.');
      } finally {
        setLoading(false);
      }
    }
    if (trainlineNo) fetchTrace();
  }, [trainlineNo]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error || !trace) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <Link href="/trainlines" className="inline-flex items-center text-blue-600 mb-4">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Trainlines
        </Link>
        <div className="bg-white rounded-lg shadow p-6">
          <Info className="h-6 w-6 text-red-500 mb-2" />
          <h2 className="text-xl font-semibold text-red-600">{error}</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link href="/trainlines" className="inline-flex items-center text-blue-600 mb-6">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Trainlines
        </Link>
        <div className="bg-white rounded-lg shadow border">
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white px-6 py-4">
            <h1 className="text-2xl font-bold">Trainline {trace.trainline_no} – Trace View</h1>
            <p className="mt-1 text-slate-300">{trace.description}</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              {trace.cars.map((car, idx) => (
                <div key={idx} className="bg-slate-50 rounded-lg p-4 border">
                  <h3 className="font-medium text-slate-700">Car {car.carCode}</h3>
                  <ul className="mt-2 list-disc list-inside text-sm text-slate-600">
                    {car.connections.map((c, i) => (
                      <li key={i}>Wire {c}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
