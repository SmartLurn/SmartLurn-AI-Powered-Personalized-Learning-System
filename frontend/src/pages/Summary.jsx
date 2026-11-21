import { useState } from "react";
import toast from "react-hot-toast";
import { ArrowLeft, ArrowRight, CheckCircle2, FileText, ListChecks, ScrollText, Wand2 } from "lucide-react";
import PageHeader from "../components/PageHeader";

// UI preview only: sample content, nothing is generated yet

const SAMPLE_MATERIALS = ["DBMS Unit 3 – Normalization", "Operating Systems Notes", "Computer Networks Unit 2"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];

const SAMPLE_QUESTIONS = [
  {
    question: "Which of the following is a property of Third Normal Form (3NF)?",
    options: [
      "It eliminates partial dependency only",
      "It eliminates transitive dependency",
      "It allows multivalued dependency",
      "It requires only a primary key",
    ],
    answer: 1,
  },
  {
    question: "A relation is in 2NF if it is in 1NF and has no…",
    options: ["Transitive dependency", "Partial dependency", "Multivalued dependency", "Foreign key"],
    answer: 1,
  },
  {
    question: "In BCNF, for every functional dependency X → Y, X must be a…",
    options: ["Candidate key", "Foreign key", "Superkey", "Prime attribute"],
    answer: 2,
  },
];

const SAMPLE_SUMMARY = [
  "Normalization organises tables to reduce redundancy and avoid update, insert and delete anomalies.",
  "1NF: every column holds atomic values; no repeating groups.",
  "2NF: in 1NF and no non-key attribute depends on part of a composite key.",
  "3NF: in 2NF and no transitive dependency between non-key attributes.",
  "BCNF: a stricter 3NF where every determinant is a superkey.",
];

const comingSoon = () => toast("Coming soon", { id: "coming-soon" });

const labelClass = "mb-1.5 block text-sm font-medium text-slate-700";
const selectClass =
  "h-11 w-full rounded-lg border border-slate-200 bg-surface px-3.5 text-sm text-slate-700 outline-none transition focus:border-pop-400 focus:ring-4 focus:ring-pop-100";

export default function Summary() {
  const [tab, setTab] = useState("quiz");
  const [difficulty, setDifficulty] = useState("Medium");
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState({}); // question index -> option index

  const question = SAMPLE_QUESTIONS[current];
  const chosen = selected[current];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Summaries & quizzes"
        badge="Preview"
        description="Turn any PDF into a short summary or a practice quiz."
      />

      {/* Tabs */}
      <div className="mb-5 inline-flex animate-fade-up rounded-lg border border-slate-200 bg-surface p-1" style={{ animationDelay: "60ms" }}>
        {[
          { id: "quiz", label: "Generate quiz", icon: ListChecks },
          { id: "summary", label: "Generate summary", icon: ScrollText },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`press inline-flex items-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium transition ${
              tab === id ? "bg-cta text-on-cta shadow-sm" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        {/* Settings */}
        <section className="animate-fade-up rounded-2xl border border-slate-200/80 bg-surface p-5" style={{ animationDelay: "120ms" }}>
          <h2 className="mb-4 text-sm font-semibold text-slate-900">
            {tab === "quiz" ? "Quiz settings" : "Summary settings"}
          </h2>

          <div className="space-y-4">
            <div>
              <label className={labelClass} htmlFor="material">Material</label>
              <select id="material" className={selectClass}>
                {SAMPLE_MATERIALS.map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>

            {tab === "quiz" ? (
              <>
                <div>
                  <span className={labelClass}>Difficulty</span>
                  <div className="grid grid-cols-3 gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
                    {DIFFICULTIES.map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setDifficulty(level)}
                        className={`press rounded-md py-2 text-sm font-medium transition ${
                          difficulty === level ? "bg-surface text-brand-700 shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={labelClass} htmlFor="count">Number of questions</label>
                  <select id="count" className={selectClass} defaultValue="10">
                    {[5, 10, 15, 20].map((n) => <option key={n}>{n}</option>)}
                  </select>
                </div>
              </>
            ) : (
              <div>
                <label className={labelClass} htmlFor="length">Length</label>
                <select id="length" className={selectClass} defaultValue="Short">
                  {["Short", "Detailed", "Key points only"].map((n) => <option key={n}>{n}</option>)}
                </select>
              </div>
            )}

            <button
              type="button"
              onClick={comingSoon}
              className="press flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-cta text-sm font-medium text-on-cta hover:bg-cta-hover"
            >
              <Wand2 size={16} />
              {tab === "quiz" ? "Generate quiz" : "Generate summary"}
            </button>
          </div>
        </section>

        {/* Preview */}
        {tab === "quiz" ? (
          <section key="quiz" className="animate-fade-up rounded-2xl border border-slate-200/80 bg-surface p-5 sm:p-6" style={{ animationDelay: "180ms" }}>
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-slate-900">Quiz preview</h2>
              <span className="text-xs font-medium text-slate-500">
                Question {current + 1} of {SAMPLE_QUESTIONS.length}
              </span>
            </div>

            {/* Progress */}
            <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-brand-500 transition-all duration-500"
                style={{ width: `${((current + 1) / SAMPLE_QUESTIONS.length) * 100}%` }}
              />
            </div>

            <p key={current} className="mb-5 animate-fade-up text-base font-medium leading-7 text-slate-900">
              {question.question}
            </p>

            <div className="space-y-2.5">
              {question.options.map((option, index) => {
                const isChosen = chosen === index;
                const isCorrect = chosen !== undefined && index === question.answer;
                const isWrong = isChosen && index !== question.answer;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSelected((prev) => ({ ...prev, [current]: index }))}
                    className={`press flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${
                      isCorrect
                        ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                        : isWrong
                        ? "border-rose-300 bg-rose-50 text-rose-800"
                        : "border-slate-200 text-slate-700 hover:border-brand-200 hover:bg-brand-50/40"
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                        isCorrect ? "border-emerald-500 bg-emerald-500 text-white" : isWrong ? "border-rose-500 bg-rose-500 text-white" : "border-slate-300 text-slate-500"
                      }`}
                    >
                      {String.fromCharCode(65 + index)}
                    </span>
                    {option}
                    {isCorrect && <CheckCircle2 size={17} className="ml-auto shrink-0 text-emerald-600" />}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrent((c) => Math.max(0, c - 1))}
                disabled={current === 0}
                className="press inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                <ArrowLeft size={15} /> Previous
              </button>
              <button
                type="button"
                onClick={() => (current === SAMPLE_QUESTIONS.length - 1 ? comingSoon() : setCurrent((c) => c + 1))}
                className="press inline-flex items-center gap-1.5 rounded-lg bg-cta px-4 py-2 text-sm font-medium text-on-cta hover:bg-cta-hover"
              >
                {current === SAMPLE_QUESTIONS.length - 1 ? "Finish" : "Next"} <ArrowRight size={15} />
              </button>
            </div>
          </section>
        ) : (
          <section key="summary" className="animate-fade-up rounded-2xl border border-slate-200/80 bg-surface p-5 sm:p-6" style={{ animationDelay: "180ms" }}>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                <FileText size={18} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Summary preview</h2>
                <p className="text-xs text-slate-500">DBMS Unit 3 – Normalization · pages 1–4</p>
              </div>
            </div>

            <ul className="space-y-3">
              {SAMPLE_SUMMARY.map((point, index) => (
                <li
                  key={point}
                  className="flex animate-fade-up gap-3 text-sm leading-6 text-slate-700"
                  style={{ animationDelay: `${220 + index * 60}ms` }}
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                  {point}
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-100 pt-5">
              <button type="button" onClick={comingSoon} className="press rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Copy summary
              </button>
              <button type="button" onClick={() => setTab("quiz")} className="press rounded-lg bg-cta px-4 py-2 text-sm font-medium text-on-cta hover:bg-cta-hover">
                Make a quiz from this
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
