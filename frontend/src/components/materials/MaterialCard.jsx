import { ClipboardList, ExternalLink, FileText, MessageSquareText, Trash2 } from "lucide-react";

// Each subject always gets the same soft colour
const SUBJECT_TINTS = [
  "bg-brand-50 text-brand-700",
  "bg-sky-50 text-sky-700",
  "bg-amber-50 text-amber-700",
  "bg-emerald-50 text-emerald-700",
  "bg-rose-50 text-rose-700",
  "bg-violet-50 text-violet-700",
];

const subjectTint = (subject = "") => {
  let hash = 0;
  for (const char of subject) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return SUBJECT_TINTS[hash % SUBJECT_TINTS.length];
};

export default function MaterialCard({ material, onAskAI, onOpenPDF, onStartQuiz, onDelete }) {
  const formattedDate = new Date(material.uploadedAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <article className="group card-hover flex animate-fade-up flex-col rounded-2xl border border-slate-200/80 bg-surface p-5">
      {/* File icon, subject and quick actions */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="relative flex h-12 w-10 shrink-0 items-end justify-center rounded-md border border-slate-200 bg-surface pb-1.5 shadow-sm">
          {/* Folded corner */}
          <span className="absolute right-0 top-0 h-3 w-3 rounded-bl-sm border-b border-l border-slate-200 bg-slate-50" />
          <FileText size={16} className="absolute left-1/2 top-2.5 -translate-x-1/2 text-slate-300" />
          <span className="rounded-sm bg-rose-500 px-1 text-[8px] font-bold leading-3 text-white">
            {material.fileType || "PDF"}
          </span>
        </div>

        <div className="flex items-center gap-0.5 sm:opacity-0 sm:transition sm:group-hover:opacity-100 sm:focus-within:opacity-100">
          <button
            type="button"
            onClick={() => onOpenPDF(material)}
            title="Open PDF"
            aria-label={`Open ${material.title}`}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <ExternalLink size={16} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(material)}
            title="Delete material"
            aria-label={`Delete ${material.title}`}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Material information */}
      <span className={`mb-2 self-start rounded-md px-2 py-0.5 text-[11px] font-medium ${subjectTint(material.subject)}`}>
        {material.subject}
      </span>

      <h2 className="line-clamp-2 text-[15px] font-semibold leading-snug text-slate-900">{material.title}</h2>

      <p className="mt-1.5 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">
        {material.description || "No description added."}
      </p>

      <p className="mt-4 text-xs text-slate-400">
        {material.fileSize || "Size unavailable"} · {formattedDate}
      </p>

      {/* Actions */}
      <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={() => onAskAI(material)}
          className="press flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-cta px-3 py-2 text-sm font-medium text-on-cta hover:bg-cta-hover"
        >
          <MessageSquareText size={15} />
          Ask AI
        </button>

        <button
          type="button"
          onClick={() => onStartQuiz(material)}
          className="press flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <ClipboardList size={15} />
          Quiz
        </button>
      </div>
    </article>
  );
}
