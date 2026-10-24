
import { useState } from "react";
import { X, Upload, FileText } from "lucide-react";

export default function UploadMaterialModal({
  isOpen,
  onClose,
  onUpload,
}) {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !subject.trim() || !file) {
      setError("Please enter a title, subject, and select a PDF.");
      return;
    }

    if (file.type !== "application/pdf") {
      setError("Only PDF files are supported.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("The PDF must be smaller than 10 MB.");
      return;
    }

    onUpload({
      title: title.trim(),
      subject: subject.trim(),
      description: description.trim(),
      file,
    });

    setTitle("");
    setSubject("");
    setDescription("");
    setFile(null);
    setError("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-material-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2
              id="upload-material-title"
              className="text-xl font-bold text-slate-800"
            >
              Upload Study Material
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Add a PDF to your SmartLurn library.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close upload modal"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="material-title"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Material title *
            </label>
            <input
              id="material-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Data Structures Notes"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              required
            />
          </div>

          <div>
            <label
              htmlFor="material-subject"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Subject *
            </label>
            <input
              id="material-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Computer Science"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              required
            />
          </div>

          <div>
            <label
              htmlFor="material-description"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Description
            </label>
            <textarea
              id="material-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What topics does this PDF cover?"
              rows={3}
              className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </div>

          <div>
            <label
              htmlFor="material-file"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              PDF file * (max 10 MB)
            </label>

            <label
              htmlFor="material-file"
              className="flex cursor-pointer flex-col items-center rounded-xl border border-dashed border-violet-200 bg-violet-50/50 px-4 py-6 text-center transition hover:bg-violet-50"
            >
              {file ? (
                <>
                  <FileText size={28} className="mb-2 text-violet-600" />
                  <span className="text-sm font-medium text-slate-800">
                    {file.name}
                  </span>
                  <span className="mt-1 text-xs text-slate-500">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB · Click to change
                  </span>
                </>
              ) : (
                <>
                  <Upload size={28} className="mb-2 text-violet-600" />
                  <span className="text-sm font-medium text-slate-700">
                    Choose a PDF file
                  </span>
                  <span className="mt-1 text-xs text-slate-500">
                    PDF format only
                  </span>
                </>
              )}
            </label>

            <input
              id="material-file"
              type="file"
              accept="application/pdf,.pdf"
              className="sr-only"
              onChange={(e) => {
                const selectedFile = e.target.files?.[0];

                if (!selectedFile) return;

                if (
                  selectedFile.type !== "application/pdf" &&
                  !selectedFile.name.toLowerCase().endsWith(".pdf")
                ) {
                  setFile(null);
                  setError("Please select a PDF file.");
                  e.target.value = "";
                  return;
                }

                if (selectedFile.size > 10 * 1024 * 1024) {
                  setFile(null);
                  setError("The PDF must be smaller than 10 MB.");
                  e.target.value = "";
                  return;
                }

                setFile(selectedFile);
                setError("");
              }}
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-medium text-white hover:bg-violet-700"
            >
              <Upload size={16} />
              Add Material
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
