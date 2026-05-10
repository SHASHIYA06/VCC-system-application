interface SystemCardProps {
  systemCode: string;
  name: string;
  description: string;
  status: string;
  drawingCount: number;
  pinCount: number;
  colorTheme: 'green' | 'yellow' | 'blue';
}

export default function SystemCard({ systemCode, name, description, status, drawingCount, pinCount, colorTheme }: SystemCardProps) {
  const themeClasses = {
    green: "bg-green-50 text-green-700 ring-green-600/20",
    yellow: "bg-yellow-50 text-yellow-800 ring-yellow-600/20",
    blue: "bg-blue-50 text-blue-700 ring-blue-700/10"
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="text-base font-semibold text-slate-900">{name} ({systemCode})</h4>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${themeClasses[colorTheme]}`}>
          {status}
        </span>
      </div>
      <div className="mt-4 flex gap-4 text-sm">
        <div className="flex flex-col">
          <span className="text-slate-500">Drawings</span>
          <span className="font-medium text-slate-900">{drawingCount}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-slate-500">Items (Pins/Crossings)</span>
          <span className="font-medium text-slate-900">{pinCount}</span>
        </div>
      </div>
    </div>
  );
}
