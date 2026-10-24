
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Upload } from "lucide-react";
import toast from "react-hot-toast";

import MaterialFilters from "../components/materials/MaterialFilter";
import MaterialCard from "../components/materials/MaterialCard";
import EmptyMaterials from "../components/materials/EmptyMaterials";
import UploadMaterialModal from "../components/materials/UploadMaterialModal";

// Temporary data for UI development
const dummyMaterials = [
  {
    id: "1",
    title: "Data Structures Notes",
    subject: "Computer Science",
    description: "Arrays, linked lists, stacks, and queues.",
    fileType: "PDF",
    fileSize: "2.4 MB",
    uploadedAt: "2026-10-20",
    fileUrl: "",
  },
  {
    id: "2",
    title: "Operating Systems Revision",
    subject: "Operating Systems",
    description: "Processes, threads, scheduling, and memory management.",
    fileType: "PDF",
    fileSize: "3.1 MB",
    uploadedAt: "2026-10-21",
    fileUrl: "",
  },
  {
    id: "3",
    title: "Computer Networks Unit 1",
    subject: "Computer Networks",
    description: "Networking fundamentals and communication protocols.",
    fileType: "PDF",
    fileSize: "1.8 MB",
    uploadedAt: "2026-10-22",
    fileUrl: "",
  },
];

export default function StudyMaterials() {
  const navigate = useNavigate();

  const [materials, setMaterials] = useState(dummyMaterials);
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Generate filter options from available materials
  const subjects = useMemo(
    () => [...new Set(materials.map((material) => material.subject))].sort(),
    [materials]
  );



  // Search and filter materials
 const filteredMaterials = useMemo(() => {
  const query = search.toLowerCase().trim();

  return materials.filter((material) => {
    const matchesSearch =
      material.title.toLowerCase().includes(query) ||
      material.subject.toLowerCase().includes(query) ||
      (material.description || "").toLowerCase().includes(query);

    const matchesSubject =
      selectedSubject === "All" ||
      material.subject === selectedSubject;

    return matchesSearch && matchesSubject;
  });
}, [materials, search, selectedSubject]);

  // Add selected PDF to the frontend list
  const handleUpload = ({ title, subject, description, file }) => {
    const newMaterial = {
      id: crypto.randomUUID(),
      title,
      subject,
      description,
      fileType: "PDF",
      fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      uploadedAt: new Date().toISOString(),
      fileUrl: URL.createObjectURL(file),
      fileName: file.name,
    };

    setMaterials((previousMaterials) => [
      newMaterial,
      ...previousMaterials,
    ]);

    // Reset filters so the new material is visible
    setSearch("");
    setSelectedSubject("All");

    toast.success("Material added to your library!");
  };

  const handleAskAI = (material) => {
    navigate("/ai-assistant", {
      state: {
        materialId: material.id,
        title: material.title,
        fileUrl: material.fileUrl,
      },
    });
  };

  const handleOpenPDF = (material) => {
    if (!material.fileUrl) {
      toast("This sample has no PDF attached yet.");
      return;
    }

    window.open(material.fileUrl, "_blank", "noopener,noreferrer");
  };

  const handleStartQuiz = (material) => {
    navigate("/summaries-quizzes", {
      state: {
        materialId: material.id,
        title: material.title,
        fileUrl: material.fileUrl,
        mode: "quiz",
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF9FF] px-4 py-6 sm:px-8">
      {/* Page heading */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-violet-600">
            <BookOpen size={22} />
            <span className="text-sm font-medium">SmartLurn Library</span>
          </div>

          <h1 className="text-3xl font-bold text-slate-800">
            Study Materials
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Upload, organize, and explore your study resources.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsUploadOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-medium text-white transition hover:bg-violet-700"
        >
          <Upload size={18} />
          Upload Material
        </button>
      </div>

      {/* Only show search and filters when materials exist */}
      {materials.length > 0 && (
        <MaterialFilters
          search={search}
          setSearch={setSearch}
          selectedSubject={selectedSubject}
          setSelectedSubject={setSelectedSubject}
          subjects={subjects}
          
        />
      )}

      {/* Empty library, no search matches, or material cards */}
      {materials.length === 0 ? (
        <EmptyMaterials onUpload={() => setIsUploadOpen(true)} />
      ) : filteredMaterials.length === 0 ? (
        <div className="rounded-2xl border border-violet-100 bg-white px-6 py-12 text-center">
          <h2 className="font-semibold text-slate-800">
            No matching materials
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Try another search or clear your filters.
          </p>
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-slate-500">
            Showing {filteredMaterials.length} of {materials.length} materials
          </p>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredMaterials.map((material) => (
              <MaterialCard
                key={material.id}
                material={material}
                onAskAI={handleAskAI}
                onOpenPDF={handleOpenPDF}
                onStartQuiz={handleStartQuiz}
              />
            ))}
          </div>
        </>
      )}

      {/* Upload modal */}
      <UploadMaterialModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={handleUpload}
      />
    </div>
  );
}
