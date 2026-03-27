import Link from "next/link";

type InfoBlock = {
  title: string;
  text: string;
};

type InfoPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  blocks: InfoBlock[];
  ctaLabel?: string;
  ctaHref?: string;
};

export function InfoPage({
  eyebrow,
  title,
  description,
  blocks,
  ctaLabel,
  ctaHref,
}: InfoPageProps) {
  return (
    <main className="page-main">
      <div className="site-container space-y-8">
        <section className="panel-surface rounded-[34px] p-8 md:p-10">
          <div className="section-kicker mb-4">{eyebrow}</div>
          <h1 className="display-heading text-4xl font-black leading-[1.2] text-white md:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-4xl text-lg leading-8 text-[#B8B2A8]">
            {description}
          </p>
          {ctaLabel && ctaHref ? (
            <div className="mt-8">
              <Link
                href={ctaHref}
                className="inline-flex rounded-full bg-[#D4AF37] px-6 py-3 text-sm font-bold text-black transition hover:translate-y-[-1px] hover:bg-[#E5C25B]"
              >
                {ctaLabel}
              </Link>
            </div>
          ) : null}
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          {blocks.map((block) => (
            <article
              key={block.title}
              className="panel-surface rounded-[28px] p-6 md:p-7"
            >
              <h2 className="display-heading text-2xl font-black text-white">
                {block.title}
              </h2>
              <p className="mt-4 text-base leading-8 text-[#B8B2A8]">
                {block.text}
              </p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
