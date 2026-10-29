
import AdvertisementContent from "@/src/feature/advertisement/components/AdvertisementContent";

export default function AdvertisementPage() {
  return (
    <main className="flex min-h-screen flex-col bg-white">
      <div className="bg-[#fff3f3] px-4 py-[5px] text-center text-sm font-bold text-red-600">
        Website updated on: 13 August, 2025
      </div>

      <AdvertisementContent />
    </main>
  );
}
