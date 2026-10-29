"use client";

import { eLetters } from "../data/eLetters.data";

const tableHeadings = [
  "#",
  "Letter Title",
  "Date Issued",
  "Reference No.",
  "Download",
];

export default function ELettersContent() {
  const handlePdfClick = (title: string) => {
    alert(`${title}: PDF will be available soon.`);
  };

  return (
    <main className="mx-auto my-10 w-full max-w-7xl flex-1 px-4 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-center text-2xl font-semibold text-gray-800 sm:text-3xl">
        E-Letters / Notifications
      </h1>

      <div className="overflow-x-auto rounded-sm">
        <table className="w-full min-w-[750px] border-collapse text-left text-sm text-gray-800">
          <thead className="bg-[#d1e7dd] text-gray-900">
            <tr>
              {tableHeadings.map((heading) => (
                <th
                  key={heading}
                  scope="col"
                  className="border border-gray-300 px-4 py-3 font-semibold"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {eLetters.map((letter, index) => (
              <tr
                key={letter.id}
                className={
                  index % 2 === 0
                    ? "bg-white hover:bg-green-50"
                    : "bg-gray-50 hover:bg-green-50"
                }
              >
                <td className="border border-gray-300 px-4 py-3">
                  {letter.id}
                </td>

                <td className="border border-gray-300 px-4 py-3 font-medium">
                  {letter.title}
                </td>

                <td className="whitespace-nowrap border border-gray-300 px-4 py-3">
                  {letter.dateIssued}
                </td>

                <td className="whitespace-nowrap border border-gray-300 px-4 py-3">
                  {letter.referenceNo}
                </td>

                <td className="border border-gray-300 px-4 py-3">
                  <button
                    type="button"
                    onClick={() => handlePdfClick(letter.title)}
                    className="inline-flex cursor-pointer rounded border border-gray-500 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-700 hover:text-white"
                  >
                    PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-6 text-center text-sm text-gray-700 sm:text-base">
        For full list of e-letters, please{" "}
        <button
          type="button"
          onClick={() => handlePdfClick("All E-Letters")}
          className="ml-1 inline-flex cursor-pointer rounded bg-[#f86b19] px-3 py-2 font-semibold text-white transition hover:bg-orange-600"
        >
          Download All PDFs
        </button>
      </p>
    </main>
  );
}