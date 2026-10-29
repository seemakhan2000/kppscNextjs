
"use client";

import { wings } from "../data/wings.data";

export default function WingsContent() {
  const handleLearnMore = (wingName: string) => {
    alert(`${wingName}: More information will be available soon.`);
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-[#198754] sm:text-4xl">
          KPPSC Wings / Departments
        </h1>

        <p className="mx-auto mt-3 max-w-2xl text-gray-600">
          Explore the different wings and departments responsible for
          recruitment, examinations, administration, and technical support.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {wings.map((wing) => (
          <article
            key={wing.id}
            className="flex flex-col rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <h2 className="mb-3 text-xl font-semibold text-[#198754]">
              {wing.title}
            </h2>

            <p className="mb-6 flex-1 leading-7 text-gray-600">
              {wing.description}
            </p>

            <button
              type="button"
              onClick={() => handleLearnMore(wing.title)}
              className="self-start rounded bg-[#fd7e14] px-5 py-2.5 font-medium text-white transition hover:bg-[#e96b05] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
            >
              Learn More
            </button>
          </article>
        ))}
      </div>
    </main>
  );
}
