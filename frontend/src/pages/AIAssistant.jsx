import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Sparkles,
  FileText,
  Upload,
  Send,
  LoaderCircle,
  Bot,
  User,
  BookOpen,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../config/api";
import aiApi, { getAiError } from "../config/aiApi";
import Loader from "../components/Loader";

const SUGGESTED_QUESTIONS = [
  "Summarize this material in simple words",
  "What are the key concepts I should know?",
  "Give me 5 practice questions with answers",
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
        className="my-2 rounded-r-lg border-l-4 border-violet-400 bg-white px-3 py-2 italic text-slate-800"
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
  const messagesEndRef = useRef(null);

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

        // Clear the state so a page refresh doesn't reload it
        navigate(location.pathname, { replace: true, state: null });
      }
    };

    loadMaterials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the newest message in view
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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

  return (
    <div className="min-h-full bg-[#FAF9FF] px-4 py-6 sm:px-8">
      {/* Page heading */}
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-2 text-violet-600">
          <Sparkles size={22} />
          <span className="text-sm font-medium">SmartLurn AI</span>
        </div>

        <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
          AI Study Assistant
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Pick a PDF and ask questions about it. Answers come from your material.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[300px_1fr]">
        {/* Left: choose a PDF */}
        <aside className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm lg:max-h-[calc(100vh-200px)] lg:overflow-y-auto">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoadingDocument}
            className="mb-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-violet-700 disabled:opacity-60"
          >
            <Upload size={16} />
            Upload a PDF
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />

          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Your study materials
          </h2>

          {isLoadingMaterials ? (
            <Loader text="" />
          ) : materials.length === 0 ? (
            <div className="rounded-xl bg-violet-50 p-4 text-center text-sm text-slate-500">
              <BookOpen size={20} className="mx-auto mb-2 text-violet-500" />
              No materials yet. Upload a PDF above or add one in Study Materials.
            </div>
          ) : (
            <ul className="space-y-1">
              {materials.map((material) => {
                const key = `material-${material.id}`;
                const isActive = selected?.key === key;

                return (
                  <li key={material.id}>
                    <button
                      type="button"
                      disabled={isLoadingDocument}
                      onClick={() =>
                        !isActive &&
                        selectSource({ key, title: material.title, material })
                      }
                      className={`flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition disabled:cursor-not-allowed ${
                        isActive
                          ? "bg-violet-100 text-violet-700"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <FileText size={18} className="mt-0.5 shrink-0" />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">
                          {material.title}
                        </span>
                        <span className="block truncate text-xs text-slate-400">
                          {material.subject}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        {/* Right: chat */}
        <section className="flex h-[calc(100vh-200px)] min-h-[480px] flex-col rounded-2xl border border-violet-100 bg-white shadow-sm">
          {/* Selected PDF */}
          <div className="flex items-center gap-3 border-b border-violet-100 px-5 py-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
              <FileText size={20} />
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-800">
                {selected ? selected.title : "No PDF selected"}
              </p>
              <p className="text-xs text-slate-500">
                {isLoadingDocument
                  ? "Reading PDF..."
                  : documentId
                  ? `${totalPages} pages with text · ready for questions`
                  : "Choose a material or upload a PDF to start"}
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
            {isLoadingDocument ? (
              <Loader text="Reading your PDF..." />
            ) : !documentId ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <Bot size={40} className="mb-3 text-violet-400" />
                <p className="font-medium text-slate-700">
                  Ask anything about your study material
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Select a PDF on the left to begin.
                </p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <Sparkles size={36} className="mb-3 text-violet-400" />
                <p className="mb-4 font-medium text-slate-700">
                  What would you like to know?
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {SUGGESTED_QUESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => askQuestion(suggestion)}
                      className="rounded-full border border-violet-200 px-4 py-2 text-sm text-violet-700 transition hover:bg-violet-50"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message, index) => {
                const isUser = message.role === "user";

                return (
                  <div
                    key={index}
                    className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        isUser
                          ? "bg-violet-600 text-white"
                          : "bg-violet-100 text-violet-600"
                      }`}
                    >
                      {isUser ? <User size={16} /> : <Bot size={16} />}
                    </div>

                    <div
                      className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        isUser
                          ? "bg-violet-600 text-white"
                          : message.isError
                          ? "bg-red-50 text-red-600"
                          : "bg-slate-50 text-slate-700"
                      }`}
                    >
                      <FormattedText text={message.content} />
                    </div>
                  </div>
                );
              })
            )}

            {isAsking && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <LoaderCircle size={16} className="animate-spin text-violet-600" />
                Thinking...
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Question box */}
          <form
            onSubmit={handleSubmit}
            className="flex items-end gap-2 border-t border-violet-100 p-4"
          >
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!documentId || isLoadingDocument}
              rows={1}
              maxLength={2000}
              placeholder={
                documentId ? "Ask a question about this PDF..." : "Select a PDF first"
              }
              className="max-h-32 min-h-[46px] flex-1 resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100 disabled:bg-slate-50"
            />
            <button
              type="submit"
              disabled={!canAsk || !question.trim()}
              aria-label="Send question"
              className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white transition hover:bg-violet-700 disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
