import Image from "next/image";

export default function Header() {
  return (
    <header className="relative w-full overflow-hidden bg-white">
      <Image
        src="/images/KP-PSC-new-header-banner-2024.jpg"
        alt="Khyber Pakhtunkhwa Public Service Commission"
        width={1920}
        height={300}
        priority
        className="h-auto max-h-[400px] w-full object-cover object-center"
      />
    </header>
  );
}