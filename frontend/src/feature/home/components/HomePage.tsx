import Link from "next/link";
import { homeContent } from "../data/home.data";

export default function HomeContent() {
  return (
    <section className="mx-auto my-16 w-full max-w-[1320px] flex-1 px-6 lg:px-10">
      <h1 className="mb-8 text-center text-4xl font-semibold leading-tight text-[#212529] md:text-5xl">
        {homeContent.title}
      </h1>

      <p className="mx-auto max-w-5xl text-center text-lg leading-8 text-[#212529] md:text-xl">
        {homeContent.description}
      </p>

      <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
        {homeContent.sections.map((section) => (
          <article
            key={section.title}
            className="flex min-h-[320px] flex-col rounded-xl border border-black/10 bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="flex flex-1 flex-col items-center p-8 text-center md:p-10">
              <h2 className="mb-5 text-2xl font-semibold leading-snug text-[#212529] md:text-3xl">
                {section.title}
              </h2>

              <p className="mb-8 flex-1 text-base leading-8 text-[#212529] md:text-lg">
                {section.description}
              </p>

              <Link
                href={section.link}
                className="mt-auto inline-flex min-h-12 items-center justify-center rounded-lg bg-[rgb(248,107,25)] px-6 py-3 text-base font-bold text-white no-underline transition-colors duration-200 hover:bg-[darkorange]"
              >
                {section.button}
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}