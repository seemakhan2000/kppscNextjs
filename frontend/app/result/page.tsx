
import ResultsContent from "@/src/feature/results/components/ResultsContent";

export default function ResultsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white font-sans">
      <div className="bg-[#fff3f3] px-4 py-[5px] text-center text-sm font-bold text-red-600">
        Website updated on: 13 August, 2025
      </div>

      <ResultsContent />
    </div>
  );
}
