
import WingsContent from "@/src/feature/wings/components/WingsContent";

export default function WingsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white font-sans">
      <div className="bg-[#fff3f3] px-4 py-[5px] text-center text-sm font-bold text-red-600">
        Website updated on: 13 August, 2025
      </div>

      <WingsContent />
    </div>
  );
}
