export default function TcmsDetail({ params }: { params: { pointCode: string } }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold leading-6 text-slate-900">TCMS Point: {params.pointCode}</h1>
      <p className="mt-2 text-sm text-slate-700">Detail view for a specific TCMS I/O point.</p>
    </div>
  );
}
