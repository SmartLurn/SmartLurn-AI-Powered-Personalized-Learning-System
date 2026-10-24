
import { Search } from "lucide-react";

export default function MaterialFilters({
  search,
  setSearch,
  selectedSubject,
  setSelectedSubject,
  subjects = [],
}) {
  return (
    <div className="mb-6 space-y-4">
      {/* Search bar */}
      <div className="flex items-center gap-3 rounded-xl border border-violet-100 bg-white px-4 py-3 shadow-sm">
        <Search size={20} className="shrink-0 text-slate-400" />

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by material title or subject..."
          className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
        />
      </div>

      {/* Subject filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="rounded-xl border border-violet-100 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-violet-400"
        >
          <option value="All">All Subjects</option>

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
