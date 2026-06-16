import React from 'react';
import DrawingVerificationWorkflow from '@/components/admin/DrawingVerificationWorkflow';
import SyncEngineDashboard from '@/components/admin/SyncEngineDashboard';

export const metadata = {
  title: 'VCC Admin | Verify Topology',
};

export default function AdminVerifyPage() {
  return (
    <div className="p-6 space-y-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Topology Verification & Sync Master</h1>
        <p className="text-slate-400">Step-by-step verification and real-time database indexing to ensure 100% accuracy of the Galaxy Topology model.</p>
      </div>

      <SyncEngineDashboard />
      
      <DrawingVerificationWorkflow />
    </div>
  );
}
