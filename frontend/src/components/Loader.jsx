import React from 'react'
import { LoaderCircle } from 'lucide-react'

// Spinner with an optional message.
// fullScreen = true fills the whole page (for page-level loading).
const Loader = ({ text = "Loading...", fullScreen = false }) => {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${
        fullScreen ? "min-h-screen bg-[#faf9ff]" : "py-10"
      }`}
    >
      <LoaderCircle size={28} className="animate-spin text-violet-600" />

      {text && (
        <p className="text-sm font-medium text-slate-500">{text}</p>
      )}
    </div>
  )
}

export default Loader
