
import {
  BookOpen,
  FileText,
  MessageCircle,
  ExternalLink,
  Brain,
  CalendarDays,
} from "lucide-react";

export default function MaterialCard({
  material,
  onAskAI,
  onOpenPDF,
  onStartQuiz,
}) {
  const formattedDate = new Date(
    material.uploadedAt
  ).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <article className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
      {/* File icon and type */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
          <FileText size={24} />
        </div>

        <span className="rounded-lg bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
          {material.fileType}
        </span>
      </div>

      {/* Material information */}
      <h2 className="text-lg font-semibold text-slate-800">
        {material.title}
      </h2>

      <p className="mt-1 text-sm font-medium text-violet-600">
        {material.subject}
      </p>

      <p className="mt-3 min-h-10 text-sm leading-5 text-slate-500">
        {material.description || "No description provided."}
      </p>

      {/* File metadata */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-400">
        <span>{material.fileSize || "Size unavailable"}</span>

        <span className="flex items-center gap-1">
          <CalendarDays size={14} />
          {formattedDate}
        </span>
      </div>

      {/* Actions */}
      <div className="mt-5 grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => onAskAI(material)}
          className="flex items-center justify-center gap-1 rounded-lg bg-violet-600 px-2 py-2.5 text-xs font-medium text-white transition hover:bg-violet-700"
        >
          <MessageCircle size={14} />
          Ask AI
        </button>

        <button
          type="button"
          onClick={() => onOpenPDF(material)}
          className="flex items-center justify-center gap-1 rounded-lg border border-violet-200 px-2 py-2.5 text-xs font-medium text-violet-700 transition hover:bg-violet-50"
        >
          <ExternalLink size={14} />
          Open PDF
        </button>

        <button
          type="button"
          onClick={() => onStartQuiz(material)}
          className="flex items-center justify-center gap-1 rounded-lg border border-slate-200 px-2 py-2.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <Brain size={14} />
          Quiz
        </button>
      </div>
    </article>
  );
}
