import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ExternalLink, FileText, GraduationCap, Quote, Send, Upload } from "lucide-react";
import toast from "react-hot-toast";
import api from "../config/api";
import aiApi, { getAiError } from "../config/aiApi";
import Loader from "../components/Loader";
import PageHeader from "../components/PageHeader";

const SUGGESTED_QUESTIONS = [
  "Summarize this material in simple words",
  "What are the key concepts I should know?",
  "Give me 5 practice questions with answers",
];

const EXACT_WORDING_EXAMPLES = [
  "Give the exact definition of normalization",
  "What is the original wording for 3NF?",
  "Quote the PDF on primary keys",
];

// Show **bold** text from the AI answer as real bold text
function BoldText({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, index) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={index}>{part.slice(2, -2)}</strong>
    ) : (
      <span key={index}>{part}</span>
    )
  );
}

// Lines starting with "> " are exact quotes from the PDF: show them as a quote block
function FormattedText({ text }) {
  const blocks = [];

  text.split("\n").forEach((line) => {
    const isQuote = line.startsWith(">");
    const content = isQuote
      ? line.replace(/^>\s?/, "")
      : line.replace(/^(\s*)[*-]\s+/, "$1• "); // "*   item" -> "• item"
    const last = blocks[blocks.length - 1];

    // Join neighbouring lines of the same kind into one block
    if (last && last.isQuote === isQuote) {
      last.lines.push(content);
    } else {
      blocks.push({ isQuote, lines: [content] });
    }
  });

  return blocks.map((block, index) =>
    block.isQuote ? (
      <blockquote
        key={index}
        className="my-2 rounded-r-lg border-l-4 border-brand-400 bg-surface px-3 py-2 italic text-slate-800"
      >
        <BoldText text={block.lines.join("\n")} />
      </blockquote>
    ) : (
      <span key={index}>
        <BoldText text={block.lines.join("\n")} />
      </span>
    )
  );
}

export default function AIAssistant() {
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const messagesBoxRef = useRef(null);

  const [materials, setMaterials] = useState([]);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(true);

  // The PDF being discussed: { key, title, material?, file? }
  const [selected, setSelected] = useState(null);
  const [documentId, setDocumentId] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoadingDocument, setIsLoadingDocument] = useState(false);

  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [isAsking, setIsAsking] = useState(false);

  // Send the PDF to the AI service and get back a document id
  const loadDocument = async (source) => {
    if (source.file) {
      const formData = new FormData();
      formData.append("file", source.file);
      const { data } = await aiApi.post("/pdf/upload", formData);
      return data;
    }

    const { data } = await aiApi.post("/pdf/load", {
      file_url: source.material.fileUrl,
      title: source.material.title,
    });
    return data;
  };

  const selectSource = async (source) => {
    setSelected(source);

    setDocumentId(null);
    setMessages([]);
    setIsLoadingDocument(true);

    try {
      const data = await loadDocument(source);
      setDocumentId(data.document_id);
      setTotalPages(data.total_pages);
    } catch (error) {
      toast.error(getAiError(error, "Could not read this PDF"));
      setSelected(null);
    } finally {
      setIsLoadingDocument(false);
    }
  };

  // Load the user's materials, then open the one sent from the Materials page (if any)
  useEffect(() => {
    const loadMaterials = async () => {
      let list = [];

      try {
        const { data } = await api.get("/materials");
        list = data.materials;
        setMaterials(list);
      } catch (error) {
        toast.error(error.response?.data?.message || "Could not load materials");
      } finally {
        setIsLoadingMaterials(false);
      }

      const fromMaterials = location.state;
      if (fromMaterials?.materialId) {
        const material =
          list.find((m) => m.id === fromMaterials.materialId) || {
            id: fromMaterials.materialId,
            title: fromMaterials.title,
            fileUrl: fromMaterials.fileUrl,
          };

        selectSource({ key: `material-${material.id}`, title: material.title, material });

        // A question typed on the dashboard: put it in the box, ready to send
        if (fromMaterials.question) setQuestion(fromMaterials.question);

        // Clear the state so a page refresh doesn't reload it
        navigate(location.pathname, { replace: true, state: null });
      }
    };

    loadMaterials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the newest message in view (scroll only the chat box, not the whole page)
  useEffect(() => {
    const box = messagesBoxRef.current;
    if (box) box.scrollTo({ top: box.scrollHeight, behavior: "smooth" });
  }, [messages, isAsking]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow choosing the same file again

    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are supported.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("The PDF must be smaller than 10 MB.");
      return;
    }

    selectSource({ key: `file-${file.name}-${file.size}`, title: file.name, file });
  };

  const askQuestion = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || !documentId || isAsking) return;

    const history = messages;
    setMessages([...history, { role: "user", content: trimmed }]);
    setQuestion("");
    setIsAsking(true);

    const send = (id) =>
      aiApi.post("/chat/ask", { document_id: id, question: trimmed, history });

    try {
      let response;

      try {
        response = await send(documentId);
      } catch (error) {
        // The AI service restarted and forgot the PDF: load it again and retry once
        if (error.response?.status !== 404) throw error;

        const data = await loadDocument(selected);
        setDocumentId(data.document_id);
        response = await send(data.document_id);
      }

      setMessages((previous) => [
        ...previous,
        { role: "assistant", content: response.data.answer },
      ]);
    } catch (error) {
      const message = getAiError(error, "Could not get an answer");
      toast.error(message);
      setMessages((previous) => [
        ...previous,
        { role: "assistant", content: message, isError: true },
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    askQuestion(question);
  };

  // Enter sends, Shift+Enter adds a new line
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      askQuestion(question);
    }
  };

  const canAsk = Boolean(documentId) && !isLoadingDocument && !isAsking;

  // Details for the right-hand panel
  const selectedInfo = selected?.material
    ? { subject: selected.material.subject, size: selected.material.fileSize, url: selected.material.fileUrl }
    : selected?.file
    ? { subject: "Uploaded for this chat", size: `${(selected.file.size / (1024 * 1024)).toFixed(2)} MB`, url: null }
    : null;

  return (
    <div className="mx-auto flex max-w-[1440px] flex-col px-4 py-5 sm:px-6 lg:h-[calc(100dvh-4rem)] lg:px-8">
      <PageHeader
        title="AI study assistant"
        description="Pick a PDF and ask about it. Answers come only from your material, with page numbers."
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 lg:grid-cols-[272px_1fr] xl:grid-cols-[272px_1fr_272px]">
        {/* Left: materials */}
        <aside
          className="hidden animate-fade-up flex-col rounded-2xl border border-slate-200/80 bg-surface lg:flex lg:min-h-0"
          style={{ animationDelay: "60ms" }}
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
            <h2 className="text-sm font-semibold text-slate-900">Materials</h2>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoadingDocument}
              className="press inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <Upload size={14} />
              Upload
            </button>
          </div>

          <div className="max-h-64 flex-1 overflow-y-auto p-2 lg:max-h-none">
            {isLoadingMaterials ? (
              <Loader text="" />
            ) : materials.length === 0 ? (
              <div className="m-2 rounded-xl border border-dashed border-slate-200 p-4 text-center text-sm text-slate-500">
                No materials yet. Upload a PDF to start a chat.
              </div>
            ) : (
              <ul className="space-y-0.5">
                {materials.map((material) => {
                  const key = `material-${material.id}`;
                  const isActive = selected?.key === key;

                  return (
                    <li key={material.id}>
                      <button
                        type="button"
                        disabled={isLoadingDocument}
                        onClick={() => !isActive && selectSource({ key, title: material.title, material })}
                        className={`relative flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-left transition disabled:cursor-not-allowed ${
                          isActive ? "bg-brand-50" : "hover:bg-slate-50"
                        }`}
                      >
                        {isActive && <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-pop-500" />}
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                            isActive ? "bg-surface text-brand-600 ring-1 ring-brand-100" : "bg-rose-50 text-rose-600"
                          }`}
                        >
                          <FileText size={16} />
                        </span>
                        <span className="min-w-0">
                          <span className={`block truncate text-sm font-medium ${isActive ? "text-brand-700" : "text-slate-800"}`}>
                            {material.title}
                          </span>
                          <span className="block truncate text-xs text-slate-400">
                            {material.subject} · {material.fileSize}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>

        {/* Middle: chat */}
        <section
          className="flex h-[78dvh] min-h-[440px] scroll-mt-20 animate-fade-up flex-col rounded-2xl border border-slate-200/80 bg-surface lg:h-auto lg:min-h-0"
          style={{ animationDelay: "120ms" }}
        >
          {/* Chat header */}
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-3.5">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">
                {selected ? selected.title : "New chat"}
              </p>
              <p className="text-xs text-slate-500">
                {isLoadingDocument
                  ? "Reading PDF..."
                  : documentId
                  ? `${totalPages} pages · answers cite page numbers`
                  : "Choose a material to start"}
              </p>
            </div>
            {selected && (
              <span
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                  documentId ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${documentId ? "bg-emerald-500" : "animate-pulse bg-amber-500"}`} />
                {documentId ? "Ready" : "Reading"}
              </span>
            )}
          </div>

          {/* Phones: small material picker and upload, inside the chat */}
          <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-2.5 lg:hidden">
            <select
              value={selected?.material ? selected.key : ""}
              onChange={(e) => {
                const material = materials.find((m) => `material-${m.id}` === e.target.value);
                if (material) selectSource({ key: e.target.value, title: material.title, material });
              }}
              disabled={isLoadingDocument || isLoadingMaterials}
              aria-label="Choose a material"
              className="h-9 min-w-0 flex-1 rounded-lg border border-slate-200 bg-surface px-2.5 text-sm text-slate-700 outline-none focus:border-pop-400"
            >
              <option value="" disabled>
                {isLoadingMaterials ? "Loading materials..." : materials.length ? "Choose a material..." : "No materials yet"}
              </option>
              {materials.map((material) => (
                <option key={material.id} value={`material-${material.id}`}>
                  {material.title}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoadingDocument}
              className="press inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <Upload size={14} />
              PDF
            </button>
          </div>

          {/* Messages */}
          <div ref={messagesBoxRef} className="flex-1 space-y-5 overflow-y-auto px-5 py-6">
            {isLoadingDocument ? (
              <Loader text="Reading your PDF..." />
            ) : !documentId ? (
              <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-400 ring-1 ring-slate-200">
                  <FileText size={22} />
                </div>
                <p className="font-medium text-slate-800">Ask anything about your notes</p>
                <p className="mt-1 max-w-sm text-sm text-slate-500">
                  Pick one of your materials, or upload a PDF just for this chat.
                </p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                <p className="font-medium text-slate-800">What would you like to know?</p>
                <p className="mb-5 mt-1 text-sm text-slate-500">Try one of these, or type your own question.</p>
                <div className="flex max-w-lg flex-wrap justify-center gap-2">
                  {SUGGESTED_QUESTIONS.map((suggestion, index) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => askQuestion(suggestion)}
                      className="press animate-fade-up rounded-full border border-slate-200 bg-surface px-3.5 py-2 text-sm text-slate-700 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
                      style={{ animationDelay: `${index * 60}ms` }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message, index) => {
                const isUser = message.role === "user";

                return isUser ? (
                  <div key={index} className="flex animate-fade-up justify-end">
                    <div className="max-w-[80%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-cta px-4 py-2.5 text-sm leading-relaxed text-on-cta">
                      {message.content}
                    </div>
                  </div>
                ) : (
                  <div key={index} className="flex animate-fade-up gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cta text-on-cta">
                      <GraduationCap size={15} />
                    </div>
                    <div
                      className={`min-w-0 max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tl-md border px-4 py-3 text-sm leading-relaxed ${
                        message.isError ? "border-red-100 bg-red-50 text-red-700" : "border-slate-200/80 bg-surface text-slate-700"
                      }`}
                    >
                      <FormattedText text={message.content} />
                    </div>
                  </div>
                );
              })
            )}

            {isAsking && (
              <div className="flex animate-fade-up gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cta text-on-cta">
                  <GraduationCap size={15} />
                </div>
                <div className="flex items-center gap-1 rounded-2xl rounded-tl-md border border-slate-200/80 px-4 py-3.5" aria-label="Thinking">
                  {[0, 150, 300].map((delay) => (
                    <span key={delay} className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: `${delay}ms` }} />
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Question box */}
          <form onSubmit={handleSubmit} className="border-t border-slate-100 p-4">
            <div className="flex items-end gap-2 rounded-xl border border-slate-200 bg-surface p-1.5 pl-3.5 transition focus-within:border-pop-400 focus-within:ring-4 focus-within:ring-pop-100">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={!documentId || isLoadingDocument}
                rows={1}
                maxLength={2000}
                placeholder={documentId ? "Ask a follow-up question..." : "Select a PDF first"}
                className="max-h-32 min-h-[40px] flex-1 resize-none bg-transparent py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={!canAsk || !question.trim()}
                aria-label="Send question"
                className="press flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cta text-on-cta hover:bg-cta-hover disabled:opacity-40"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="mt-2 px-1 text-[11px] text-slate-400">Enter to send · Shift + Enter for a new line</p>
          </form>
        </section>

        {/* Right: material details and prompts (wide screens) */}
        <aside className="hidden min-h-0 animate-fade-up space-y-5 overflow-y-auto xl:block" style={{ animationDelay: "180ms" }}>
          <section className="rounded-2xl border border-slate-200/80 bg-surface p-4">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Attached material</h2>
            {selectedInfo ? (
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                    <FileText size={16} />
                  </span>
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-sm font-medium text-slate-800">{selected.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {selectedInfo.size}
                      {documentId ? ` · ${totalPages} pages` : ""}
                    </p>
                  </div>
                </div>
                <p className="mt-3 truncate text-xs text-slate-500">{selectedInfo.subject}</p>
                {selectedInfo.url && (
                  <a
                    href={selectedInfo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="press mt-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-surface px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Open PDF <ExternalLink size={13} />
                  </a>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No material selected.</p>
            )}
          </section>

          <section className="rounded-2xl border border-brand-100 bg-brand-50/60 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-brand-900">
              <Quote size={15} className="text-brand-600" />
              Need the exact definition?
            </div>
            <p className="text-sm leading-6 text-slate-600">
              By default answers are explained in simple words. To get the text exactly as written in your PDF, mention it in your question, for example:
            </p>
            <ul className="mt-3 space-y-1.5">
              {EXACT_WORDING_EXAMPLES.map((example) => (
                <li key={example} className="rounded-lg border border-brand-100 bg-surface px-3 py-2 text-[13px] text-slate-700">
                  “{example}”
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              The answer then quotes your PDF word for word, with the page number.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
