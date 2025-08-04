// components/BlockSpinner.jsx
import React from "react";

export default function BlockSpinner() {
  return (
    <div className="flex items-center justify-center h-screen gap-2">
      <div className="w-4 h-4 bg-cyan-500 rounded-sm animate-fade-delay-0"></div>
      <div className="w-4 h-4 bg-cyan-500 rounded-sm animate-fade-delay-1"></div>
      <div className="w-4 h-4 bg-cyan-500 rounded-sm animate-fade-delay-2"></div>
      <div className="w-4 h-4 bg-cyan-500 rounded-sm animate-fade-delay-3"></div>
    </div>
  );
}
