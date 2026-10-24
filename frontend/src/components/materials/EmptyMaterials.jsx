
import { BookOpen, Upload } from "lucide-react";

export default function EmptyMaterials({ onUpload }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-violet-200 bg-white px-6 py-16 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
        <BookOpen size={32} />
      </div>

      <h2 className="text-xl font-semibold text-slate-800">
        No study materials yet
      </h2>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        Your library is empty. Upload your first PDF to organize
        your notes and use SmartLurn's AI-powered study tools.
      </p>

      <button
        type="button"
        onClick={onUpload}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-medium text-white transition hover:bg-violet-700"
      >
        <Upload size={18} />
        Upload Your First Material
      </button>
    </div>
  );
}
