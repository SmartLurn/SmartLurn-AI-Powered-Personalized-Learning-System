
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Upload } from "lucide-react";
import toast from "react-hot-toast";
import api from "../config/api";
import Loader from "../components/Loader";
import PageHeader from "../components/PageHeader";

import MaterialFilters from "../components/materials/MaterialFilter";
import MaterialCard from "../components/materials/MaterialCard";
import EmptyMaterials from "../components/materials/EmptyMaterials";
import UploadMaterialModal from "../components/materials/UploadMaterialModal";

export default function StudyMaterials() {
  const navigate = useNavigate();
  const location = useLocation();

  const [materials, setMaterials] = useState([]);
  // Can be filled from the top-bar search or opened from the dashboard "Upload PDF" button
  const [search, setSearch] = useState(location.state?.search || "");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [isUploadOpen, setIsUploadOpen] = useState(Boolean(location.state?.upload));

  // A new search from the top bar while already on this page
  useEffect(() => {
    if (location.state?.search !== undefined) setSearch(location.state.search);
    if (location.state?.upload) setIsUploadOpen(true);
  }, [location.state]);
  const [isLoading, setIsLoading] = useState(true);

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

  // Load the user's materials from the backend
  useEffect(() => {
    const loadMaterials = async () => {
      try {
        const { data } = await api.get("/materials");
        setMaterials(data.materials);
      } catch (error) {
        toast.error(error.response?.data?.message || "Could not load materials");
      } finally {
        setIsLoading(false);
      }
    };

    loadMaterials();
  }, []);

  // Upload the PDF to the backend. Returns true on success so the modal can close.
  const handleUpload = async ({ title, subject, description, file }) => {
    // Files are sent as multipart form data, not JSON
    const formData = new FormData();
    formData.append("title", title);
    formData.append("subject", subject);
    formData.append("description", description);
    formData.append("file", file);

    try {
      const { data } = await api.post("/materials", formData);

      setMaterials((previousMaterials) => [
        data.material,
        ...previousMaterials,
      ]);

      // Reset filters so the new material is visible
      setSearch("");
      setSelectedSubject("All");

      toast.success("Material added to your library!");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not upload material");
      return false;
    }
  };

  const handleDelete = async (material) => {
    if (!window.confirm(`Delete "${material.title}"? This cannot be undone.`)) return;

    try {
      await api.delete(`/materials/${material.id}`);
      setMaterials((previousMaterials) =>
        previousMaterials.filter((m) => m.id !== material.id)
      );
      toast.success("Material deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not delete material");
    }
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
      toast("This material has no PDF attached.");
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
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Study materials"
        description="Your PDFs in one place. Ask the AI about any of them or start a quiz."
        actions={
          <button
            type="button"
            onClick={() => setIsUploadOpen(true)}
            className="press inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
          >
            <Upload size={16} />
            Upload PDF
          </button>
        }
      />

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

      {/* Loading, empty library, no search matches, or material cards */}
      {isLoading ? (
        <Loader text="Loading materials..." />
      ) : materials.length === 0 ? (
        <EmptyMaterials onUpload={() => setIsUploadOpen(true)} />
      ) : filteredMaterials.length === 0 ? (
        <div className="rounded-2xl border border-brand-100 bg-surface px-6 py-12 text-center">
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
                onDelete={handleDelete}
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
