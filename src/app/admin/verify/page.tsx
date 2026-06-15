import React from 'react';
import DrawingVerificationWorkflow from '@/components/admin/DrawingVerificationWorkflow';

export const metadata = {
  title: 'VCC Admin | Verify Topology',
};

export default function AdminVerifyPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Topology Verification Master</h1>
        <p className="text-slate-400">Step-by-step verification of OCR extraction mapping to ensure 100% accuracy of the Star & Branches model.</p>
      </div>
      
      <DrawingVerificationWorkflow />
    </div>
  );
}
