export default function TrainlineDetail({ params }: { params: { trainlineNo: string } }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold leading-6 text-slate-900">Trainline: {params.trainlineNo}</h1>
      <p className="mt-2 text-sm text-slate-700">Detail view for a specific trainline crossing.</p>
    </div>
  );
}
