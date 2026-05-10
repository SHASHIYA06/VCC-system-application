export default function RecentUpdates() {
  const updates = [
    { id: 1, text: 'Updated Drawing 942-58103 to Revision B', date: '2 hours ago' },
    { id: 2, text: 'Added 120 new pins for TCMS system', date: '5 hours ago' },
    { id: 3, text: 'Verified Brake Loop wire TR1-01', date: '1 day ago' },
  ];

  return (
    <div className="mt-8 rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
        <h3 className="text-base font-semibold leading-6 text-slate-900">Recent Updates</h3>
      </div>
      <ul role="list" className="divide-y divide-slate-200">
        {updates.map((update) => (
          <li key={update.id} className="px-4 py-4 sm:px-6 hover:bg-slate-50">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium text-slate-900">{update.text}</p>
              <p className="text-sm text-slate-500">{update.date}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
