import { Routes, Route } from "react-router";
import type { ApiResponse } from "@substrack/shared";

function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">SubsTrack</h1>
        <p className="text-lg text-gray-600 mb-8">
          Track your subscriptions, save money.
        </p>
        <p className="text-sm text-gray-400">Phase 1 scaffolding complete</p>
      </div>
    </div>
  );
}

// Verify cross-package type import works
const _typeCheck: ApiResponse = { success: true };

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
    </Routes>
  );
}
