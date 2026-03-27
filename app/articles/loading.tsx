export default function ArticlesLoading() {
  return (
    <main className="page-main">
      <div className="site-container space-y-6">
        <div className="h-64 animate-pulse rounded-[34px] border border-white/8 bg-white/5" />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-[420px] animate-pulse rounded-[30px] border border-white/8 bg-white/5"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
