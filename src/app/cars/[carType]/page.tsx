export default function CarDetail({ params }: { params: { carType: string } }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold leading-6 text-slate-900">Car Dashboard: {params.carType.toUpperCase()}</h1>
      <p className="mt-2 text-sm text-slate-700">Specific equipment and connections inside this car type.</p>
    </div>
  );
}
