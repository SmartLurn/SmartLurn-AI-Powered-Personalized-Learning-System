
import { Search } from "lucide-react";

export default function MaterialFilters({
  search,
  setSearch,
  selectedSubject,
  setSelectedSubject,
  subjects = [],
}) {
  return (
    <div className="mb-6 flex animate-fade-up flex-col gap-3 sm:flex-row" style={{ animationDelay: "60ms" }}>
      {/* Search bar */}
      <div className="flex h-11 flex-1 items-center gap-3 rounded-lg border border-slate-200 bg-white px-3.5 transition focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-50">
        <Search size={17} className="shrink-0 text-slate-400" />

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by material title or subject..."
          className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
        />
      </div>

      {/* Subject filter */}
      <div>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          aria-label="Filter by subject"
          className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-700 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-50 sm:w-52"
        >
          <option value="All">All subjects</option>

          {subjects.map((subject) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
