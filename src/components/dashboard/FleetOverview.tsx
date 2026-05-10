export default function FleetOverview() {
  return (
    <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-medium leading-6 text-slate-900 mb-4">Fleet Formation Overview</h3>
      <div className="flex items-center justify-between border border-slate-200 rounded-md p-4 bg-slate-50">
        <div className="flex items-center flex-col">
          <div className="bg-slate-300 w-32 h-16 rounded flex items-center justify-center font-bold text-slate-700 border-2 border-slate-400">DMC</div>
          <span className="text-xs mt-2 text-slate-500">Car 1</span>
        </div>
        <div className="h-0.5 w-full bg-slate-300 mx-2 relative">
          <div className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 text-xs bg-slate-50 px-1 text-slate-400">Coupler</div>
        </div>
        <div className="flex items-center flex-col">
          <div className="bg-slate-300 w-32 h-16 rounded flex items-center justify-center font-bold text-slate-700 border-2 border-slate-400">TC</div>
          <span className="text-xs mt-2 text-slate-500">Car 2</span>
        </div>
        <div className="h-0.5 w-full bg-slate-300 mx-2 relative">
          <div className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 text-xs bg-slate-50 px-1 text-slate-400">Coupler</div>
        </div>
        <div className="flex items-center flex-col">
          <div className="bg-slate-300 w-32 h-16 rounded flex items-center justify-center font-bold text-slate-700 border-2 border-slate-400">DMC</div>
          <span className="text-xs mt-2 text-slate-500">Car 3</span>
        </div>
      </div>
    </div>
  );
}
