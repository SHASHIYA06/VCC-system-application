export default function GlobalSearch() {
  return (
    <div className="w-full">
      <label htmlFor="search-field" className="sr-only">
        Search
      </label>
      <input
        id="search-field"
        className="block h-10 w-full border border-slate-200 py-0 pl-4 pr-0 text-slate-900 placeholder:text-slate-400 focus:ring-1 focus:ring-blue-500 sm:text-sm bg-slate-50 rounded-md shadow-sm"
        placeholder="Search wire, trainline, drawing, or equipment..."
        type="search"
        name="search"
      />
    </div>
  );
}
